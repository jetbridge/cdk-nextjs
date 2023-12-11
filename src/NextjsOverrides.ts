import { NextjsConstructOverrides } from './Nextjs';
import { NextjsBucketDeploymentOverrides } from './NextjsBucketDeployment';
import { NextjsDistributionOverrides } from './NextjsDistribution';
import { NextjsDomainOverrides } from './NextjsDomain';
import { NextjsImageOverrides } from './NextjsImage';
import { NextjsInvalidationOverrides } from './NextjsInvalidation';
import { NextjsRevalidationOverrides } from './NextjsRevalidation';
import { NextjsServerOverrides } from './NextjsServer';
import { NextjsStaticAssetOverrides } from './NextjsStaticAssets';

export interface NextjsOverrides {
  readonly nextjs?: NextjsConstructOverrides;
  readonly nextjsBucketDeployment?: NextjsBucketDeploymentOverrides;
  readonly nextjsDistribution?: NextjsDistributionOverrides;
  readonly nextjsDomain?: NextjsDomainOverrides;
  readonly nextjsImage?: NextjsImageOverrides;
  readonly nextjsInvalidation?: NextjsInvalidationOverrides;
  readonly nextjsRevalidation?: NextjsRevalidationOverrides;
  readonly nextjsServer?: NextjsServerOverrides;
  readonly nextjsStaticAssets?: NextjsStaticAssetOverrides;
}
