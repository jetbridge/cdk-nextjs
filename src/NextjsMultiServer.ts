import * as fs from "fs";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { Stack } from "aws-cdk-lib";
import { Code, Function, FunctionOptions } from "aws-cdk-lib/aws-lambda";
import { Bucket, IBucket } from "aws-cdk-lib/aws-s3";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
import { Construct } from "constructs";

import { CACHE_BUCKET_KEY_PREFIX } from "./constants";
import {
  OptionalAssetProps,
  OptionalFunctionProps,
  OptionalNextjsBucketDeploymentProps,
} from "./generated-structs";
import { NextjsProps } from "./Nextjs";
import { NextjsBucketDeployment } from "./NextjsBucketDeployment";
import { NextjsBuild } from "./NextjsBuild";
import {
  detectFunctionType,
  getDescriptionForType,
  getOptimizedFunctionProps,
  LambdaFunctionType,
} from "./utils/common-lambda-props";
import { createArchive } from "./utils/create-archive";
import { ParsedServerFunction } from "./utils/open-next-types";

export interface NextjsMultiServerOverrides {
  readonly sourceCodeAssetProps?: OptionalAssetProps;
  readonly destinationCodeAssetProps?: OptionalAssetProps;
  readonly functionProps?: OptionalFunctionProps;
  readonly nextjsBucketDeploymentProps?: OptionalNextjsBucketDeploymentProps;
}

export type EnvironmentVars = Record<string, string>;

export interface NextjsMultiServerProps {
  /**
   * @see {@link NextjsProps.environment}
   */
  readonly environment?: NextjsProps["environment"];
  /**
   * Override function properties.
   */
  readonly lambda?: FunctionOptions;
  /**
   * @see {@link NextjsBuild}
   */
  readonly nextBuild: NextjsBuild;
  /**
   * Override props for every construct.
   */
  readonly overrides?: NextjsMultiServerOverrides;
  /**
   * @see {@link NextjsProps.quiet}
   */
  readonly quiet?: NextjsProps["quiet"];
  /**
   * Static asset bucket. Function needs bucket to read from cache.
   */
  readonly staticAssetBucket: IBucket;
  /**
   * Whether to use multi-server mode based on open-next.output.json
   * @default false
   */
  readonly enableMultiServer?: boolean;
  /**
   * Only create Lambda functions that are actually used in CloudFront behaviors
   * This can significantly reduce costs by avoiding unused functions
   * @default false
   */
  readonly createOnlyUsedFunctions?: boolean;
}

/**
 * Build Lambda functions from a NextJS application to handle server-side rendering, API routes, and image optimization.
 * Supports both single and multi-server configurations with automatic optimization based on function types.
 */
export class NextjsMultiServer extends Construct {
  configBucket?: Bucket;

  /**
   * The primary Lambda function (default server function)
   */
  lambdaFunction: Function;

  /**
   * Map of all server functions created in multi-server mode
   */
  serverFunctions: Map<string, Function> = new Map();

  private props: NextjsMultiServerProps;

  /**
   * Cache for source code assets to avoid recreating identical assets
   */
  private assetCache: Map<string, Asset> = new Map();

  private get environment(): Record<string, string> {
    return {
      ...this.props.environment,
      ...this.props.lambda?.environment,
      CACHE_BUCKET_NAME: this.props.staticAssetBucket.bucketName,
      CACHE_BUCKET_REGION: Stack.of(this.props.staticAssetBucket).region,
      CACHE_BUCKET_KEY_PREFIX,
    };
  }

