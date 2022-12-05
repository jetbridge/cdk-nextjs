// based on:
// - https://github.com/iiroj/iiro.fi/commit/bd43222032d0dbb765e1111825f64dbb5db851d9
// - https://github.com/sladg/nextjs-lambda/blob/master/lib/standalone/server-handler.ts

// This change dir to current directory is a precaution, as nextjs may have
// issues regarding file/folder locations.
process.chdir(__dirname)

import fs from 'node:fs';
import { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import type { Options } from 'next/dist/server/next-server';
import * as nss from 'next/dist/server/next-server';
import slsHttp from 'serverless-http';
import { getNextServerConfig } from './utils'

const getErrMessage = (e: any) => ({ message: 'Server failed to respond.', details: e });

// invoked by Lambda URL; the format is the same as API Gateway v2
// https://docs.aws.amazon.com/lambda/latest/dg/urls-invocation.html#urls-payloads
type LambdaUrlFunctionHandler = APIGatewayProxyHandlerV2;

// somehow the default export gets buried inside itself...
const NextNodeServer: typeof nss.default = (nss.default as any)?.default ?? nss.default;

// load config
const nextDir = path.join(__dirname, '.next');
const requiredServerFilesPath = path.join(nextDir, 'required-server-files.json');
const json = fs.readFileSync(requiredServerFilesPath, 'utf-8');
const { config: nextConfig } = getNextServerConfig()

const config: Options = {
  // hostname and port must be defined for proxying to work (middleware)
  hostname: 'localhost',
  port: Number(process.env.PORT) || 3000,
  // Next.js compression should be disabled because of a bug
  // in the bundled `compression` package. See:
  // https://github.com/vercel/next.js/issues/11669
  conf: { ...nextConfig, compress: false },
  customServer: false,
  dev: false,
  dir: __dirname,
  minimalMode: false, // turning this on breaks middleware
};

// next request handler
const nextHandler = new NextNodeServer(config).getRequestHandler();

// wrap next request handler with serverless-http
// to translate from API Gateway v2 to next request/response
const server = slsHttp(
  async (req: IncomingMessage, res: ServerResponse) => {
    await nextHandler(req, res).catch((e) => {
      console.error(`NextJS request failed due to:`);
      console.error(e);

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(getErrMessage(e), null, 3));
    });
  },
  {
    binary: true,
    request: (request: any) => {
      // nextjs doesn't parse body if the property exists
      // https://github.com/dougmoscrop/serverless-http/issues/227
      delete request.body;
    },
    provider: 'aws',
  }
);

export const handler: LambdaUrlFunctionHandler = server;
