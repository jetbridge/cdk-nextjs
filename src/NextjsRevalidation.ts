import * as fs from 'fs';
import { CustomResource, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { AttributeType, Billing, TableV2 as Table } from 'aws-cdk-lib/aws-dynamodb';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Function as LambdaFunction, FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Queue, QueueProps } from 'aws-cdk-lib/aws-sqs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import {
  OptionalCustomResourceProps,
  OptionalFunctionProps,
  OptionalProviderProps,
  OptionalTablePropsV2,
} from './generated-structs';
import { NextjsBuild } from './NextjsBuild';
import { NextjsServer } from './NextjsServer';
import { getCommonFunctionProps } from './utils/common-lambda-props';

export interface NextjsRevalidationOverrides {
  readonly queueProps?: QueueProps;
  readonly queueFunctionProps?: OptionalFunctionProps;
  readonly tableProps?: OptionalTablePropsV2;
  readonly insertFunctionProps?: OptionalFunctionProps;
  readonly insertProviderProps?: OptionalProviderProps;
  readonly insertCustomResourceProps?: OptionalCustomResourceProps;
}

export interface NextjsRevalidationProps {
  /**
   * Override function properties.
   */
  readonly lambdaOptions?: FunctionOptions;
  /**
   * @see {@link NextjsBuild}
   */
  readonly nextBuild: NextjsBuild;
  /**
   * Overrides
   */
  readonly overrides?: NextjsRevalidationOverrides;
  /**
   * @see {@link NextjsServer}
   */
  readonly serverFunction: NextjsServer;
}

/**
 * Builds the system for revalidating Next.js resources. This includes a Lambda function handler and queue system as well
 * as the DynamoDB table and provider function.
 *
 * @see {@link https://github.com/serverless-stack/open-next/blob/main/README.md?plain=1#L65}
 *
 */
export class NextjsRevalidation extends Construct {
  queue: Queue;
  table: Table;
  queueFunction: LambdaFunction;
  tableFunction: LambdaFunction | undefined;
  private props: NextjsRevalidationProps;

  constructor(scope: Construct, id: string, props: NextjsRevalidationProps) {
    super(scope, id);
    this.props = props;

    this.queue = this.createQueue();
    this.queueFunction = this.createQueueFunction();

    this.table = this.createRevalidationTable();
    this.tableFunction = this.createRevalidationInsertFunction(this.table);

    this.props.serverFunction.lambdaFunction.addEnvironment('CACHE_DYNAMO_TABLE', this.table.tableName);

    if (this.props.serverFunction.lambdaFunction.role) {
      this.table.grantReadWriteData(this.props.serverFunction.lambdaFunction.role);
    }

    this.props.serverFunction.lambdaFunction // allow server fn to send messages to queue
      ?.addEnvironment('REVALIDATION_QUEUE_URL', this.queue.queueUrl);
    props.serverFunction.lambdaFunction?.addEnvironment('REVALIDATION_QUEUE_REGION', Stack.of(this).region);
  }

  private createQueue(): Queue {
    const queue = new Queue(this, 'Queue', {
      fifo: true,
      receiveMessageWaitTime: Duration.seconds(20),
      ...this.props.overrides?.queueProps,
    });
    // https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-least-privilege-policy.html
    queue.addToResourcePolicy(
      new PolicyStatement({
        sid: 'DenyUnsecureTransport',
        actions: ['sqs:*'],
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        resources: [queue.queueArn],
        conditions: {
          Bool: { 'aws:SecureTransport': 'false' },
        },
      })
    );
    // Allow server to send messages to the queue
    queue.grantSendMessages(this.props.serverFunction.lambdaFunction);
    return queue;
  }

  private createQueueFunction(): LambdaFunction {
    const commonFnProps = getCommonFunctionProps(this);
    const fn = new LambdaFunction(this, 'QueueFn', {
      ...commonFnProps,
      // open-next revalidation-function
      // see: https://github.com/serverless-stack/open-next/blob/274d446ed7e940cfbe7ce05a21108f4c854ee37a/README.md?plain=1#L65
      code: Code.fromAsset(this.props.nextBuild.nextRevalidateFnDir),
      handler: 'index.handler',
      description: 'Next.js Queue Revalidation Function',
      timeout: Duration.seconds(30),
      ...this.props.overrides?.queueFunctionProps,
    });
    fn.addEventSource(new SqsEventSource(this.queue, { batchSize: 5 }));
    return fn;
  }

  private createRevalidationTable() {
    return new Table(this, 'Table', {
      partitionKey: { name: 'tag', type: AttributeType.STRING },
      sortKey: { name: 'path', type: AttributeType.STRING },
      billing: Billing.onDemand(),
      globalSecondaryIndexes: [
        {
          indexName: 'revalidate',
          partitionKey: { name: 'path', type: AttributeType.STRING },
          sortKey: { name: 'revalidatedAt', type: AttributeType.NUMBER },
        },
      ],
      removalPolicy: RemovalPolicy.DESTROY,
      ...this.props.overrides?.tableProps,
    });
  }

  /**
   * This function will insert the initial batch of tag / path / revalidation data into the DynamoDB table during deployment.
   * @see: {@link https://open-next.js.org/inner_workings/isr#tags}
   *
   * @param revalidationTable table to grant function access to
   * @returns the revalidation insert provider function
   */
  private createRevalidationInsertFunction(revalidationTable: Table) {
    const dynamodbProviderPath = this.props.nextBuild.nextRevalidateDynamoDBProviderFnDir;

    // note the function may not exist - it only exists if there are cache tags values defined in Next.js build meta files to be inserted
    // see: https://github.com/sst/open-next/blob/c2b05e3a5f82de40da1181e11c087265983c349d/packages/open-next/src/build.ts#L426-L458
    if (fs.existsSync(dynamodbProviderPath)) {
      const commonFnProps = getCommonFunctionProps(this);
      const insertFn = new LambdaFunction(this, 'DynamoDBProviderFn', {
        ...commonFnProps,
        // open-next revalidation-function
        // see: https://github.com/serverless-stack/open-next/blob/274d446ed7e940cfbe7ce05a21108f4c854ee37a/README.md?plain=1#L65
        code: Code.fromAsset(this.props.nextBuild.nextRevalidateDynamoDBProviderFnDir),
        handler: 'index.handler',
        description: 'Next.js Revalidation DynamoDB Provider',
        timeout: Duration.minutes(1),
        environment: {
          CACHE_DYNAMO_TABLE: revalidationTable.tableName,
        },
        ...this.props.overrides?.insertFunctionProps,
      });

      revalidationTable.grantReadWriteData(insertFn);

      const provider = new Provider(this, 'DynamoDBProvider', {
        onEventHandler: insertFn,
        logRetention: RetentionDays.ONE_DAY,
        ...this.props.overrides?.insertProviderProps,
      });

      new CustomResource(this, 'DynamoDBResource', {
        serviceToken: provider.serviceToken,
        properties: {
          version: Date.now().toString(),
        },
        ...this.props.overrides?.insertCustomResourceProps,
      });

      return insertFn;
    }

    return undefined;
  }
}
