import { Construct } from 'constructs';

// taken from https://github.com/serverless-stack/sst/blob/8d377e941467ced81d8cc31ee67d5a06550f04d4/packages/resources/src/Construct.ts

const JSII_RTTI_SYMBOL_1 = Symbol.for('jsii.rtti');

export function isCDKConstruct(construct: any): construct is Construct {
  const fqn = construct?.constructor?.[JSII_RTTI_SYMBOL_1]?.fqn;
  return typeof fqn === 'string' && (fqn.startsWith('@aws-cdk/') || fqn.startsWith('aws-cdk-lib'));
}
