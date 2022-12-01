import * as os from 'os';
import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, CacheControl, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as fs from 'fs-extra';
import * as micromatch from 'micromatch';
import { DEFAULT_STATIC_MAX_AGE, DEFAULT_STATIC_STALE_WHILE_REVALIDATE } from './constants';
import { NextjsBaseProps } from './NextjsBase';
import { createArchive, NextjsBuild } from './NextjsBuild';
import { getS3ReplaceValues, NextjsS3EnvRewriter, replaceTokenGlobs } from './NextjsS3EnvRewriter';

export interface NextjsAssetsCachePolicyProps {
  /**
   * Cache-control max-age default for S3 static assets.
   * Default: 30 days.
   */
  readonly staticMaxAgeDefault?: Duration;
  /**
   * Cache-control stale-while-revalidate default for S3 static assets.
   * Default: 1 day.
   */
  readonly staticStaleWhileRevalidateDefault?: Duration;
}

export interface NextjsAssetsDeploymentProps extends NextjsBaseProps {
  /**
   * The `NextjsBuild` instance representing the built Nextjs application.
   */
  readonly nextBuild: NextjsBuild;

  /**
   * Properties for the S3 bucket containing the NextJS assets.
   */
  readonly bucket: s3.IBucket;

  /**
   * Distribution to invalidate when assets change.
   */
  readonly distribution?: cloudfront.IDistribution;

  /**
   * Override the default S3 cache policies created internally.
   */
  readonly cachePolicies?: NextjsAssetsCachePolicyProps;

  /**
   * Set to true to delete old assets (defaults to false).
   * Recommended to only set to true if you don't need the ability to roll back deployments.
   */
  readonly prune?: boolean;
}

/**
 * Uploads NextJS-built static and public files to S3.
 *
 * Will rewrite CloudFormation references with their resolved values after uploading.
 */
export class NextJsAssetsDeployment extends Construct {
  /**
   * Bucket containing assets.
   */
  bucket: s3.IBucket;

  /**
   * Asset deployments to S3.
   */
  public deployments: BucketDeployment[];

  public staticTempDir: string;

  protected props: NextjsAssetsDeploymentProps;

  constructor(scope: Construct, id: string, props: NextjsAssetsDeploymentProps) {
    super(scope, id);

    this.props = props;

    this.bucket = props.bucket;
    this.staticTempDir = this.prepareArchiveDirectory();
    this.deployments = this.uploadS3Assets(this.staticTempDir);

    // do rewrites of unresolved CDK tokens in static files
    if (this.props.environment && !this.props.isPlaceholder) {
      const rewriter = new NextjsS3EnvRewriter(this, 'NextjsS3EnvRewriter', {
        ...props,
        s3Bucket: this.bucket,
        s3keys: this._getStaticFilesForRewrite(),
        replacementConfig: {
          env: getS3ReplaceValues(this.props.environment, true),
        },
        debug: false,
        cloudfrontDistributionId: this.props.distribution?.distributionId,
      });
      // wait for s3 assets to be uploaded first before running
      rewriter.node.addDependency(...this.deployments);
    }
  }

  // arrange directory structure for S3 asset deployments
  // should contain _next/static and ./ for public files
  protected prepareArchiveDirectory(): string {
    const archiveDir = this.props.tempBuildDir
      ? path.resolve(path.join(this.props.tempBuildDir, 'static'))
      : fs.mkdtempSync(path.join(os.tmpdir(), 'static-'));
    fs.mkdirpSync(archiveDir);

    // theoretically we could move the files instead of copy for speed...

    // path to public folder; root static assets
    const staticDir = this.props.nextBuild.nextStaticDir;
    let publicDir = this.props.isPlaceholder
      ? path.resolve(__dirname, '../assets/PlaceholderSite')
      : this.props.nextBuild.nextPublicDir;

    if (!this.props.isPlaceholder && fs.existsSync(staticDir)) {
      // copy static files
      const staticDestinationDir = path.join(archiveDir, '_next', 'static');
      fs.mkdirpSync(staticDestinationDir);
      fs.copySync(this.props.nextBuild.nextStaticDir, staticDestinationDir, {
        recursive: true,
        dereference: true,
        preserveTimestamps: true,
      });
    }

    // copy public files to root
    if (fs.existsSync(publicDir)) {
      fs.copySync(publicDir, archiveDir, {
        recursive: true,
        dereference: true,
        preserveTimestamps: true,
      });
    }

    return archiveDir;
  }

  private uploadS3Assets(archiveDir: string) {
    // zip up bucket contents and upload to bucket
    const archiveZipFilePath = createArchive({
      directory: archiveDir,
      zipFileName: 'assets.zip',
      zipOutDir: path.join(this.props.nextBuild.tempBuildDir, 'assets'),
      compressionLevel: this.props.compressionLevel,
      quiet: this.props.quiet,
    });
    if (!archiveZipFilePath) return [];

    const maxAge = this.props.cachePolicies?.staticMaxAgeDefault?.toSeconds() ?? DEFAULT_STATIC_MAX_AGE;
    const staleWhileRevalidate =
      this.props.cachePolicies?.staticStaleWhileRevalidateDefault?.toSeconds() ?? DEFAULT_STATIC_STALE_WHILE_REVALIDATE;
    const cacheControl = CacheControl.fromString(
      `public,max-age=${maxAge},stale-while-revalidate=${staleWhileRevalidate},immutable`
    );
    const deployment = new BucketDeployment(this, 'NextStaticAssetsS3Deployment', {
      destinationBucket: this.bucket,
      cacheControl: [cacheControl],
      sources: [Source.asset(archiveZipFilePath)],
      distribution: this.props.distribution,
      prune: this.props.prune,
    });

    return [deployment];
  }

  private _getStaticFilesForRewrite() {
    const staticDir = this.staticTempDir;
    const s3keys: string[] = [];
    if (!fs.existsSync(staticDir)) {
      return [];
    }
    listDirectory(staticDir).forEach((file) => {
      const relativePath = path.relative(staticDir, file);

      // skip bogus system files
      if (relativePath.endsWith('.DS_Store')) return;

      // is this file a glob match?
      if (!micromatch.isMatch(relativePath, replaceTokenGlobs, { dot: true })) {
        return;
      }
      s3keys.push(relativePath);
    });
    return s3keys;
  }
}

export function listDirectory(dir: string) {
  const fileList: string[] = [];
  const publicFiles = fs.readdirSync(dir);
  for (const filename of publicFiles) {
    const filepath = path.join(dir, filename);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      fileList.push(...listDirectory(filepath));
    } else {
      fileList.push(filepath);
    }
  }

  return fileList;
}
