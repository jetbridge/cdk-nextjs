import * as path from 'path';
import { Token } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as spawn from 'cross-spawn';
import * as fs from 'fs-extra';
import {
  NEXTJS_BUILD_DIR,
  NEXTJS_BUILD_IMAGE_FN_DIR,
  NEXTJS_BUILD_MIDDLEWARE_FN_DIR,
  NEXTJS_BUILD_REVALIDATE_FN_DIR,
  NEXTJS_BUILD_SERVER_FN_DIR,
  NEXTJS_CACHE_DIR,
  NEXTJS_STATIC_DIR,
} from './constants';
import { listDirectory } from './NextjsAssetsDeployment';
import { CompressionLevel, NextjsBaseProps } from './NextjsBase';

export interface NextjsBuildProps extends NextjsBaseProps {}

/**
 * Represents a built NextJS application.
 * This construct runs `npm build` in standalone output mode inside your `nextjsPath`.
 * This construct can be used by higher level constructs or used directly.
 */
export class NextjsBuild extends Construct {
  // build output directories
  /**
   * Contains code for middleware. Not currently used.
   */
  public nextMiddlewareFnDir?: string;
  /**
   * Contains server code and dependencies.
   */
  public nextServerFnDir: string;
  /**
   * Contains function for processessing image requests.
   * Should be arm64.
   */
  public nextImageFnDir: string;
  /**
   * Contains function for processing items from revalidation queue.
   */
  public nextRevalidateFnDir: string;
  /**
   * Static files containing client-side code.
   */
  public nextStaticDir: string;
  /**
   * Cache directory for generated data.
   */
  public nextCacheDir: string;

  public props: NextjsBuildProps;

  // public nextDir: string;
  public projectRoot: string;

  constructor(scope: Construct, id: string, props: NextjsBuildProps) {
    super(scope, id);
    this.props = props;

    // validate paths
    const baseOutputDir = path.resolve(this.props.nextjsPath);
    if (!fs.existsSync(baseOutputDir)) throw new Error(`NextJS application not found at "${baseOutputDir}"`);

    // root of project
    this.projectRoot = props.projectRoot ? path.resolve(props.projectRoot) : path.resolve();

    // build app
    this.runNpmBuild();

    // check for output
    const serverBuildDir = path.join(baseOutputDir, NEXTJS_BUILD_DIR);
    if (!props.isPlaceholder && !fs.existsSync(serverBuildDir))
      throw new Error(`No server build output found at "${serverBuildDir}"`);

    // our outputs
    this.nextStaticDir = this._getNextStaticDir();
    this.nextCacheDir = this._getNextCacheDir();
    this.nextImageFnDir = this._getOutputDir(NEXTJS_BUILD_IMAGE_FN_DIR);
    this.nextRevalidateFnDir = this._getOutputDir(NEXTJS_BUILD_REVALIDATE_FN_DIR);
    this.nextServerFnDir = this._getOutputDir(NEXTJS_BUILD_SERVER_FN_DIR);
    this.nextMiddlewareFnDir = this._getOutputDir(NEXTJS_BUILD_MIDDLEWARE_FN_DIR, true);
    // this.nextDir = this._getNextDir();
  }

  private runNpmBuild() {
    const { nextjsPath, isPlaceholder, quiet } = this.props;

    if (isPlaceholder) {
      if (!quiet) console.debug(`Skipping build for placeholder NextjsBuild at ${nextjsPath}`);
      return;
    }

    // validate site path exists
    if (!fs.existsSync(nextjsPath)) {
      throw new Error(`Invalid nextjsPath ${nextjsPath} - directory does not exist at "${path.resolve(nextjsPath)}"`);
    }
    // Ensure that the site has a build script defined
    if (!fs.existsSync(path.join(nextjsPath, 'package.json'))) {
      throw new Error(`No package.json found at "${nextjsPath}".`);
    }
    const packageJson = fs.readJsonSync(path.join(nextjsPath, 'package.json'));
    if (!packageJson.scripts || !packageJson.scripts.build) {
      throw new Error(`No "build" script found within package.json in "${nextjsPath}".`);
    }

    // build environment vars
    const buildEnv = {
      ...process.env,
      ...getBuildCmdEnvironment(this.props.environment),
      ...(this.props.nodeEnv ? { NODE_ENV: this.props.nodeEnv } : {}),
    };

    const buildPath = this.props.buildPath ?? nextjsPath;
    const buildCommand = this.props.buildCommand ?? 'npx --yes open-next@2 build';
    // run build
    console.debug(`├ Running "${buildCommand}" in`, buildPath);
    const cmdParts = buildCommand.split(/\s+/);
    const buildResult = spawn.sync(cmdParts[0], cmdParts.slice(1), {
      cwd: buildPath,
      stdio: this.props.quiet ? 'ignore' : 'inherit',
      env: buildEnv,
      shell: true,
    });
    if (buildResult.status !== 0) {
      throw new Error('The app "build" script failed.');
    }
  }

