import { Stack, Token } from 'aws-cdk-lib';
import { execSync } from 'child_process';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';

import {
  NEXTJS_BUILD_DIR,
  NEXTJS_BUILD_DYNAMODB_PROVIDER_FN_DIR,
  NEXTJS_BUILD_IMAGE_FN_DIR,
  NEXTJS_BUILD_REVALIDATE_FN_DIR,
  NEXTJS_BUILD_SERVER_FN_DIR,
  NEXTJS_CACHE_DIR,
  NEXTJS_STATIC_DIR,
} from './constants';
import type { NextjsProps } from './Nextjs';
import { NextjsBucketDeployment } from './NextjsBucketDeployment';
import { listDirectory } from './utils/list-directories';
import type {
  OpenNextBehavior,
  OpenNextOutput,
  ParsedServerFunction,
  ProcessedBehaviorConfig,
} from './utils/open-next-types';
import { BehaviorProcessor, validateOpenNextOutput } from './utils/open-next-types';

export interface NextjsBuildProps {
  /**
   * @see {@link NextjsProps.buildCommand}
   */
  readonly buildCommand?: NextjsProps['buildCommand'];
  /**
   * @see {@link NextjsProps.buildPath}
   */
  readonly buildPath?: NextjsProps['buildPath'];
  /**
   * @see {@link NextjsProps.environment}
   */
  readonly environment?: NextjsProps['environment'];
  /**
   * @see {@link NextjsProps.nextjsPath}
   */
  readonly nextjsPath: NextjsProps['nextjsPath'];
  /**
   * @see {@link NextjsProps.quiet}
   */
  readonly quiet?: NextjsProps['quiet'];
  /**
   * @see {@link NextjsProps.skipBuild}
   */
  readonly skipBuild?: NextjsProps['skipBuild'];
  /**
   * @see {@link NextjsProps.streaming}
   */
  readonly streaming?: NextjsProps['streaming'];
}

/**
 * Build Next.js app.
 */
export class NextjsBuild extends Construct {
  /**
   * Contains server code and dependencies.
   */
  public get nextServerFnDir(): string {
    const dir = path.join(this.getNextBuildDir(), NEXTJS_BUILD_SERVER_FN_DIR);
    this.warnIfMissing(dir);
    return dir;
  }
  /**
   * Contains function for processessing image requests.
   * Should be arm64.
   */
  public get nextImageFnDir(): string {
    const fnPath = path.join(this.getNextBuildDir(), NEXTJS_BUILD_IMAGE_FN_DIR);
    this.warnIfMissing(fnPath);
    return fnPath;
  }
  /**
   * Contains function for processing items from revalidation queue.
   */
  public get nextRevalidateFnDir(): string {
    const fnPath = path.join(this.getNextBuildDir(), NEXTJS_BUILD_REVALIDATE_FN_DIR);
    this.warnIfMissing(fnPath);
    return fnPath;
  }
  /**
   * Contains function for inserting revalidation items into the table.
   */
  public get nextRevalidateDynamoDBProviderFnDir(): string {
    const fnPath = path.join(this.getNextBuildDir(), NEXTJS_BUILD_DYNAMODB_PROVIDER_FN_DIR);
    this.warnIfMissing(fnPath);
    return fnPath;
  }
  /**
   * Static files containing client-side code.
   */
  public get nextStaticDir(): string {
    const dir = path.join(this.getNextBuildDir(), NEXTJS_STATIC_DIR);
    this.warnIfMissing(dir);
    return dir;
  }
  /**
   * Cache directory for generated data.
   */
  public get nextCacheDir(): string {
    const dir = path.join(this.getNextBuildDir(), NEXTJS_CACHE_DIR);
    this.warnIfMissing(dir);
    return dir;
  }

  public props: NextjsBuildProps;

  private _openNextOutput?: OpenNextOutput;
  private _cachedServerFunctions?: ParsedServerFunction[];
  private _cachedBehaviors?: OpenNextBehavior[];
  private _cachedBehaviorProcessor?: BehaviorProcessor;

  constructor(scope: Construct, id: string, props: NextjsBuildProps) {
    super(scope, id);
    this.props = props;
    this.validatePaths();

    const bundlingRequired = Stack.of(this).bundlingRequired;
    const skipBuild = this.props.skipBuild;

    // for more info see docs/code-deployment-flow.md Conditional Build Logic section
    if (bundlingRequired) {
      // deploy/synth
      if (skipBuild) {
        this.assertBuildDirExists(true);
      } else {
        this.build();
      }
    } else {
      // destroy
      this.mockNextBuildDir();
    }
  }

