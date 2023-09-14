import { join } from 'path';
import { Duration, Stack } from 'aws-cdk-lib';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { NEXTJS_BUILD_INDEX_FILE } from './constants';
import { NextjsBaseProps } from './NextjsBase';
import { NextjsBuild } from './NextjsBuild';
import { NextjsServer } from './NextjsServer';
import { getCommonNodejsFunctionProps } from './utils/common-lambda-props';
import { fixPath } from './utils/convert-path';

export interface NextjsRevalidationProps extends NextjsBaseProps {
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
  readonly serverFunction: NextjsServer;
}

/**
 * Builds the system for revalidating Next.js resources. This includes a Lambda function handler and queue system.
 *
 * @see {@link https://github.com/serverless-stack/open-next/blob/main/README.md?plain=1#L65}
 *
 */
export class NextjsRevalidation extends Construct {
  queue: Queue;
  function: NodejsFunction;
  private props: NextjsRevalidationProps;

  constructor(scope: Construct, id: string, props: NextjsRevalidationProps) {
    super(scope, id);
    this.props = props;

    this.queue = this.createQueue();
    this.function = this.createFunction();

    // allow server fn to send messages to queue
    props.serverFunction.lambdaFunction?.addEnvironment('REVALIDATION_QUEUE_URL', this.queue.queueUrl);
    props.serverFunction.lambdaFunction?.addEnvironment('REVALIDATION_QUEUE_REGION', Stack.of(this).region);
  }

  private createQueue(): Queue {
    const queue = new Queue(this, 'Queue', {
      fifo: true,
      receiveMessageWaitTime: Duration.seconds(20),
    });
    // https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-least-privilege-policy.html
    queue.addToResourcePolicy(
      new PolicyStatement({
        sid: 'DenyUnsecureTransport',
        actions: ['sqs:SendMessage', 'sqs:ReceiveMessage'],
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

  private createFunction(): NodejsFunction {
    const nodejsFnProps = getCommonNodejsFunctionProps(this);
    const fn = new NodejsFunction(this, 'Fn', {
      ...nodejsFnProps,
      bundling: {
        ...nodejsFnProps.bundling,
        commandHooks: {
          afterBundling: () => [],
          beforeBundling: (_inputDir, outputDir) => [
            // copy non-bundled assets into zip. use node -e so cross-os compatible
            `node -e "fs.cpSync('${fixPath(this.props.nextBuild.nextRevalidateFnDir)}', '${fixPath(
              outputDir
            )}', { recursive: true, filter: (src) => !src.endsWith('index.mjs') })"`,
          ],
          beforeInstall: () => [],
        },
      },
      // open-next revalidation-function
      // see: https://github.com/serverless-stack/open-next/blob/274d446ed7e940cfbe7ce05a21108f4c854ee37a/README.md?plain=1#L65
      entry: join(this.props.nextBuild.nextRevalidateFnDir, NEXTJS_BUILD_INDEX_FILE),
      handler: 'index.handler',
      description: 'Next.js revalidation function',
      timeout: Duration.seconds(30),
    });
    fn.addEventSource(new SqsEventSource(this.queue, { batchSize: 5 }));
    return fn;
  }
}