  constructor(scope: Construct, id: string, props: NextjsMultiServerProps) {
    super(scope, id);
    this.props = props;

    try {
      if (props.enableMultiServer) {
        this.log("Initializing multi-server mode");
        this.createMultiServerFunctions();
      } else {
        this.log("Initializing single-server mode");
        this.createSingleServerFunction();
      }
    } catch (error) {
      this.logError(
        `Failed to initialize NextjsMultiServer: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Enhanced logging method
   */
  private log(
    message: string,
    level: "info" | "warn" | "error" = "info",
  ): void {
    if (this.props.quiet) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [NextjsMultiServer] ${message}`;

    switch (level) {
      case "error":
        console.error(logMessage);
        break;
      case "warn":
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  private logError(message: string): void {
    this.log(message, "error");
  }

  private logWarn(message: string): void {
    this.log(message, "warn");
  }

  /**
   * Creates multiple server functions based on open-next.output.json with enhanced error handling
   * Supports conditional creation to avoid unused functions
   */
  private createMultiServerFunctions() {
    try {
      const serverFunctions = this.props.nextBuild.getServerFunctions();

      if (serverFunctions.length === 0) {
        this.logWarn(
          "No server functions found in open-next.output.json, falling back to single server mode",
        );
        this.createSingleServerFunction();
        return;
      }

      // Get functions that are actually used in CloudFront behaviors
      let functionsToCreate = serverFunctions;
      if (this.props.createOnlyUsedFunctions) {
        const behaviorProcessor = this.props.nextBuild.getBehaviorProcessor();
        const usedFunctionNames = behaviorProcessor.getUsedFunctionNames();

        functionsToCreate = serverFunctions.filter((fn) =>
          usedFunctionNames.includes(fn.name),
        );

        this.log(
          `Conditional creation enabled: Creating ${functionsToCreate.length}/${serverFunctions.length} functions`,
        );
        this.log(`Used functions: ${usedFunctionNames.join(", ")}`);

        const skippedFunctions = serverFunctions.filter(
          (fn) => !usedFunctionNames.includes(fn.name),
        );
        if (skippedFunctions.length > 0) {
          this.log(
            `Skipping unused functions: ${skippedFunctions.map((fn) => fn.name).join(", ")}`,
          );
        }
      } else {
        this.log(`Creating all ${serverFunctions.length} server functions`);
      }

      const createdFunctions: Function[] = [];
      const failedFunctions: Array<{ name: string; error: string }> = [];

      for (const serverFunction of functionsToCreate) {
        try {
          this.log(`Creating server function: ${serverFunction.name}`);
          const fn = this.createServerFunction(serverFunction);
          this.serverFunctions.set(serverFunction.name, fn);
          createdFunctions.push(fn);

          // Set the default function as the main one for backwards compatibility
          if (serverFunction.name === "default" || !this.lambdaFunction) {
            this.lambdaFunction = fn;
          }
        } catch (error) {
          const errorMessage = `Failed to create function ${serverFunction.name}: ${error instanceof Error ? error.message : String(error)}`;
          this.logError(errorMessage);
          failedFunctions.push({
            name: serverFunction.name,
            error: errorMessage,
          });
        }
      }

      // If no functions were created successfully, fall back to single server
      if (createdFunctions.length === 0) {
        this.logError(
          "All server functions failed to create, falling back to single server mode",
        );
        this.createSingleServerFunction();
        return;
      }

      // If some functions failed, log warnings but continue
      if (failedFunctions.length > 0) {
        this.logWarn(
          `${failedFunctions.length} functions failed to create: ${failedFunctions.map((f) => f.name).join(", ")}`,
        );
      }

      this.log(
        `Successfully created ${createdFunctions.length} server functions`,
      );
    } catch (error) {
      this.logError(
        `Failed to create multi-server functions: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.logWarn("Falling back to single server mode");
      this.createSingleServerFunction();
    }
  }

  /**
   * Creates a single server function (legacy behavior) with error handling
   */
  private createSingleServerFunction() {
    try {
      this.log("Creating single server function");

      const sourceAsset = this.createSourceCodeAsset(
        this.props.nextBuild.nextServerFnDir,
        "default",
      );

      const destinationAsset = this.createDestinationCodeAsset();

      const bucketDeployment = this.createBucketDeployment(
        sourceAsset,
        destinationAsset,
      );

      this.lambdaFunction = this.createFunction(destinationAsset, "default");
      this.lambdaFunction.node.addDependency(bucketDeployment);

      this.log("Successfully created single server function");
    } catch (error) {
      this.logError(
        `Failed to create single server function: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new Error(
        `Critical failure: Unable to create any server functions - ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Creates a specific server function with enhanced error handling
   * Each function gets its own unique destination asset to prevent code mixing
   */
  private createServerFunction(serverFunction: ParsedServerFunction): Function {
    try {
      this.log(
        `Processing server function ${serverFunction.name} at ${serverFunction.bundlePath}`,
      );

      // Validate bundle path exists
      if (!fs.existsSync(serverFunction.bundlePath)) {
        throw new Error(
          `Bundle path does not exist: ${serverFunction.bundlePath}`,
        );
      }

      // Create or reuse source asset
      const sourceAsset = this.createSourceCodeAsset(
        serverFunction.bundlePath,
        serverFunction.name,
      );

      // Create unique destination asset for each function to prevent code mixing
      const destinationAsset = this.createDestinationCodeAsset();

      // Create bucket deployment
      const bucketDeployment = this.createBucketDeployment(
        sourceAsset,
        destinationAsset,
      );

      // Create function with destination asset
      const fn = this.createFunction(destinationAsset, serverFunction.name, {
        handler: serverFunction.handler,
        streaming: serverFunction.streaming,
      });

      // Ensure function waits for deployment
      fn.node.addDependency(bucketDeployment);

      this.log(`Successfully created server function: ${serverFunction.name}`);
      return fn;
    } catch (error) {
      this.logError(
        `Failed to create server function ${serverFunction.name}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Enhanced source code asset creation with caching
   */
  private createSourceCodeAsset(bundlePath: string, functionName?: string) {
    try {
      // Check cache first for performance optimization
      const cacheKey = `${bundlePath}-${functionName || "default"}`;
      if (this.assetCache.has(cacheKey)) {
        this.log(`Reusing cached asset for ${cacheKey}`);
        return this.assetCache.get(cacheKey)!;
      }

      this.log(`Creating archive for ${bundlePath}`);
      const archivePath = createArchive({
        directory: bundlePath,
        quiet: this.props.quiet,
        zipFileName: `server-fn-${functionName || "default"}.zip`,
      });

      const assetId = `SourceCodeAsset-${functionName || bundlePath.split("/").pop() || "unknown"}`;
      const asset = new Asset(this, assetId, {
        path: archivePath,
        ...this.props.overrides?.sourceCodeAssetProps,
      });

      // Cache the asset for potential reuse
      this.assetCache.set(cacheKey, asset);

      // Clean up temporary archive with error handling
      try {
        rmSync(archivePath, { recursive: true });
      } catch (cleanupError) {
        this.logWarn(
          `Failed to cleanup temporary archive ${archivePath}: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`,
        );
      }

      return asset;
    } catch (error) {
      this.logError(
        `Failed to create source code asset for ${bundlePath}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Optimized destination code asset creation with caching
   */
  private createDestinationCodeAsset() {
    try {
      const uniqueId = randomUUID();
      const assetsTmpDir = mkdtempSync(
        resolve(tmpdir(), "bucket-deployment-dest-asset-"),
      );

      writeFileSync(
        resolve(assetsTmpDir, "index.mjs"),
        `export function handler() { return '${uniqueId}' }`,
      );

      const destinationAsset = new Asset(
        this,
        `DestinationCodeAsset-${uniqueId}`,
        {
          path: assetsTmpDir,
          ...this.props.overrides?.destinationCodeAssetProps,
        },
      );

      // Clean up with error handling
      try {
        rmSync(assetsTmpDir, { recursive: true });
      } catch (cleanupError) {
        this.logWarn(
          `Failed to cleanup temporary directory ${assetsTmpDir}: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`,
        );
      }

      return destinationAsset;
    } catch (error) {
      this.logError(
        `Failed to create destination code asset: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private createBucketDeployment(sourceAsset: Asset, destinationAsset: Asset) {
    try {
      const bucketDeployment = new NextjsBucketDeployment(
        this,
        `BucketDeployment-${sourceAsset.node.id}`,
        {
          asset: sourceAsset,
          debug: !this.props.quiet, // Use quiet flag instead of hardcoded true
          destinationBucket: destinationAsset.bucket,
          destinationKeyPrefix: destinationAsset.s3ObjectKey,
          prune: false,
          substitutionConfig: NextjsBucketDeployment.getSubstitutionConfig(
            this.props.environment || {},
          ),
          zip: true,
          ...this.props.overrides?.nextjsBucketDeploymentProps,
        },
      );
      return bucketDeployment;
    } catch (error) {
      this.logError(
        `Failed to create bucket deployment: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Enhanced function creation with automatic optimization based on function type
   */
  private createFunction(
    codeAsset: Asset,
    functionName: string,
    options?: { handler?: string; streaming?: boolean },
  ) {
    try {
      this.log(`Creating Lambda function: ${functionName}`);

      // 사용자 환경변수와 기본 환경변수 병합
      const userEnvironment = {
        ...this.environment,
        ...this.props.lambda?.environment,
      };

      // 새로운 최적화 시스템 사용 (환경변수 포함)
      const functionProps = getOptimizedFunctionProps(
        this,
        functionName,
        userEnvironment,
      );

      // 함수별 고유한 설명 생성 (patterns 포함)
      const customDescription = this.generateFunctionDescription(functionName);

      const fn = new Function(this, `Fn-${functionName}`, {
        ...functionProps,
        code: Code.fromBucket(codeAsset.bucket, codeAsset.s3ObjectKey),
        handler: options?.handler || "index.handler",
        description: customDescription, // 커스텀 설명 사용
        ...this.props.lambda,
        environment: functionProps.environment,
        ...this.props.overrides?.functionProps,
      });

      this.props.staticAssetBucket.grantReadWrite(fn);

      // 감지된 함수 타입과 환경변수 로깅
      const detectedType = detectFunctionType(functionName);
      this.log(
        `Successfully created Lambda function: ${functionName} (Type: ${detectedType}, Description: "${customDescription}")`,
      );

      return fn;
    } catch (error) {
      this.logError(
        `Failed to create Lambda function ${functionName}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * 함수별 고유한 설명을 생성합니다 (처리하는 patterns 포함)
   * Enhanced with pre-processed behavior data
   */
  private generateFunctionDescription(functionName: string): string {
    try {
      // 기본 타입별 설명 가져오기
      const functionType = detectFunctionType(functionName);
      const baseDescription = this.getBaseDescriptionForType(functionType);

      // 새로운 방식: 미리 처리된 behaviors에서 직접 조회
      const behaviors =
        this.props.nextBuild.getBehaviorsForFunction(functionName);

      if (behaviors.length > 0) {
        const patterns = behaviors
          .map((b) => b.pattern)
          .filter((pattern) => pattern !== "*"); // 와일드카드 제외

        if (patterns.length > 0) {
          const patternInfo = patterns.join(", ");
          return `${baseDescription} | Handles: ${patternInfo}`;
        }
      }

      // patterns이 없으면 함수 이름으로 구분
      return `${baseDescription} | Function: ${functionName}`;
    } catch (error) {
      this.logWarn(
        `Failed to generate description for ${functionName}: ${error}`,
      );
      return `Next.js Function | ${functionName}`;
    }
  }

  /**
   * 함수 타입별 기본 설명을 반환합니다
   */
  private getBaseDescriptionForType(functionType: LambdaFunctionType): string {
    return getDescriptionForType(functionType);
  }

  /**
   * Gets a server function by name with error handling
   */
  public getServerFunction(name: string): Function | undefined {
    try {
      return this.serverFunctions.get(name);
    } catch (error) {
      this.logError(
        `Failed to get server function ${name}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return undefined;
    }
  }

  /**
   * Gets all server function names with error handling
   */
  public getServerFunctionNames(): string[] {
    try {
      return Array.from(this.serverFunctions.keys());
    } catch (error) {
      this.logError(
        `Failed to get server function names: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  /**
   * Health check method for monitoring
   */
  public getHealthStatus(): {
    totalFunctions: number;
    functionNames: string[];
    hasMainFunction: boolean;
    enabledMultiServer: boolean;
  } {
    return {
      totalFunctions: this.serverFunctions.size,
      functionNames: this.getServerFunctionNames(),
      hasMainFunction: !!this.lambdaFunction,
      enabledMultiServer: !!this.props.enableMultiServer,
    };
  }
}
