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
      description: 'Sharp for Lambdas',
      ...props,
    });
  }
}
