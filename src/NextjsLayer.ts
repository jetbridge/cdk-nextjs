import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

// jsii forbids this:
// export interface NextjsLayerProps extends Partial<LayerVersionProps> {}
export interface NextjsLayerProps {}

/**
 * Lambda layer for Next.js.
 * Contains Sharp 0.30.0.
 */
export class NextjsLayer extends LayerVersion {
  constructor(scope: Construct, id: string, props: NextjsLayerProps) {
    const layerDir = path.resolve(__dirname, '../assets');
    super(scope, id, {
      code: new lambda.AssetCode(path.join(layerDir, 'sharp-0.30.0.zip')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
      description: 'Sharp for NextJS',
      ...props,
    });

    ///////  other ways to build this layer:
    // const buildDir = path.resolve(
    //   path.join(this.sstBuildDir, `NextjsLayer-${this.node.id}-${this.node.addr}`)
    // );
    // fs.removeSync(buildDir);
    // fs.mkdirSync(buildDir, { recursive: true });
    // const zipFile ="nextjs-layer.zip"
    // const zipFilePath = path.join(buildDir, zipFile);
    // const LAMBDA_FOLDER = 'nodejs'
    // const createBundleCmdArgs = [
    //   '-xc',
    //   [
    //     `mkdir -p ${LAMBDA_FOLDER}`,
    //     `cd ${LAMBDA_FOLDER}`,
    //     `npm install \
    //     --arch=x64 \
    //     --platform=linux \
    //     --target=16.15 \
    //     --libc=glibc \
    //     next sharp`,
    //     'cd ..',
    //     `zip -qr ${zipFile} ${LAMBDA_FOLDER}`
    //   ].join(' && '),
    // ];

    // const buildResult = spawn.sync('bash', createBundleCmdArgs, {
    //   cwd: buildDir,
    //   stdio: "inherit",
    // });
    // if (buildResult.status !== 0 || !fs.existsSync(zipFilePath)) {
    //   throw new Error(`Failed to create nextjs layer in ${buildDir}`);
    // }

    // // hash our parameters so we know when we need t rebuild
    // const bundleCommandHash = crypto.createHash('sha256');
    // bundleCommandHash.update(JSON.stringify(createBundleCmdArgs));

    // // bundle
    // const code = Code.fromAsset(zipFilePath);

    // // const code = Code.fromAsset(__dirname, {
    // //   // don't send all our files to docker (slow)
    // //   ignoreMode: IgnoreMode.GLOB,
    // //   exclude: ['*'],

    // //   // if our bundle commands (basically our "dockerfile") changes then rebuild the image
    // //   assetHashType: AssetHashType.CUSTOM,
    // //   assetHash: bundleCommandHash.digest('hex'),

    // //   bundling: {
    // //     image: lambda.Runtime.NODEJS_16_X.bundlingImage,
    // //     command: createBundleCommand,
    // //   },
    // // });

    // // Build Next.js layer
    // const nextjsLayer = new lambda.LayerVersion(this, "NextjsLayer", {
    //   code,
    //   compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
    //   description: "Next.js",
    // });
    // return nextjsLayer;
  }
}
