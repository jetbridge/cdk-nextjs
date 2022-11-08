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

// files to rewrite CloudFormation tokens in environment variables
export const replaceTokenGlobs = ['**/*.html', '**/*.js', '**/*.cjs', '**/*.mjs', '**/*.json'];

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

  constructor(scope: Construct, id: string, props: NextjsBuildProps) {
    super(scope, id);

    // save config
    this.tempBuildDir = props.tempBuildDir
      ? path.resolve(path.join(props.tempBuildDir, `nextjs-cdk-build`))
      : fs.mkdtempSync(path.join(os.tmpdir(), 'nextjs-cdk-build-'));
    this.props = props;

    // validate paths
    const baseOutputDir = path.resolve(this.props.nextjsPath);
    if (!fs.existsSync(baseOutputDir)) throw new Error(`NextJS application not found at "${baseOutputDir}"`);
    const serverBuildDir = path.join(baseOutputDir, NEXTJS_BUILD_DIR);
    if (!fs.existsSync(serverBuildDir)) throw new Error(`No server build output found at "${serverBuildDir}"`);

    // build app
    this.runNpmBuild();

    // our outputs
    this.nextStandaloneDir = this._getNextStandaloneDir();
    this.nextStandaloneBuildDir = this._getNextStandaloneBuildDir();
    this.nextPublicDir = this._getNextPublicDir();
    this.nextStaticDir = this._getNextStaticDir();

    this.buildPath = this.nextStandaloneBuildDir;
  }

  private runNpmBuild() {
    const { nextjsPath } = this.props;

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

    // Run build
    console.debug('Running "npm build" script');
    const buildEnv = {
      ...process.env,
      [NEXTJS_BUILD_STANDALONE_ENV]: 'true',
      ...getBuildCmdEnvironment(this.props.environment),
      ...(this.props.nodeEnv ? { NODE_ENV: this.props.nodeEnv } : {}),
    };
    const buildResult = spawn.sync('npm', ['run', 'build'], {
      cwd: nextjsPath,
      stdio: 'inherit',
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

    if (!fs.existsSync(standaloneDir)) {
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
}

// zip up a directory and return path to zip file
export function createArchive({
  directory,
  zipFileName,
  zipOutDir,
  fileGlob = '*',
  compressionLevel = 1,
}: CreateArchiveArgs): string {
  zipOutDir = path.resolve(zipOutDir);
  // get output path
  fs.removeSync(zipOutDir);
  fs.mkdirpSync(zipOutDir);
  const zipFilePath = path.join(zipOutDir, zipFileName);

  // run script to create zipfile, preserving symlinks for node_modules (e.g. pnpm structure)
  const result = spawn.sync(
    'bash', // getting ENOENT when specifying 'node' here for some reason
    ['-xc', [`cd '${directory}'`, `zip -ryq${compressionLevel} '${zipFilePath}' ${fileGlob}`].join('&&')],
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
  //     environment => API_URL="{{ API_URL }}"
  //
  const buildCmdEnvironment: Record<string, string> = {};
  Object.entries(siteEnvironment || {}).forEach(([key, value]) => {
    buildCmdEnvironment[key] = Token.isUnresolved(value) ? makeTokenPlaceholder(key) : value;
  });

  return buildCmdEnvironment;
}

export const TOKEN_PLACEHOLDER_BEGIN = '{{! ';
export const TOKEN_PLACEHOLDER_END = ' !}}';
export const makeTokenPlaceholder = (value: string): string =>
  TOKEN_PLACEHOLDER_BEGIN + value.toString() + TOKEN_PLACEHOLDER_END;
