import { Duration, Stack } from 'aws-cdk-lib';
import { Code, Function, FunctionOptions, Runtime } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { NextjsBaseProps } from './NextjsBase';
import { NextjsBuild } from './NextjsBuild';
import { NextJsServer } from './NextjsServer';

export interface RevalidationProps extends NextjsBaseProps {
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
  readonly serverFunction: NextJsServer;
}

/**
 * Builds the system for revalidating Next.js resources. This includes a Lambda function handler and queue system.
 *
 * @see {@link https://github.com/serverless-stack/open-next/blob/main/README.md?plain=1#L65}
 *
 */
export class NextjsRevalidation extends Construct {
  constructor(scope: Construct, id: string, props: RevalidationProps) {
    super(scope, id);

    const code = props.isPlaceholder
      ? Code.fromInline(
          "module.exports.handler = async () => { return { statusCode: 200, body: 'cdk-nextjs placeholder site' } }"
        )
      : Code.fromAsset(props.nextBuild.nextRevalidateFnDir);

    const queue = new Queue(this, 'RevalidationQueue', {
      fifo: true,
      receiveMessageWaitTime: Duration.seconds(20),
    });
    const consumer = new Function(this, 'RevalidationFunction', {
      description: 'Next.js revalidation function',
      handler: 'index.handler',
      // open-next revalidation-function
      // see: https://github.com/serverless-stack/open-next/blob/274d446ed7e940cfbe7ce05a21108f4c854ee37a/README.md?plain=1#L65
      code,
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(30),
    });
    consumer.addEventSource(new SqsEventSource(queue, { batchSize: 5 }));

    // Allow server to send messages to the queue
    const server = props.serverFunction.lambdaFunction;
    server?.addEnvironment('REVALIDATION_QUEUE_URL', queue.queueUrl);
    server?.addEnvironment('REVALIDATION_QUEUE_REGION', Stack.of(this).region);
    queue.grantSendMessages(server);
  }
}