  // getNextBuildId() {
  //   return fs.readFileSync(path.join(this._getNextStandaloneBuildDir(), 'BUILD_ID'), 'utf-8');
  // }

  readPublicFileList() {
    const publicDir = this._getNextStaticDir();
    if (!fs.existsSync(publicDir)) return [];
    return listDirectory(publicDir).map((file) => path.join('/', path.relative(publicDir, file)));
  }

  // get the absolute path to the directory containing the nextjs project
  // it may be the project root or a subdirectory in a monorepo setup
  private _getNextDir() {
    const { nextjsPath } = this.props; // path to nextjs dir inside project
    const absolutePath = path.resolve(nextjsPath); // e.g. /home/me/myapp/web
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Could not find ${absolutePath} directory.`);
    }
    return absolutePath;
  }

  // .next
  private _getNextBuildDir() {
    return path.join(this._getNextDir(), NEXTJS_BUILD_DIR);
  }

  private _getOutputDir(subdir: string, silent = false) {
    const nextDir = this._getNextBuildDir();
    const standaloneDir = path.join(nextDir, subdir);

    if (!fs.existsSync(standaloneDir) && !this.props.isPlaceholder) {
      if (!silent) throw new Error(`Could not find ${standaloneDir} directory.`);
    }
    return standaloneDir;
  }

  // contains static files
  private _getNextStaticDir() {
    return path.join(this._getNextBuildDir(), NEXTJS_STATIC_DIR);
  }

  // contains cache files
  private _getNextCacheDir() {
    return path.join(this._getNextBuildDir(), NEXTJS_CACHE_DIR);
  }
}

export interface CreateArchiveArgs {
  readonly compressionLevel?: CompressionLevel;
  readonly directory: string;
  readonly zipFileName: string;
  readonly zipOutDir: string;
  readonly fileGlob?: string;
  readonly quiet?: boolean;
}

// zip up a directory and return path to zip file
export function createArchive({
  directory,
  zipFileName,
  zipOutDir,
  fileGlob = '.',
  compressionLevel = 1,
  quiet,
}: CreateArchiveArgs): string | null {
  // if directory is empty, can skip
  if (!fs.existsSync(directory) || fs.readdirSync(directory).length === 0) return null;

  zipOutDir = path.resolve(zipOutDir);
  fs.mkdirpSync(zipOutDir);
  // get output path
  const zipFilePath = path.join(zipOutDir, zipFileName);

  // delete existing zip file
  if (fs.existsSync(zipFilePath)) {
    fs.unlinkSync(zipFilePath);
  }

  // run script to create zipfile, preserving symlinks for node_modules (e.g. pnpm structure)
  let result;
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    const psCompressionLevel = compressionLevel === 0 ? 'NoCompression' : 'Fastest';
    result = spawn.sync(
      'powershell.exe',
      [
        '-NoLogo',
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        `Compress-Archive -Path '${directory}\\*' -DestinationPath '${zipFilePath}' -CompressionLevel ${psCompressionLevel}`,
      ],
      { stdio: 'inherit' }
    );
  } else {
    result = spawn.sync(
      'bash', // getting ENOENT when specifying 'node' here for some reason
      [
        quiet ? '-c' : '-xc',
        [`cd '${directory}'`, `zip -ryq${compressionLevel} '${zipFilePath}' ${fileGlob}`].join('&&'),
      ],
      { stdio: 'inherit' }
    );
  }
  if (result.status !== 0) {
    throw new Error(`There was a problem generating the package for ${zipFileName} with ${directory}: ${result.error}`);
  }
  // check output
  if (!fs.existsSync(zipFilePath)) {
    throw new Error(
      `There was a problem generating the archive for ${directory}; the archive is missing in ${zipFilePath}.`
    );
  }

  return zipFilePath;
}

export function getBuildCmdEnvironment(siteEnvironment?: { [key: string]: string }): Record<string, string> {
  // Generate environment placeholders to be replaced
  // ie. environment => { API_URL: api.url }
  //     environment => API_URL="{NEXT{! API_URL !}}"
  //
  const buildCmdEnvironment: Record<string, string> = {};
  Object.entries(siteEnvironment || {}).forEach(([key, value]) => {
    buildCmdEnvironment[key] = Token.isUnresolved(value) ? makeTokenPlaceholder(key) : value;
  });

  return buildCmdEnvironment;
}

export const TOKEN_PLACEHOLDER_BEGIN = '{NEXT{! ';
export const TOKEN_PLACEHOLDER_END = ' !}}';
export const makeTokenPlaceholder = (value: string): string =>
  TOKEN_PLACEHOLDER_BEGIN + value.toString() + TOKEN_PLACEHOLDER_END;
