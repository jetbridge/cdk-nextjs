// Taken from: https://github.com/sladg/nextjs-lambda/blob/master/lib/standalone/image-handler.ts
// There are other open source MIT libraries we can pick, but this seems the most straightforward

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { IncomingMessage, ServerResponse } from 'http'
import { defaultConfig, NextConfigComplete } from 'next/dist/server/config-shared'
import { imageOptimizer as nextImageOptimizer, ImageOptimizerCache } from 'next/dist/server/image-optimizer'
import { NextUrlWithParsedQuery } from 'next/dist/server/request-meta'
import { ImageConfigComplete, ImageConfig } from 'next/dist/shared/lib/image-config'
import { Writable } from 'node:stream'
import https from 'node:https'
import { getNextServerConfig } from '../utils'
import fetch from 'node-fetch'

// TODO: Remove this once we use Node18.x
// imageOptimizer uses fetch in its preprocessing logic
global.fetch = fetch

const sourceBucket = process.env.S3_SOURCE_BUCKET ?? undefined

// The next config file was bundled and outputted to the root
// SEE: src/ImageOptimizationLambda.ts, Line 81
const { config } = getNextServerConfig()

const pipeRes = (w: Writable, res: ServerResponse) => {
  w.pipe(res)
    .once('close', () => {
      res.statusCode = 200
      res.end()
    })
    .once('error', (err) => {
      console.error('Failed to get image', { err })
      res.statusCode = 400
      res.end()
    })
}

// Handle fetching of S3 object before optimization happens in nextjs.
const requestHandler =
  (bucketName: string) =>
  async (req: IncomingMessage, res: ServerResponse, url?: NextUrlWithParsedQuery): Promise<void> => {
    if (!url) {
      throw new Error('URL is missing from request.')
    }

    let response: any
    let data: Buffer
    // External url, try to fetch image
    if (url.href?.toLowerCase().startsWith('http')) {
      try {
        pipeRes(https.get(url), res)
      } catch (err) {
        console.error('Failed to get image', err)
        res.statusCode = 400
        res.end()
      }
    } else {
      // S3 expects keys without leading `/`
      const trimmedKey = url.href.startsWith('/') ? url.href.substring(1) : url.href

      const client = new S3Client({})
      response = await client.send(new GetObjectCommand({ Bucket: bucketName, Key: trimmedKey }))
      if (!response.Body) {
        res.setHeader('Cache-Control', 'no-store,no-cache,must-revalidate,proxy-revalidate')
        throw new Error(`Could not fetch image ${trimmedKey} from bucket.`)
      }
      pipeRes(response.Body, res)
      // Respect the bucket file's content-type and cache-control
      // nextImageOptimizer will use this to set the results.maxAge
      if (response.ContentType) {
        res.setHeader('Content-Type', response.ContentType)
      }
      if (response.CacheControl) {
        res.setHeader('Cache-Control', response.CacheControl)
      }
    }
  }

// Make header keys lowercase to ensure integrity.
const normalizeHeaders = (headers: Record<string, any>) =>
  Object.entries(headers).reduce((acc, [key, value]) => ({ ...acc, [key.toLowerCase()]: value }), {} as Record<string, string>)

const nextConfig: NextConfigComplete = {
  ...(defaultConfig as NextConfigComplete),
  images: {
    ...(defaultConfig.images as ImageConfigComplete),
    ...config.images
  },
}

const optimizer: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!sourceBucket) {
      throw new Error('Bucket name must be defined!')
    }
    // This will reject if the image url is not in the acceptable domains
    // specified in the user's next.config.js config: `domains` and/or `remotePatterns`
    const imageParams = ImageOptimizerCache.validateParams({ headers: event.headers } as any, event.queryStringParameters!, nextConfig, false)
    if ('errorMessage' in imageParams) {
      throw new Error(imageParams.errorMessage)
    }

    const optimizedResult = await nextImageOptimizer(
      { headers: normalizeHeaders(event.headers) } as any,
      {} as any, // res object is not necessary as it's not actually used.
      imageParams,
      nextConfig,
      false, // not in dev mode
      requestHandler(sourceBucket),
    )

    return {
      statusCode: 200,
      body: optimizedResult.buffer.toString('base64'),
      isBase64Encoded: true,
      headers: { 
        Vary: 'Accept',
        'Cache-Control': `public,max-age=${optimizedResult.maxAge},immutable`,
        'Content-Type': optimizedResult.contentType,
      },
    }
  } catch (error: any) {
    console.error(error)
    return {
      statusCode: 500,
      headers: {
        Vary: 'Accept',
        // For failed images, allow client to retry after 1 hour. 
        'Cache-Control': `public,max-age=3600,immutable`,
        'Content-Type': 'application/json'
      },
      body: error?.message || error?.toString() || error,
    }
  }
}

export const handler = optimizer