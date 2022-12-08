import { CdkCustomResourceHandler } from 'aws-lambda';
import {
  CloudFrontClient, 
  CreateInvalidationCommand,
  waitUntilInvalidationCompleted,
} from '@aws-sdk/client-cloudfront';

const MAX_WAIT_TIME = 5 * 60; // 5 minutes to wait

interface ResourceProps {
  distributionId: string,
  paths: string[],
  waitForInvalidation: boolean,
}

export const handler: CdkCustomResourceHandler = async (event, context) => {
  const responseUrl = event.ResponseURL;
  const  { distributionId, paths, waitForInvalidation } = event.ResourceProperties as unknown as ResourceProps;
  
  const client = new CloudFrontClient({});
  const command = new CreateInvalidationCommand({
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: Date.now().toString(),
      Paths: {
        Quantity: paths.length,
        Items: paths,
      },
    }
  });

  // Send request to CF to invalidate the paths
  const invRes = await client.send(command);

  // Wait for status
  const waiter = waitForInvalidation
  ? await waitUntilInvalidationCompleted({
      client,
      maxWaitTime: MAX_WAIT_TIME,
    }, {
      DistributionId: distributionId,
      Id: invRes.Invalidation?.Id
    })
  : { state: 'SUCCESS', reason: { Status: 'Skipped waiting for invalidation' } };

  // Tell CloudFormation about status
  const payload = JSON.stringify({
    Status: waiter.state, // SUCCESS or FAILED
    Reason: waiter.reason?.Status,
    PhysicalResourceId: context.logStreamName,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    NoEcho: false,
    Data: {},
  });
  await fetch(responseUrl, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      'content-length': '' + payload.length
    },
    body: payload
  });

  return event;
}