import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Stack, Token } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  NEXTJS_BUILD_DIR,
  NEXTJS_BUILD_IMAGE_FN_DIR,
  NEXTJS_BUILD_REVALIDATE_FN_DIR,
  NEXTJS_BUILD_SERVER_FN_DIR,
  NEXTJS_CACHE_DIR,
  NEXTJS_STATIC_DIR,
} from './constants';
import { NextjsBaseProps } from './NextjsBase';
import { NextjsBucketDeployment } from './NextjsBucketDeployment';
import { listDirectory } from './utils/list-directories';

export interface NextjsBuildProps extends NextjsBaseProps {
  /**
   * @see `NextjsProps.skipBuild`
   */
  readonly skipBuild?: boolean;
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
    const dir = path.join(this.getNextBuildDir(), NEXTJS_BUILD_IMAGE_FN_DIR);
    this.warnIfMissing(dir);
    return dir;
  }
  /**
   * Contains function for processing items from revalidation queue.
   */
  public get nextRevalidateFnDir(): string {
    const dir = path.join(this.getNextBuildDir(), NEXTJS_BUILD_REVALIDATE_FN_DIR);
    this.warnIfMissing(dir);
    return dir;
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
  /**
   * Environment variables for build time (when `open-next build` is called).
   * Unresolved tokens are replace with placeholders like {{ TOKEN_NAME }} and
   * will be resolved later in custom resource.
   */
  public get buildEnvVars(): Record<string, string> {
    const env: Record<string, string> = {};
    for (const [k, v] of Object.entries(process.env)) {
      if (v) {
        env[k] = v;
      }
    }
    if (this.props.nodeEnv) {
      env.NODE_ENV = this.props.nodeEnv;
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

  public props: NextjsBuildProps;

  constructor(scope: Construct, id: string, props: NextjsBuildProps) {
    super(scope, id);
    this.props = props;
    this.validatePaths();
    // when `cdk deploy "NonNextjsStack" --exclusively` is run, don't run build
    if (Stack.of(this).bundlingRequired && !this.props.skipBuild) {
      this.build();
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
    if (!this.props.quiet) {
      console.debug(`Skipping build for placeholder NextjsBuild at ${this.props.nextjsPath}`);
    }
    const buildPath = this.props.buildPath ?? this.props.nextjsPath;
    const buildCommand = this.props.buildCommand ?? 'npx open-next@2 build';
    // run build
    if (!this.props.quiet) {
      console.debug(`├ Running "${buildCommand}" in`, buildPath);
    }
    // will throw if build fails - which is desired
    execSync(buildCommand, {
      cwd: buildPath,
      stdio: this.props.quiet ? 'ignore' : 'inherit',
      env: this.buildEnvVars,
    });
  }

  readPublicFileList() {
    if (!fs.existsSync(this.nextStaticDir)) return [];
    return listDirectory(this.nextStaticDir).map((file) => path.join('/', path.relative(this.nextStaticDir, file)));
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
}
