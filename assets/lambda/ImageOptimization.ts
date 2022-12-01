// Taken from: https://github.com/sladg/nextjs-lambda/blob/master/lib/standalone/image-handler.ts
// There are other open source MIT libraries we can pick, but this seems the most straightforward

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { IncomingMessage, ServerResponse } from 'http'
import { defaultConfig, NextConfigComplete } from 'next/dist/server/config-shared'
import { imageOptimizer as nextImageOptimizer, ImageOptimizerCache } from 'next/dist/server/image-optimizer'
import { NextUrlWithParsedQuery } from 'next/dist/server/request-meta'
import { ImageConfigComplete } from 'next/dist/shared/lib/image-config'
import { Readable } from 'stream'

const sourceBucket = process.env.S3_SOURCE_BUCKET ?? undefined

// Handle fetching of S3 object before optimization happens in nextjs.
const requestHandler =
	(bucketName: string) =>
	async (req: IncomingMessage, res: ServerResponse, url?: NextUrlWithParsedQuery): Promise<void> => {
		if (!url) {
			throw new Error('URL is missing from request.')
		}

		// S3 expects keys without leading `/`
		const trimmedKey = url.href.startsWith('/') ? url.href.substring(1) : url.href

		const client = new S3Client({})
		const response = await client.send(new GetObjectCommand({ Bucket: bucketName, Key: trimmedKey }))

		if (!response.Body) {
			throw new Error(`Could not fetch image ${trimmedKey} from bucket.`)
		}

		const stream = response.Body as Readable

		const data = await new Promise<Buffer>((resolve, reject) => {
			const chunks: Buffer[] = []
			stream.on('data', (chunk) => chunks.push(chunk))
			stream.once('end', () => resolve(Buffer.concat(chunks)))
			stream.once('error', reject)
		})

		res.statusCode = 200

		if (response.ContentType) {
			res.setHeader('Content-Type', response.ContentType)
		}

		if (response.CacheControl) {
			res.setHeader('Cache-Control', response.CacheControl)
		}

		res.write(data)
		res.end()
	}

// Make header keys lowercase to ensure integrity.
const normalizeHeaders = (headers: Record<string, any>) =>
	Object.entries(headers).reduce((acc, [key, value]) => ({ ...acc, [key.toLowerCase()]: value }), {} as Record<string, string>)

// @TODO: Allow passing params as env vars.
const nextConfig = {
	...(defaultConfig as NextConfigComplete),
	images: {
		...(defaultConfig.images as ImageConfigComplete),
		// ...(domains && { domains }),
		// ...(deviceSizes && { deviceSizes }),
		// ...(formats && { formats }),
		// ...(imageSizes && { imageSizes }),
		// ...(dangerouslyAllowSVG && { dangerouslyAllowSVG }),
		// ...(contentSecurityPolicy && { contentSecurityPolicy }),
	},
}

// We don't need serverless-http neither basePath configuration as endpoint works as single route API.
// Images are handled via header and query param information.
const optimizer = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
	try {
		if (!sourceBucket) {
			throw new Error('Bucket name must be defined!')
		}

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
			headers: { Vary: 'Accept', 'Content-Type': optimizedResult.contentType },
		}
	} catch (error: any) {
		console.error(error)
		return {
			statusCode: 500,
			body: error?.message || error?.toString() || error,
		}
	}
}

export const handler = optimizer