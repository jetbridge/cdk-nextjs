import * as fs from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';
import { NEXTJS_CACHE_DIR } from './constants';
import { NextjsBucketDeployment } from './NextjsBucketDeployment';
import { NextjsBuild } from './NextjsBuild';

export interface NextjsStaticAssetsProps {
  /**
   * The `NextjsBuild` instance representing the built Nextjs application.
   */
  readonly nextBuild: NextjsBuild;
  /**
   * Define your own bucket to store static assets.
   */
  readonly bucket?: s3.IBucket | undefined;
}

/**
 * Uploads Nextjs built static and public files to S3.
 *
 * Will inject resolved environment variables that are unresolved at synthesis
 * in CloudFormation Custom Resource.
 */
export class NextjsStaticAssets extends Construct {
  /**
   * Bucket containing assets.
   */
  bucket: s3.IBucket;

  protected props: NextjsStaticAssetsProps;

  constructor(scope: Construct, id: string, props: NextjsStaticAssetsProps) {
    super(scope, id);
    this.props = props;

    this.bucket = this.createBucket();
    const asset = this.createAsset();
    this.createBucketDeployment(asset);
  }

  private createBucket(): s3.IBucket {
    return (
      this.props.bucket ??
      new s3.Bucket(this, 'Bucket', {
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        enforceSSL: true,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        encryption: s3.BucketEncryption.S3_MANAGED,
      })
    );
  }

  private createAsset(): Asset {
    const tmpDir = tmpdir();
    fs.cpSync(this.props.nextBuild.nextStaticDir, tmpDir, { recursive: true });
    fs.cpSync(this.props.nextBuild.nextCacheDir, resolve(tmpDir, NEXTJS_CACHE_DIR), { recursive: true });
    const asset = new Asset(this, 'Asset', {
      path: tmpDir,
    });
    fs.rmSync(tmpDir, { recursive: true }); // is this ok?
    return asset;
  }

  private createBucketDeployment(asset: Asset) {
    return new NextjsBucketDeployment(this, 'StaticAssetsDeployment', {
      asset,
      destinationBucketName: this.bucket.bucketName,
      debug: true,
      // only put env vars that are placeholders in custom resource properties
      // to be replaced. other env vars were injected at build time.
      substitutionConfig: this.getSubstitutions(this.props.nextBuild.buildEnvVars),
      prune: true,
      putConfig: {
        '**/*': {
          CacheControl: 'public, max-age=0, must-revalidate',
        },
        '_next/static/**/*': {
          CacheControl: 'public, max-age=31536000, immutable',
        },
      },
    });
  }

  private getSubstitutions(envVars: Record<string, string>): Record<string, string> {
    const envWithPlaceholders: Record<string, string> = {};
    for (const [k, v] of Object.entries(envVars)) {
      if (/^{{ \s }}$/.test(v)) {
        envWithPlaceholders[k] = v;
      }
    }
    return envWithPlaceholders;
  }
}
