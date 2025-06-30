import { CustomResource, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { AttributeType, Billing, TableV2 as Table } from 'aws-cdk-lib/aws-dynamodb';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Code, FunctionOptions, Function as LambdaFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Queue, QueueProps } from 'aws-cdk-lib/aws-sqs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  OptionalCustomResourceProps,
  OptionalFunctionProps,
  OptionalProviderProps,
  OptionalTablePropsV2,
} from './generated-structs';
import { NextjsBuild } from './NextjsBuild';
import { NextjsMultiServer } from './NextjsMultiServer';
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
   * Override props for every construct.
   */
  readonly overrides?: NextjsRevalidationOverrides;
  /**
   * @see {@link NextjsServer}
   */
  readonly serverFunction?: NextjsServer;
  /**
   * @see {@link NextjsMultiServer}
   */
  readonly multiServer?: NextjsMultiServer;
  readonly quiet?: boolean;
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

    try {
      this.queue = this.createQueue();
      this.queueFunction = this.createQueueFunction();

      this.table = this.createRevalidationTable();
      this.tableFunction = this.createRevalidationInsertFunction(this.table);

      // Get the main Lambda function for environment variables and permissions
      const mainLambdaFunction = this.getMainLambdaFunction();

      if (mainLambdaFunction) {
        mainLambdaFunction.addEnvironment('CACHE_DYNAMO_TABLE', this.table.tableName);

        if (mainLambdaFunction.role) {
          this.table.grantReadWriteData(mainLambdaFunction.role);
        }

        mainLambdaFunction.addEnvironment('REVALIDATION_QUEUE_URL', this.queue.queueUrl);
        mainLambdaFunction.addEnvironment('REVALIDATION_QUEUE_REGION', Stack.of(this).region);
      }

      // In multi-server mode, add environment variables to all server functions
      if (this.props.multiServer) {
        this.log('Configuring multi-server revalidation');
        for (const functionName of this.props.multiServer.getServerFunctionNames()) {
          const fn = this.props.multiServer.getServerFunction(functionName);
          if (fn) {
            fn.addEnvironment('CACHE_DYNAMO_TABLE', this.table.tableName);
            fn.addEnvironment('REVALIDATION_QUEUE_URL', this.queue.queueUrl);
            fn.addEnvironment('REVALIDATION_QUEUE_REGION', Stack.of(this).region);

            if (fn.role) {
              this.table.grantReadWriteData(fn.role);
            }
          }
        }
      }
    } catch (error) {
      this.logError(
        `Failed to initialize NextjsRevalidation: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Enhanced logging method
   */
  private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (this.props.quiet) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [NextjsRevalidation] ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  private logError(message: string): void {
    this.log(message, 'error');
  }

  private logWarn(message: string): void {
    this.log(message, 'warn');
  }

  /**
   * Gets the main Lambda function for single server mode or default function for multi-server mode
   */
  private getMainLambdaFunction(): LambdaFunction | undefined {
    if (this.props.serverFunction?.lambdaFunction) {
      return this.props.serverFunction.lambdaFunction;
    }
    if (this.props.multiServer?.lambdaFunction) {
      return this.props.multiServer.lambdaFunction;
    }
    return undefined;
  }

  private createQueue(): Queue {
    try {
      this.log('Creating revalidation queue');
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
      const mainLambdaFunction = this.getMainLambdaFunction();
      if (mainLambdaFunction) {
        queue.grantSendMessages(mainLambdaFunction);
      }

      // In multi-server mode, grant permissions to all server functions
      if (this.props.multiServer) {
        for (const functionName of this.props.multiServer.getServerFunctionNames()) {
          const fn = this.props.multiServer.getServerFunction(functionName);
          if (fn) {
            queue.grantSendMessages(fn);
          }
        }
      }

      this.log('Successfully created revalidation queue');
      return queue;
    } catch (error) {
      this.logError(`Failed to create queue: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private createQueueFunction(): LambdaFunction {
    try {
      this.log('Creating queue function');
      const queueFunctionDir = this.getQueueFunctionDirectory();

      if (!queueFunctionDir) {
        throw new Error('Queue function directory not found');
      }

      const commonProps = getCommonFunctionProps(this, 'revalidation-queue');
      const { runtime, ...otherProps } = commonProps;

      const fn = new LambdaFunction(this, 'QueueFn', {
        ...otherProps,
        runtime: runtime || Runtime.NODEJS_20_X, // Provide default runtime
        architecture: Architecture.ARM_64,
        code: Code.fromAsset(queueFunctionDir),
        handler: 'index.handler',
        timeout: Duration.seconds(30),
        environment: {
          ...this.props.lambdaOptions?.environment,
        },
        ...this.props.lambdaOptions,
        ...this.props.overrides?.queueFunctionProps,
      });
      fn.addEventSource(new SqsEventSource(this.queue, { batchSize: 5 }));

      this.log('Successfully created queue function');
      return fn;
    } catch (error) {
      this.logError(`Failed to create queue function: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private createRevalidationTable() {
    try {
      this.log('Creating revalidation table');
      const table = new Table(this, 'Table', {
        partitionKey: { name: 'tag', type: AttributeType.STRING },
        sortKey: { name: 'path', type: AttributeType.STRING },
        removalPolicy: RemovalPolicy.DESTROY,
        billing: Billing.onDemand(),
        pointInTimeRecovery: false,
        ...this.props.overrides?.tableProps,
      });

      this.log('Successfully created revalidation table');
      return table;
    } catch (error) {
      this.logError(`Failed to create revalidation table: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private createRevalidationInsertFunction(revalidationTable: Table) {
    try {
      this.log('Creating revalidation insert function');
      const insertFunctionDir = this.getInsertFunctionDirectory();

      if (!insertFunctionDir) {
        this.logWarn('Insert function directory not found, skipping creation');
        return undefined;
      }

      const commonProps = getCommonFunctionProps(this, 'revalidation-insert');
      const { runtime, ...otherProps } = commonProps;

      const fn = new LambdaFunction(this, 'InsertFn', {
        ...otherProps,
        runtime: runtime || Runtime.NODEJS_20_X, // Provide default runtime
        architecture: Architecture.ARM_64,
        code: Code.fromAsset(insertFunctionDir),
        handler: 'index.handler',
        environment: {
          CACHE_DYNAMO_TABLE: revalidationTable.tableName,
          ...this.props.lambdaOptions?.environment,
        },
        logRetention: RetentionDays.THREE_DAYS,
        ...this.props.lambdaOptions,
        ...this.props.overrides?.insertFunctionProps,
      });

      revalidationTable.grantWriteData(fn);

      const provider = new Provider(this, 'InsertProvider', {
        onEventHandler: fn,
        logRetention: RetentionDays.ONE_DAY,
        ...this.props.overrides?.insertProviderProps,
      });

      new CustomResource(this, 'InsertCustomResource', {
        serviceToken: provider.serviceToken,
        properties: {
          version: Date.now().toString(),
        },
        ...this.props.overrides?.insertCustomResourceProps,
      });

      this.log('Successfully created revalidation insert function');
      return fn;
    } catch (error) {
      this.logError(
        `Failed to create revalidation insert function: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Gets insert function directory - always uses legacy path for deployment-time data insertion
   */
  private getInsertFunctionDirectory(): string | undefined {
    try {
      // Insert Function is used for initial data insertion during deployment, so always use legacy path
      const legacyPath = this.props.nextBuild.nextRevalidateDynamoDBProviderFnDir;
      if (fs.existsSync(legacyPath)) {
        this.log(`Using revalidation insert function path: ${legacyPath}`);
        return legacyPath;
      }

      this.logWarn('Revalidation insert function directory not found');
      return undefined;
    } catch (error) {
      this.logError(
        `Failed to get insert function directory: ${error instanceof Error ? error.message : String(error)}`
      );
      return undefined;
    }
  }

  /**
   * Enhanced method to get queue function directory with multi-server support
   */
  private getQueueFunctionDirectory(): string | undefined {
    try {
      // First try to get from multi-server configuration
      if (this.props.nextBuild.openNextOutput?.additionalProps?.revalidationFunction) {
        const revalidationConfig = this.props.nextBuild.openNextOutput.additionalProps.revalidationFunction;
        const bundlePath = path.join(this.props.nextBuild.props.nextjsPath, revalidationConfig.bundle);
        if (fs.existsSync(bundlePath)) {
          this.log(`Found revalidation queue function from open-next config: ${bundlePath}`);
          return bundlePath;
        } else {
          this.logWarn(`Revalidation bundle path from config does not exist: ${bundlePath}`);
        }
      }

      // Fallback to legacy path
      const legacyPath = this.props.nextBuild.nextRevalidateFnDir;
      if (fs.existsSync(legacyPath)) {
        this.log(`Using legacy revalidation queue function path: ${legacyPath}`);
        return legacyPath;
      }

      this.logWarn('No valid revalidation queue function directory found');
      return this.props.nextBuild.nextRevalidateFnDir; // Return anyway for backward compatibility
    } catch (error) {
      this.logError(
        `Failed to get queue function directory: ${error instanceof Error ? error.message : String(error)}`
      );
      return this.props.nextBuild.nextRevalidateFnDir; // Return anyway for backward compatibility
    }
  }
}
