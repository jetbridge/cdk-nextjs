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
   * Define your own bucket to store static assets.
   */
  readonly bucket?: s3.IBucket | undefined;
  /**
   * The `NextjsBuild` instance representing the built Nextjs application.
   */
  readonly nextBuild: NextjsBuild;
  /**
   * Custom environment variables to pass to the NextJS build and runtime.
   */
  readonly environment?: Record<string, string>;
  /**
   * Optional value to prefix the Next.js site under a /prefix path on CloudFront.
   * Usually used when you deploy multiple Next.js sites on same domain using /sub-path
   *
   * Note, you'll need to set [basePath](https://nextjs.org/docs/app/api-reference/next-config-js/basePath)
   * in your `next.config.ts` to this value and ensure any files in `public`
   * folder have correct prefix.
   * @example "/my-base-path"
   */
  readonly basePath?: string;
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

  private get buildEnvVars() {
    const buildEnvVars: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.props.environment || {})) {
      if (k.startsWith('NEXT_PUBLIC')) {
        buildEnvVars[k] = v;
      }
    }
    return buildEnvVars;
  }

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
    // create temporary directory to join open-next's static output with cache output
    const tmpAssetsDir = fs.mkdtempSync(resolve(tmpdir(), 'cdk-nextjs-assets-'));
    fs.cpSync(this.props.nextBuild.nextStaticDir, tmpAssetsDir, { recursive: true });
    fs.cpSync(this.props.nextBuild.nextCacheDir, resolve(tmpAssetsDir, NEXTJS_CACHE_DIR), { recursive: true });
    const asset = new Asset(this, 'Asset', {
      path: tmpAssetsDir,
    });
    fs.rmSync(tmpAssetsDir, { recursive: true });
    return asset;
  }

  private createBucketDeployment(asset: Asset) {
    const basePath = this.props.basePath?.replace(/^\//, ''); // remove leading slash (if present)
    const allFiles = basePath ? `${basePath}/**/*` : '**/*';
    const staticFiles = basePath ? `${basePath}/_next/static/**/*'` : '_next/static/**/*';

    return new NextjsBucketDeployment(this, 'BucketDeployment', {
      asset,
      destinationBucket: this.bucket,
      destinationKeyPrefix: basePath,
      debug: true,
      // only put env vars that are placeholders in custom resource properties
      // to be replaced. other env vars were injected at build time.
      substitutionConfig: NextjsBucketDeployment.getSubstitutionConfig(this.buildEnvVars),
      prune: true,
      putConfig: {
        [allFiles]: {
          CacheControl: 'public, max-age=0, must-revalidate',
        },
        [staticFiles]: {
          CacheControl: 'public, max-age=31536000, immutable',
        },
      },
    });
  }
}
