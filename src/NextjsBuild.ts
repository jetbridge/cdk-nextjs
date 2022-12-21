import * as os from 'os';
import * as path from 'path';
import { Token } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as spawn from 'cross-spawn';
import * as fs from 'fs-extra';
import { listDirectory } from './NextjsAssetsDeployment';
import { CompressionLevel, NextjsBaseProps } from './NextjsBase';

const NEXTJS_BUILD_DIR = '.next';
const NEXTJS_STATIC_DIR = 'static';
const NEXTJS_PUBLIC_DIR = 'public';
const NEXTJS_BUILD_STANDALONE_DIR = 'standalone';
const NEXTJS_BUILD_STANDALONE_ENV = 'NEXT_PRIVATE_STANDALONE';
const NEXTJS_BUILD_OUTPUTTRACEROOT_ENV = 'NEXT_PRIVATE_OUTPUT_TRACE_ROOT';

export interface NextjsBuildProps extends NextjsBaseProps {}

/**
 * Represents a built NextJS application.
 * This construct runs `npm build` in standalone output mode inside your `nextjsPath`.
 * This construct can be used by higher level constructs or used directly.
 */
export class NextjsBuild extends Construct {
  // build outputs
  /**
   * The path to the directory where the server build artifacts are stored.
   */
  public buildPath: string;

  // build output directories
  /**
   * Entire NextJS build output directory.
   * Contains server and client code and manifests.
   */
  public nextStandaloneDir: string;
  /**
   * NextJS project inside of standalone build.
   * Contains server code and manifests.
   */
  public nextStandaloneBuildDir: string;
  /**
   * Static files containing client-side code.
   */
  public nextStaticDir: string;
  /**
   * Public static files.
   * E.g. robots.txt, favicon.ico, etc.
   */
  public nextPublicDir: string;

  public props: NextjsBuildProps;

  public tempBuildDir: string;

  public nextDir: string;

  /**
   * The path the `.next` directory of the Nextjs application.
   */
  public nextBuildDir: string;

  constructor(scope: Construct, id: string, props: NextjsBuildProps) {
    super(scope, id);

    // save config
    this.tempBuildDir = props.tempBuildDir
      ? path.resolve(props.tempBuildDir)
      : fs.mkdtempSync(path.join(os.tmpdir(), 'nextjs-cdk-build-'));
    this.props = props;

    // validate paths
    const baseOutputDir = path.resolve(this.props.nextjsPath);
    if (!fs.existsSync(baseOutputDir)) throw new Error(`NextJS application not found at "${baseOutputDir}"`);

    // build app
    this.runNpmBuild();

    // check for output
    const serverBuildDir = path.join(baseOutputDir, NEXTJS_BUILD_DIR);
    if (!props.isPlaceholder && !fs.existsSync(serverBuildDir)) throw new Error(`No server build output found at "${serverBuildDir}"`);

    // our outputs
    this.nextStandaloneDir = this._getNextStandaloneDir();
    this.nextStandaloneBuildDir = this._getNextStandaloneBuildDir();
    this.nextPublicDir = this._getNextPublicDir();
    this.nextStaticDir = this._getNextStaticDir();
    this.buildPath = this.nextStandaloneBuildDir;
    this.nextDir = this._getNextDir();
    this.nextBuildDir = this._getNextBuildDir();
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
      [NEXTJS_BUILD_STANDALONE_ENV]: 'true',
      [NEXTJS_BUILD_OUTPUTTRACEROOT_ENV]: path.resolve(),
      ...getBuildCmdEnvironment(this.props.environment),
      ...(this.props.nodeEnv ? { NODE_ENV: this.props.nodeEnv } : {}),
    };

    const buildPath = this.props.buildPath ?? nextjsPath;
    // run build
    console.debug('├ Running "npm build" in', buildPath);
    const buildResult = spawn.sync('npm', ['run', 'build'], {
      cwd: buildPath,
      stdio: this.props.quiet ? 'ignore' : 'inherit',
      env: buildEnv,
    });
    if (buildResult.status !== 0) {
      throw new Error('The app "build" script failed.');
    }
  }

  // getNextBuildId() {
  //   return fs.readFileSync(path.join(this._getNextStandaloneBuildDir(), 'BUILD_ID'), 'utf-8');
  // }

  readPublicFileList() {
    const publicDir = this._getNextPublicDir();
    if (!fs.existsSync(publicDir)) return [];
    return listDirectory(publicDir).map((file) => path.join('/', path.relative(publicDir, file)));
  }

  // get the path to the directory containing the nextjs project
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

  // output of nextjs standalone build
  private _getNextStandaloneDir() {
    const nextDir = this._getNextBuildDir();
    const standaloneDir = path.join(nextDir, NEXTJS_BUILD_STANDALONE_DIR);

    if (!fs.existsSync(standaloneDir) && !this.props.isPlaceholder) {
      throw new Error(`Could not find ${standaloneDir} directory.`);
    }
    return standaloneDir;
  }

  // nextjs project inside of standalone build
  // contains manifests and server code
  private _getNextStandaloneBuildDir() {
    return path.join(this._getNextStandaloneDir(), this.props.nextjsPath, NEXTJS_BUILD_DIR);
  }

  // contains static files
  private _getNextStaticDir() {
    return path.join(this._getNextBuildDir(), NEXTJS_STATIC_DIR);
  }
  private _getNextPublicDir() {
    return path.join(this._getNextDir(), NEXTJS_PUBLIC_DIR);
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
  fileGlob = '*',
  compressionLevel = 1,
  quiet,
}: CreateArchiveArgs): string | null {
  // if directory is empty, can skip
  if (!fs.existsSync(directory) || fs.readdirSync(directory).length === 0) return null;

  zipOutDir = path.resolve(zipOutDir);
  fs.mkdirpSync(zipOutDir);
  // get output path
  const zipFilePath = path.join(zipOutDir, zipFileName);

  // run script to create zipfile, preserving symlinks for node_modules (e.g. pnpm structure)
  const result = spawn.sync(
    'bash', // getting ENOENT when specifying 'node' here for some reason
    [
      quiet ? '-c' : '-xc',
      [`cd '${directory}'`, `zip -ryq${compressionLevel} '${zipFilePath}' ${fileGlob}`].join('&&'),
    ],
    { stdio: 'inherit' }
  );
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
