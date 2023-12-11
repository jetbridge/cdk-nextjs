// ~~ Generated by projen. To modify, edit .projenrc.ts and run "npx projen".
import type { aws_dynamodb, aws_kinesis, CfnTag, RemovalPolicy } from 'aws-cdk-lib';

/**
 * OptionalTablePropsV2
 */
export interface OptionalTablePropsV2 {
  /**
   * The name of the TTL attribute.
   * @default - TTL is disabled
   * @stability stable
   */
  readonly timeToLiveAttribute?: string;
  /**
   * The name of the table.
   * @default - generated by CloudFormation
   * @stability stable
   */
  readonly tableName?: string;
  /**
   * Sort key attribute definition.
   * @default - no sort key
   * @stability stable
   */
  readonly sortKey?: aws_dynamodb.Attribute;
  /**
   * Replica tables to deploy with the primary table.
   * Note: Adding replica tables allows you to use your table as a global table. You
   * cannot specify a replica table in the region that the primary table will be deployed
   * to. Replica tables will only be supported if the stack deployment region is defined.
   * @default - no replica tables
   * @stability stable
   */
  readonly replicas?: Array<aws_dynamodb.ReplicaTableProps>;
  /**
   * The removal policy applied to the table.
   * @default RemovalPolicy.RETAIN
   * @stability stable
   */
  readonly removalPolicy?: RemovalPolicy;
  /**
   * Local secondary indexes.
   * Note: You can only provide a maximum of 5 local secondary indexes.
   * @default - no local secondary indexes
   * @stability stable
   */
  readonly localSecondaryIndexes?: Array<aws_dynamodb.LocalSecondaryIndexProps>;
  /**
   * Global secondary indexes.
   * Note: You can provide a maximum of 20 global secondary indexes.
   * @default - no global secondary indexes
   * @stability stable
   */
  readonly globalSecondaryIndexes?: Array<aws_dynamodb.GlobalSecondaryIndexPropsV2>;
  /**
   * The server-side encryption.
   * @default TableEncryptionV2.dynamoOwnedKey()
   * @stability stable
   */
  readonly encryption?: aws_dynamodb.TableEncryptionV2;
  /**
   * When an item in the table is modified, StreamViewType determines what information is written to the stream.
   * @default - streams are disabled if replicas are not configured and this property is
not specified. If this property is not specified when replicas are configured, then
NEW_AND_OLD_IMAGES will be the StreamViewType for all replicas
   * @stability stable
   */
  readonly dynamoStream?: aws_dynamodb.StreamViewType;
  /**
   * The billing mode and capacity settings to apply to the table.
   * @default Billing.onDemand()
   * @stability stable
   */
  readonly billing?: aws_dynamodb.Billing;
  /**
   * Partition key attribute definition.
   * @stability stable
   */
  readonly partitionKey?: aws_dynamodb.Attribute;
  /**
   * Tags to be applied to the table or replica table.
   * @default - no tags
   * @stability stable
   */
  readonly tags?: Array<CfnTag>;
  /**
   * The table class.
   * @default TableClass.STANDARD
   * @stability stable
   */
  readonly tableClass?: aws_dynamodb.TableClass;
  /**
   * Whether point-in-time recovery is enabled.
   * @default false
   * @stability stable
   */
  readonly pointInTimeRecovery?: boolean;
  /**
   * Kinesis Data Stream to capture item level changes.
   * @default - no Kinesis Data Stream
   * @stability stable
   */
  readonly kinesisStream?: aws_kinesis.IStream;
  /**
   * Whether deletion protection is enabled.
   * @default false
   * @stability stable
   */
  readonly deletionProtection?: boolean;
  /**
   * Whether CloudWatch contributor insights is enabled.
   * @default false
   * @stability stable
   */
  readonly contributorInsights?: boolean;
}
