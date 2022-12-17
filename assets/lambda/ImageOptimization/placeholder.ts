import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const handler: APIGatewayProxyHandlerV2 = async (event) => ({
  statusCode: 200,
  body: 'Placeholder function is deployed',
});
