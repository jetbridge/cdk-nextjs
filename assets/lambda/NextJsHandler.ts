/* eslint-disable import/no-extraneous-dependencies */
// based on:
// - https://github.com/iiroj/iiro.fi/commit/bd43222032d0dbb765e1111825f64dbb5db851d9
// - https://github.com/sladg/nextjs-lambda/blob/master/lib/standalone/server-handler.ts

import fs from 'node:fs';
import { ServerResponse } from 'node:http';
import path from 'node:path';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import type { NextConfig } from 'next';
import { NodeNextRequest, NodeNextResponse } from 'next/dist/server/base-http/node';
import type { Options } from 'next/dist/server/next-server';
import * as nss from 'next/dist/server/next-server';
import slsHttp from 'serverless-http';
import { httpCompat } from './LambdaRequestAdapter';

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
const requiredServerFiles = JSON.parse(json) as { version: number; config: NextConfig };
const config: Options = {
  // Next.js compression should be disabled because of a bug
  // in the bundled `compression` package. See:
  // https://github.com/vercel/next.js/issues/11669
  conf: { ...requiredServerFiles.config, compress: false },
  customServer: false,
  dev: false,
  dir: __dirname,
  minimalMode: true,
};

// next request handler
const nextHandler = new NextNodeServer(config).getRequestHandler();

// wrap next request handler with serverless-http
// to translate from API Gateway v2 to next request/response
// const server = slsHttp(
// async (req, res: ServerResponse) => {

async function server(event, context, callback) {
  const { req, res } = httpCompat(event);
  const nextReq = new NodeNextRequest(req);
  const nextRes = new NodeNextResponse(res);

  console.log('lambda request:', nextReq);
  // console.log('RES', nextRes);
  req.headers = req.headers ?? {};
  const result = await nextHandler(nextReq, nextRes).catch((e) => {
    console.error(`NextJS request failed due to:`);
    console.error(e);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(getErrMessage(e), null, 3));
  });

  // console.log('req headers: ', req);
  console.log('res : ', nextRes);
  // },
  // {
  //   // binary: false,
  //   provider: 'aws',
  // }
  return { body: 'no ' };
}

// export const handler: LambdaUrlFunctionHandler = server;
export const handler: LambdaUrlFunctionHandler = server;
