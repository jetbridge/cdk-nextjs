import { Stack } from 'aws-cdk-lib';
import { Code, Function, FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';
import * as fs from 'fs';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { CACHE_BUCKET_KEY_PREFIX, MAX_INLINE_ZIP_SIZE } from './constants';
import { OptionalAssetProps, OptionalFunctionProps, OptionalNextjsBucketDeploymentProps } from './generated-structs';
import { NextjsProps } from './Nextjs';
import { NextjsBucketDeployment } from './NextjsBucketDeployment';
import { NextjsBuild } from './NextjsBuild';
import {
  getDescriptionForType,
  getFunctionPropsFromServerFunction,
  getFunctionTypeFromServerFunction,
  LambdaFunctionType,
} from './utils/common-lambda-props';
import { createArchive } from './utils/create-archive';
import { ParsedServerFunction } from './utils/open-next-types';

/**
 * Default patterns to exclude from asset bundles
 *
 * Usage examples:
 *
 * // Use default exclude patterns
 * new NextjsMultiServer(this, 'MyServer', {
 *   // ... other props
 * });
 *
 * // Use custom exclude patterns
 * new NextjsMultiServer(this, 'MyServer', {
 *   excludePatterns: [
 *     '*.DS_Store',
 *     '*.log',
 *     'coverage/*',
 *     'custom-exclude-pattern/*'
 *   ],
 *   // ... other props
 * });
 *
 * // Disable all exclusions
 * new NextjsMultiServer(this, 'MyServer', {
 *   excludePatterns: [],
 *   // ... other props
 * });
 *
 * // Add to default patterns (merge with defaults)
 * new NextjsMultiServer(this, 'MyServer', {
 *   excludePatterns: [
 *     ...DEFAULT_EXCLUDE_PATTERNS,
 *     'my-custom-pattern/*',
 *     '*.custom-ext'
 *   ],
 *   // ... other props
 * });
 */
export const DEFAULT_EXCLUDE_PATTERNS = [] as const;

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
  readonly environment?: NextjsProps['environment'];
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
  readonly quiet?: NextjsProps['quiet'];
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
  /**
   * Patterns to exclude from asset bundles. These patterns will be used with CDK Asset's exclude feature.
   * If not provided, DEFAULT_EXCLUDE_PATTERNS will be used.
   * Set to an empty array to disable exclusions.
   * @default DEFAULT_EXCLUDE_PATTERNS
   */
  readonly excludePatterns?: string[];
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

    // Initialization logs - always output
    console.log(`[NextjsMultiServer] === INITIALIZATION START ===`);
    console.log(`[NextjsMultiServer] ID: ${id}`);
    console.log(`[NextjsMultiServer] Multi-server enabled: ${props.enableMultiServer || false}`);
    console.log(`[NextjsMultiServer] Create only used functions: ${props.createOnlyUsedFunctions || false}`);
    console.log(`[NextjsMultiServer] Quiet mode: ${props.quiet || false}`);
    console.log(`[NextjsMultiServer] excludePatterns provided in props: ${props.excludePatterns ? 'YES' : 'NO'}`);

    if (props.excludePatterns) {
      console.log(
        `[NextjsMultiServer] Custom excludePatterns (${props.excludePatterns.length} items):`,
        props.excludePatterns
      );
    } else {
      console.log(`[NextjsMultiServer] Will use DEFAULT_EXCLUDE_PATTERNS (${DEFAULT_EXCLUDE_PATTERNS.length} items):`, [
        ...DEFAULT_EXCLUDE_PATTERNS,
      ]);
    }

    console.log(`[NextjsMultiServer] === INITIALIZATION CONFIG END ===`);

    try {
      if (props.enableMultiServer) {
        this.log('Initializing multi-server mode');
        this.createMultiServerFunctions();
      } else {
        this.log('Initializing single-server mode');
        this.createSingleServerFunction();
      }
    } catch (error) {
      console.error(`[NextjsMultiServer] CRITICAL ERROR during initialization:`, error);
      this.logError(
        `Failed to initialize NextjsMultiServer: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Enhanced logging method
   */
  private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (this.props.quiet) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [NextjsMultiServer] ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  private logError(message: string): void {
    this.log(message, 'error');
  }

  private logWarn(message: string): void {
    this.log(message, 'warn');
  }

  /**
   * Creates multiple server functions based on open-next.output.json with enhanced error handling
   * Supports conditional creation to avoid unused functions
   */
  private createMultiServerFunctions() {
    try {
      const serverFunctions = this.props.nextBuild.getServerFunctions();

      if (serverFunctions.length === 0) {
        this.logWarn('No server functions found in open-next.output.json, falling back to single server mode');
        this.createSingleServerFunction();
        return;
      }

      // Get functions that are actually used in CloudFront behaviors
      let functionsToCreate = serverFunctions;
      if (this.props.createOnlyUsedFunctions) {
        const behaviorProcessor = this.props.nextBuild.getBehaviorProcessor();
        const usedFunctionNames = behaviorProcessor.getUsedFunctionNames();

        functionsToCreate = serverFunctions.filter((fn) => usedFunctionNames.includes(fn.name));

        this.log(
          `Conditional creation enabled: Creating ${functionsToCreate.length}/${serverFunctions.length} functions`
        );
        this.log(`Used functions: ${usedFunctionNames.join(', ')}`);

        const skippedFunctions = serverFunctions.filter((fn) => !usedFunctionNames.includes(fn.name));
        if (skippedFunctions.length > 0) {
          this.log(`Skipping unused functions: ${skippedFunctions.map((fn) => fn.name).join(', ')}`);
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
          if (serverFunction.name === 'default' || !this.lambdaFunction) {
            this.lambdaFunction = fn;
          }
        } catch (error) {
          const errorMessage = `Failed to create function ${serverFunction.name}: ${
            error instanceof Error ? error.message : String(error)
          }`;
          this.logError(errorMessage);
          failedFunctions.push({
            name: serverFunction.name,
            error: errorMessage,
          });
        }
      }

      // If no functions were created successfully, fall back to single server
      if (createdFunctions.length === 0) {
        this.logError('All server functions failed to create, falling back to single server mode');
        this.createSingleServerFunction();
        return;
      }

      // If some functions failed, log warnings but continue
      if (failedFunctions.length > 0) {
        this.logWarn(
          `${failedFunctions.length} functions failed to create: ${failedFunctions.map((f) => f.name).join(', ')}`
        );
      }

      this.log(`Successfully created ${createdFunctions.length} server functions`);
    } catch (error) {
      this.logError(
        `Failed to create multi-server functions: ${error instanceof Error ? error.message : String(error)}`
      );
      this.logWarn('Falling back to single server mode');
      this.createSingleServerFunction();
    }
  }

  /**
   * Creates a single server function (legacy behavior) with error handling
   */
  private createSingleServerFunction() {
    try {
      this.log('Creating single server function');

      // Build archive
      const archivePath = createArchive({
        directory: this.props.nextBuild.nextServerFnDir,
        quiet: this.props.quiet,
        zipFileName: 'server-fn-default.zip',
        excludePatterns: this.props.excludePatterns ?? [...DEFAULT_EXCLUDE_PATTERNS],
      });

      const zipStats = fs.statSync(archivePath);
      const useDirect = zipStats.size <= MAX_INLINE_ZIP_SIZE;

      const defaultServerFunction = this.props.nextBuild.getServerFunctions().find((fn) => fn.name === 'default');
      if (!defaultServerFunction) {
        throw new Error('Default server function not found in open-next.output.json');
      }

      if (useDirect) {
        this.lambdaFunction = this.createFunctionFromArchive(
          archivePath,
          defaultServerFunction,
          defaultServerFunction.handler
        );
        rmSync(archivePath, { recursive: true });
        this.log('Successfully created single server function (direct)');
        return;
      }

      const sourceAsset = new Asset(this, `SourceZip-default-${randomUUID()}`, {
        path: archivePath,
        ...this.props.overrides?.sourceCodeAssetProps,
      });

      const destinationAsset = this.createDestinationCodeAsset();
      const bucketDeployment = this.createBucketDeployment(sourceAsset, destinationAsset);

      this.lambdaFunction = this.createFunction(destinationAsset, defaultServerFunction);
      this.lambdaFunction.node.addDependency(bucketDeployment);

      rmSync(archivePath, { recursive: true });

      this.log('Successfully created single server function');
    } catch (error) {
      this.logError(
        `Failed to create single server function: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new Error(
        `Critical failure: Unable to create any server functions - ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Creates a specific server function with enhanced error handling
   * Each function gets its own unique destination asset to prevent code mixing
   */
  private createServerFunction(serverFunction: ParsedServerFunction): Function {
    try {
      this.log(`Processing server function ${serverFunction.name} at ${serverFunction.bundlePath}`);

      // Validate bundle path exists
      if (!fs.existsSync(serverFunction.bundlePath)) {
        throw new Error(`Bundle path does not exist: ${serverFunction.bundlePath}`);
      }

      // Create archive once here
      const archivePath = createArchive({
        directory: serverFunction.bundlePath,
        quiet: this.props.quiet,
        zipFileName: `server-fn-${serverFunction.name}.zip`,
        excludePatterns: this.props.excludePatterns ?? [...DEFAULT_EXCLUDE_PATTERNS],
      });

      const zipStats = fs.statSync(archivePath);
      const useDirect = zipStats.size <= MAX_INLINE_ZIP_SIZE;

      if (useDirect) {
        const fn = this.createFunctionFromArchive(archivePath, serverFunction, serverFunction.handler);
        rmSync(archivePath, { recursive: true });
        return fn;
      }

      // === fallback to original bucket deployment path ===
      const assetId = `SourceZip-${serverFunction.name}-${randomUUID()}`;
      const sourceAsset = new Asset(this, assetId, {
        path: archivePath,
        ...this.props.overrides?.sourceCodeAssetProps,
      });

      const destinationAsset = this.createDestinationCodeAsset();
      const bucketDeployment = this.createBucketDeployment(sourceAsset, destinationAsset);

      const fn = this.createFunction(destinationAsset, serverFunction, {
        handler: serverFunction.handler,
      });
      fn.node.addDependency(bucketDeployment);

      this.log(`Successfully created server function: ${serverFunction.name}`);
      // cleanup local archive
      rmSync(archivePath, { recursive: true });
      return fn;
    } catch (error) {
      this.logError(
        `Failed to create server function ${serverFunction.name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }

  /**
   * Enhanced source code asset creation with caching and exclude patterns
   */
  private createSourceCodeAsset(bundlePath: string, functionName?: string) {
    try {
      // Check cache first for performance optimization
      const cacheKey = `${bundlePath}-${functionName || 'default'}`;
      if (this.assetCache.has(cacheKey)) {
        this.log(`Reusing cached asset for ${cacheKey}`);
        return this.assetCache.get(cacheKey)!;
      }

      // Get exclude patterns from props or use defaults
      const excludePatterns = this.props.excludePatterns ?? [...DEFAULT_EXCLUDE_PATTERNS];

      // Add detailed logging - always output
      console.log(`[NextjsMultiServer] Creating asset for function: ${functionName || 'default'}`);
      console.log(`[NextjsMultiServer] Bundle path: ${bundlePath}`);
      console.log(`[NextjsMultiServer] Props excludePatterns provided: ${this.props.excludePatterns ? 'YES' : 'NO'}`);
      console.log(`[NextjsMultiServer] DEFAULT_EXCLUDE_PATTERNS length: ${DEFAULT_EXCLUDE_PATTERNS.length}`);
      console.log(`[NextjsMultiServer] Final excludePatterns length: ${excludePatterns.length}`);
      console.log(`[NextjsMultiServer] Final excludePatterns: ${JSON.stringify(excludePatterns, null, 2)}`);

      // Check bundle directory file list
      if (fs.existsSync(bundlePath)) {
        const bundleFiles = this.listDirectoryFiles(bundlePath, 20);
        console.log(`[NextjsMultiServer] Bundle directory contains ${bundleFiles.length} files (showing first 20):`);
        bundleFiles.forEach((file, index) => {
          console.log(`[NextjsMultiServer]   ${index + 1}. ${file}`);
        });
      } else {
        console.warn(`[NextjsMultiServer] Bundle path does not exist: ${bundlePath}`);
      }

      if (!this.props.quiet && excludePatterns.length > 0) {
        this.log(`Applying ${excludePatterns.length} exclude patterns for ${functionName || 'default'} function`);
      }

      this.log(`Creating archive for ${bundlePath}`);
      const archivePath = createArchive({
        directory: bundlePath,
        quiet: this.props.quiet,
        zipFileName: `server-fn-${functionName || 'default'}.zip`,
        excludePatterns: excludePatterns,
      });

      console.log(`[NextjsMultiServer] Archive created at: ${archivePath}`);

      // Check zip file size before creating Asset
      const zipStats = fs.statSync(archivePath);
      const zipSizeMB = zipStats.size / 1024 / 1024;
      console.log(`[NextjsMultiServer] Zip file size: ${zipSizeMB.toFixed(2)}MB`);

      // AWS Lambda limit is 250MB, warn if approaching
      if (zipSizeMB > 200) {
        console.warn(
          `[NextjsMultiServer] WARNING: Zip file size (${zipSizeMB.toFixed(
            2
          )}MB) is approaching AWS Lambda limit (250MB)`
        );
      }
      if (zipSizeMB > 250) {
        console.error(
          `[NextjsMultiServer] ERROR: Zip file size (${zipSizeMB.toFixed(2)}MB) exceeds AWS Lambda limit (250MB)`
        );
        throw new Error(`Lambda function size limit exceeded: ${zipSizeMB.toFixed(2)}MB > 250MB`);
      }

      const assetId = `SourceCodeAsset-${functionName || bundlePath.split('/').pop() || 'unknown'}`;

      console.log(`[NextjsMultiServer] Creating Asset with ID: ${assetId}`);
      console.log(`[NextjsMultiServer] Asset path: ${archivePath}`);

      const asset = new Asset(this, assetId, {
        path: archivePath,
        // exclude: excludePatterns,  // Removed: exclude is now handled during zip creation
        ...this.props.overrides?.sourceCodeAssetProps,
      });

      console.log(`[NextjsMultiServer] Asset created successfully with ID: ${assetId}`);
      console.log(`[NextjsMultiServer] Asset S3 bucket: ${asset.bucket.bucketName}`);
      console.log(`[NextjsMultiServer] Asset S3 key: ${asset.s3ObjectKey}`);

      // Cache the asset for potential reuse
      this.assetCache.set(cacheKey, asset);

      // Clean up temporary archive with error handling
      try {
        rmSync(archivePath, { recursive: true });
        console.log(`[NextjsMultiServer] Cleaned up temporary archive: ${archivePath}`);
      } catch (cleanupError) {
        this.logWarn(
          `Failed to cleanup temporary archive ${archivePath}: ${
            cleanupError instanceof Error ? cleanupError.message : String(cleanupError)
          }`
        );
      }

      return asset;
    } catch (error) {
      console.error(`[NextjsMultiServer] ERROR in createSourceCodeAsset:`, error);
      this.logError(
        `Failed to create source code asset for ${bundlePath}: ${
          error instanceof Error ? error.message : String(error)
        }`
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
      const assetsTmpDir = mkdtempSync(resolve(tmpdir(), 'bucket-deployment-dest-asset-'));

      writeFileSync(resolve(assetsTmpDir, 'index.mjs'), `export function handler() { return '${uniqueId}' }`);

      // Get exclude patterns from props or use defaults
      const excludePatterns = this.props.excludePatterns ?? [...DEFAULT_EXCLUDE_PATTERNS];

      // Add detailed logging
      console.log(`[NextjsMultiServer] Creating destination asset with ID: ${uniqueId}`);
      console.log(`[NextjsMultiServer] Destination temp dir: ${assetsTmpDir}`);
      console.log(`[NextjsMultiServer] Destination excludePatterns length: ${excludePatterns.length}`);
      console.log(`[NextjsMultiServer] Destination excludePatterns: ${JSON.stringify(excludePatterns, null, 2)}`);

      const destinationAsset = new Asset(this, `DestinationCodeAsset-${uniqueId}`, {
        path: assetsTmpDir,
        // exclude: excludePatterns,  // Removed: not needed for simple destination asset
        ...this.props.overrides?.destinationCodeAssetProps,
      });

      console.log(`[NextjsMultiServer] Destination asset created successfully`);
      console.log(`[NextjsMultiServer] Destination asset S3 bucket: ${destinationAsset.bucket.bucketName}`);
      console.log(`[NextjsMultiServer] Destination asset S3 key: ${destinationAsset.s3ObjectKey}`);

      // Clean up with error handling
      try {
        rmSync(assetsTmpDir, { recursive: true });
        console.log(`[NextjsMultiServer] Cleaned up destination temp dir: ${assetsTmpDir}`);
      } catch (cleanupError) {
        this.logWarn(
          `Failed to cleanup temporary directory ${assetsTmpDir}: ${
            cleanupError instanceof Error ? cleanupError.message : String(cleanupError)
          }`
        );
      }

      return destinationAsset;
    } catch (error) {
      console.error(`[NextjsMultiServer] ERROR in createDestinationCodeAsset:`, error);
      this.logError(
        `Failed to create destination code asset: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  private createBucketDeployment(sourceAsset: Asset, destinationAsset: Asset) {
    try {
      const bucketDeployment = new NextjsBucketDeployment(this, `BucketDeployment-${sourceAsset.node.id}`, {
        asset: sourceAsset,
        debug: !this.props.quiet, // Use quiet flag instead of hardcoded true
        destinationBucket: destinationAsset.bucket,
        destinationKeyPrefix: destinationAsset.s3ObjectKey,
        prune: false,
        substitutionConfig: NextjsBucketDeployment.getSubstitutionConfig(this.props.environment || {}),
        zip: true,
        ...this.props.overrides?.nextjsBucketDeploymentProps,
      });
      return bucketDeployment;
    } catch (error) {
      this.logError(`Failed to create bucket deployment: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Enhanced function creation with automatic optimization based on ParsedServerFunction
   */
  private createFunction(codeAsset: Asset, serverFunction: ParsedServerFunction, options?: { handler?: string }) {
    try {
      this.log(`Creating Lambda function: ${serverFunction.name} (streaming: ${serverFunction.streaming})`);

      // Merge user environment variables with default environment variables
      const userEnvironment = {
        ...this.environment,
        ...this.props.lambda?.environment,
      };

      // Use new optimization system with ParsedServerFunction
      const { functionProps, invokeMode } = getFunctionPropsFromServerFunction(this, serverFunction, userEnvironment);

      // Create unique description for each function (including patterns)
      const customDescription = this.generateFunctionDescription(serverFunction);

      const fn = new Function(this, `Fn-${serverFunction.name}`, {
        ...functionProps,
        code: Code.fromBucket(codeAsset.bucket, codeAsset.s3ObjectKey),
        handler: options?.handler || serverFunction.handler,
        description: customDescription,
      });

      // Set invoke mode separately if supported (for Function URL)
      // Note: InvokeMode is typically set via Function URL configuration
      // The invokeMode will be used when creating FunctionUrl in NextjsDistribution
      this.log(`Lambda function created with invoke mode: ${invokeMode} for ${serverFunction.name}`);

      this.log(
        `✅ Lambda function created: ${fn.functionName} | Type: ${getFunctionTypeFromServerFunction(
          serverFunction
        )} | Streaming: ${serverFunction.streaming}`
      );

      return fn;
    } catch (error) {
      this.log(`❌ Failed to create Lambda function ${serverFunction.name}: ${error}`);
      throw error;
    }
  }

  /**
   * Generate unique description for each function (including patterns it handles)
   * Enhanced with ParsedServerFunction data
   */
  private generateFunctionDescription(serverFunction: ParsedServerFunction): string {
    try {
      // Get base description by function type
      const functionType = getFunctionTypeFromServerFunction(serverFunction);
      const baseDescription = this.getBaseDescriptionForType(functionType);

      // Query behaviors for this function
      const behaviors = this.props.nextBuild.getBehaviorsForFunction(serverFunction.name);

      if (behaviors.length > 0) {
        const patterns = behaviors.map((b) => b.pattern).filter((pattern) => pattern !== '*'); // Exclude wildcards

        if (patterns.length > 0) {
          const patternInfo = patterns.join(', ');
          return `${baseDescription} | Handles: ${patternInfo} | Streaming: ${serverFunction.streaming}`;
        }
      }

      return `${baseDescription} | Function: ${serverFunction.name} | Streaming: ${serverFunction.streaming}`;
    } catch (error) {
      this.log(`Warning: Failed to generate description for ${serverFunction.name}: ${error}`);
      const functionType = getFunctionTypeFromServerFunction(serverFunction);
      return `${this.getBaseDescriptionForType(functionType)} | Function: ${serverFunction.name}`;
    }
  }

  /**
   * Returns base description for each function type
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
      this.logError(`Failed to get server function ${name}: ${error instanceof Error ? error.message : String(error)}`);
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
      this.logError(`Failed to get server function names: ${error instanceof Error ? error.message : String(error)}`);
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

  /**
   * Utility function to list files in a directory (for debugging exclude patterns)
   */
  private listDirectoryFiles(dirPath: string, maxFiles = 50): string[] {
    try {
      const files: string[] = [];
      const walk = (currentPath: string, relativePath = '') => {
        if (files.length >= maxFiles) return;

        const items = fs.readdirSync(currentPath);
        for (const item of items) {
          if (files.length >= maxFiles) break;

          const fullPath = join(currentPath, item);
          const relativeItemPath = relativePath ? join(relativePath, item) : item;

          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            walk(fullPath, relativeItemPath);
          } else {
            files.push(relativeItemPath);
          }
        }
      };

      walk(dirPath);
      return files;
    } catch (error) {
      console.error(`[NextjsMultiServer] Error listing directory files: ${error}`);
      return [];
    }
  }

  /**
   * Create Lambda function directly from local archive using Code.fromAsset
   * Used when archive size is below MAX_INLINE_ZIP_SIZE to skip extra S3 copy & BucketDeployment.
   */
  private createFunctionFromArchive(
    archivePath: string,
    serverFunction: ParsedServerFunction,
    handler?: string
  ): Function {
    // Build environment merged
    const userEnvironment = {
      ...this.environment,
      ...this.props.lambda?.environment,
    };

    const { functionProps, invokeMode } = getFunctionPropsFromServerFunction(this, serverFunction, userEnvironment);

    const description = this.generateFunctionDescription(serverFunction);

    const fn = new Function(this, `Fn-${serverFunction.name}`, {
      ...functionProps,
      code: Code.fromAsset(archivePath),
      handler: handler || serverFunction.handler,
      description,
    });

    this.log(
      `✅ Lambda function (direct asset) created: ${fn.functionName} | size ${(
        fs.statSync(archivePath).size /
        (1024 * 1024)
      ).toFixed(2)}MB | Streaming: ${serverFunction.streaming}`
    );
    this.log(`Lambda invoke mode: ${invokeMode}`);

    return fn;
  }
}
