import { Duration, Stack } from 'aws-cdk-lib';
import { Code, Function, FunctionOptions, Runtime } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { NextjsBaseProps } from './NextjsBase';
import { NextjsBuild } from './NextjsBuild';
import { NextJsLambda } from './NextjsLambda';

export interface RevaluationProps extends NextjsBaseProps {
  /**
   * Override function properties.
   */
  readonly lambdaOptions?: FunctionOptions;

  /**
   * The `NextjsBuild` instance representing the built Nextjs application.
   */
  readonly nextBuild: NextjsBuild;

  /**
   * The main NextJS server handler lambda function.
   */
  readonly serverFunction: NextJsLambda;
}

/**
 * Builds the system for revaluating Next.js resources. This includes a Lambda function handler and queue system.
 */
export class NextjsRevaluation extends Construct {
  constructor(scope: Construct, id: string, props: RevaluationProps) {
    super(scope, id);

    if (!props.nextBuild) return;

    const code = props.isPlaceholder
      ? Code.fromInline(
          "module.exports.handler = async () => { return { statusCode: 200, body: 'SST placeholder site' } }"
        )
      : Code.fromAsset(props.nextBuild.nextImageFnDir);

    const queue = new Queue(this, 'RevalidationQueue', {
      fifo: true,
      receiveMessageWaitTime: Duration.seconds(20),
    });
    const consumer = new Function(this, 'RevalidationFunction', {
      description: 'Next.js revalidator',
      handler: 'index.handler',
      code,
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(30),
      // This, I think, is supposed to be the VPC or VPC Subnet config (https://github.com/serverless-stack/sst/blob/master/packages/sst/src/constructs/NextjsSite.ts#L59C5-L59C17)
      // ...this.revalidation,
    });
    consumer.addEventSource(new SqsEventSource(queue, { batchSize: 5 }));

    // Allow server to send messages to the queue
    const server = props.serverFunction.lambdaFunction;
    server?.addEnvironment('REVALIDATION_QUEUE_URL', queue.queueUrl);
    server?.addEnvironment('REVALIDATION_QUEUE_REGION', Stack.of(this).region);
    queue.grantSendMessages(server?.role!);
  }
}