  /**
   * Validate required paths/files for NextjsBuild
   */
  private validatePaths() {
    const nextjsPath = this.props.nextjsPath;
    // validate site path exists
    if (!fs.existsSync(nextjsPath)) {
      throw new Error(`Invalid nextjsPath ${nextjsPath} - directory does not exist at "${path.resolve(nextjsPath)}"`);
    }
    // Ensure that the site has a build script defined
    if (!fs.existsSync(path.join(nextjsPath, 'package.json'))) {
      throw new Error(`No package.json found at "${nextjsPath}".`);
    }
    const packageJson = JSON.parse(fs.readFileSync(path.join(nextjsPath, 'package.json'), 'utf8'));
    if (!packageJson.scripts || !packageJson.scripts.build) {
      throw new Error(`No "build" script found within package.json in "${nextjsPath}".`);
    }
  }

  private build() {
    const buildPath = this.props.buildPath ?? this.props.nextjsPath;
    const buildCommand = this.props.buildCommand ?? `npx @opennextjs/aws@^3 build`;
    // run build
    if (!this.props.quiet) {
      console.debug(`Running "${buildCommand}" in`, buildPath);
    }
    // will throw if build fails - which is desired
    execSync(buildCommand, {
      cwd: buildPath,
      stdio: this.props.quiet ? 'ignore' : 'inherit',
      env: this.getBuildEnvVars(),
    });
  }

  /**
   * Gets environment variables for build time (when `open-next build` is called).
   * Unresolved tokens are replace with placeholders like {{ TOKEN_NAME }} and
   * will be resolved later in `NextjsBucketDeployment` custom resource.
   */
  private getBuildEnvVars() {
    const env: Record<string, string> = {};
    for (const [k, v] of Object.entries(process.env)) {
      if (v) {
        env[k] = v;
      }
    }
    for (const [k, v] of Object.entries(this.props.environment || {})) {
      // don't replace server only env vars for static assets
      if (Token.isUnresolved(v) && k.startsWith('NEXT_PUBLIC_')) {
        env[k] = NextjsBucketDeployment.getSubstitutionValue(k);
      } else {
        env[k] = v;
      }
    }
    return env;
  }

  readPublicFileList() {
    if (!fs.existsSync(this.nextStaticDir)) return [];
    return listDirectory(this.nextStaticDir).map((file) => path.join('/', path.relative(this.nextStaticDir, file)));
  }

  private assertBuildDirExists(throwIfMissing = true) {
    const dir = this.getNextBuildDir();
    if (!fs.existsSync(dir)) {
      if (throwIfMissing) {
        throw new Error(`Build directory "${dir}" does not exist. Try removing skipBuild: true option.`);
      }
      return false;
    }
    return true;
  }

  private getNextBuildDir(): string {
    const dir = path.resolve(this.props.nextjsPath, NEXTJS_BUILD_DIR);
    this.warnIfMissing(dir);
    return dir;
  }

  private warnIfMissing(dir: string) {
    if (!fs.existsSync(dir)) {
      console.warn(`Warning: ${dir} does not exist.`);
    }
  }

  private mockNextBuildDir() {
    function createMockDirAndFile(dir: string) {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'package.json'), '{}', 'utf8');
    }

    const buildDirExists = this.assertBuildDirExists(false);
    if (!buildDirExists) {
      // mock .open-next
      createMockDirAndFile(this.getNextBuildDir());
      createMockDirAndFile(this.nextServerFnDir);
      createMockDirAndFile(this.nextImageFnDir);
      createMockDirAndFile(this.nextRevalidateFnDir);
      createMockDirAndFile(this.nextRevalidateDynamoDBProviderFnDir);
      createMockDirAndFile(this.nextStaticDir);
      createMockDirAndFile(this.nextCacheDir);
    }
  }

  /**
   * Gets the parsed open-next.output.json file with validation
   */
  public get openNextOutput(): OpenNextOutput | undefined {
    if (this._openNextOutput) {
      return this._openNextOutput;
    }

    const outputPath = path.join(this.getNextBuildDir(), 'open-next.output.json');

    if (!fs.existsSync(outputPath)) {
      if (!this.props.quiet) {
        console.warn(`Warning: open-next.output.json not found at ${outputPath}`);
      }
      return undefined;
    }

    try {
      const content = fs.readFileSync(outputPath, 'utf8');
      const parsedOutput = JSON.parse(content);

      // Validate the output
      const validation = validateOpenNextOutput(parsedOutput);
      if (!validation.isValid) {
        const errorMessage = `Invalid open-next.output.json: ${validation.errors.join(', ')}`;
        if (!this.props.quiet) {
          console.error(errorMessage);
        }
        throw new Error(errorMessage);
      }

      // Log warnings if any
      if (validation.warnings.length > 0 && !this.props.quiet) {
        console.warn(`open-next.output.json warnings: ${validation.warnings.join(', ')}`);
      }

      this._openNextOutput = parsedOutput;
      return this._openNextOutput;
    } catch (error) {
      const errorMessage = `Failed to parse open-next.output.json: ${
        error instanceof Error ? error.message : String(error)
      }`;
      if (!this.props.quiet) {
        console.error(errorMessage);
      }
      throw new Error(errorMessage);
    }
  }

  /**
   * Gets all server functions from open-next.output.json with caching and error handling
   */
  public getServerFunctions(): ParsedServerFunction[] {
    // Return cached result if available
    if (this._cachedServerFunctions) {
      return this._cachedServerFunctions;
    }

    const output = this.openNextOutput;
    if (!output) {
      this._cachedServerFunctions = [];
      return this._cachedServerFunctions;
    }

    const serverFunctions: ParsedServerFunction[] = [];
    const nextjsPath = this.props.nextjsPath;

    try {
      for (const [name, origin] of Object.entries(output.origins)) {
        if (origin.type === 'function' && origin.bundle) {
          // origin.bundle already contains .open-next prefix, so we use nextjsPath instead of getNextBuildDir()
          const bundlePath = path.join(nextjsPath, origin.bundle);

          // Validate that the bundle path exists
          if (!fs.existsSync(bundlePath)) {
            if (!this.props.quiet) {
              console.warn(`Warning: Bundle path does not exist: ${bundlePath}`);
            }
            continue; // Skip this function instead of failing
          }

          // Validate that it's actually a directory
          const stats = fs.statSync(bundlePath);
          if (!stats.isDirectory()) {
            if (!this.props.quiet) {
              console.warn(`Warning: Bundle path is not a directory: ${bundlePath}`);
            }
            continue;
          }

          serverFunctions.push({
            name,
            bundlePath,
            handler: origin.handler || 'index.handler',
            streaming: origin.streaming || false,
            wrapper: origin.wrapper,
            converter: origin.converter,
            queue: origin.queue,
            incrementalCache: origin.incrementalCache,
            tagCache: origin.tagCache,
          });
        }
      }

      this._cachedServerFunctions = serverFunctions;
      return this._cachedServerFunctions;
    } catch (error) {
      const errorMessage = `Failed to parse server functions: ${
        error instanceof Error ? error.message : String(error)
      }`;
      if (!this.props.quiet) {
        console.error(errorMessage);
      }
      throw new Error(errorMessage);
    }
  }

  /**
   * Gets behaviors from open-next.output.json with caching
   */
  public getBehaviors(): OpenNextBehavior[] {
    // Return cached result if available
    if (this._cachedBehaviors) {
      return this._cachedBehaviors;
    }

    const output = this.openNextOutput;
    if (!output) {
      this._cachedBehaviors = [];
      return this._cachedBehaviors;
    }

    this._cachedBehaviors = output.behaviors || [];
    return this._cachedBehaviors;
  }

  /**
   * Gets a specific server function directory by name with enhanced validation
   */
  public getServerFunctionDir(functionName: string): string | undefined {
    try {
      const serverFunctions = this.getServerFunctions();
      const serverFunction = serverFunctions.find((fn) => fn.name === functionName);

      if (serverFunction && fs.existsSync(serverFunction.bundlePath)) {
        const stats = fs.statSync(serverFunction.bundlePath);
        if (stats.isDirectory()) {
          return serverFunction.bundlePath;
        } else {
          if (!this.props.quiet) {
            console.warn(`Bundle path is not a directory: ${serverFunction.bundlePath}`);
          }
        }
      }

      this.warnIfMissing(serverFunction?.bundlePath || '');
      return undefined;
    } catch (error) {
      if (!this.props.quiet) {
        console.error(
          `Failed to get server function directory for '${functionName}': ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
      return undefined;
    }
  }

  /**
   * Gets the enhanced behavior processor with pre-processed metadata
   * This eliminates the need for repeated pattern matching
   */
  public getBehaviorProcessor(): BehaviorProcessor {
    if (this._cachedBehaviorProcessor) {
      return this._cachedBehaviorProcessor;
    }

    const behaviors = this.getBehaviors();
    const serverFunctions = this.getServerFunctions();

    this._cachedBehaviorProcessor = new BehaviorProcessor(behaviors, serverFunctions);
    return this._cachedBehaviorProcessor;
  }

  /**
   * Gets processed behaviors with enhanced metadata
   * Replaces multiple repeated lookups with single processed result
   */
  public getProcessedBehaviors(): ProcessedBehaviorConfig[] {
    return this.getBehaviorProcessor().getProcessedBehaviors();
  }

  /**
   * Gets behaviors by origin type (function, imageOptimizer, s3, custom)
   */
  public getBehaviorsByOriginType(originType: ProcessedBehaviorConfig['originType']): ProcessedBehaviorConfig[] {
    return this.getBehaviorProcessor().getBehaviorsByOriginType(originType);
  }

  /**
   * Gets behaviors for a specific function with pre-calculated patterns
   */
  public getBehaviorsForFunction(functionName: string): ProcessedBehaviorConfig[] {
    return this.getBehaviorProcessor().getBehaviorsForFunction(functionName);
  }

  /**
   * Clears cached data - useful for testing or when output file changes
   */
  public clearCache(): void {
    this._openNextOutput = undefined;
    this._cachedServerFunctions = undefined;
    this._cachedBehaviors = undefined;
    this._cachedBehaviorProcessor = undefined;
  }
}
