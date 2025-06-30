import { Duration, PhysicalName } from 'aws-cdk-lib';
import { Architecture, FunctionProps, InvokeMode, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import type { ParsedServerFunction } from './open-next-types';

/**
 * Defines types of Lambda functions.
 */
export enum LambdaFunctionType {
  /** SSR (Server-Side Rendering) function - default settings */
  SERVER = 'server',
  /** API-only function - optimized for fast response and cost efficiency */
  API = 'api',
  /** Image optimization function - optimized for memory-intensive tasks */
  IMAGE = 'image',
  /** Revalidation function - optimized for lightweight tasks */
  REVALIDATION = 'revalidation',
}

/**
 * Determine function type from ParsedServerFunction configuration
 */
export function getFunctionTypeFromServerFunction(serverFunction: ParsedServerFunction): LambdaFunctionType {
  const { name } = serverFunction;

  // Use actual function configuration to determine type
  if (name === 'imageOptimizer' || name.includes('image')) {
    return LambdaFunctionType.IMAGE;
  }

  if (name.includes('revalidat') || name.includes('warmer')) {
    return LambdaFunctionType.REVALIDATION;
  }

  // Check if it's API-only based on common API patterns
  if (name.includes('api') || name.includes('Auth') || name.includes('jwt')) {
    return LambdaFunctionType.API;
  }

  // Default to SERVER for page rendering functions
  return LambdaFunctionType.SERVER;
}

/**
 * Defines optimized configurations for each function type.
 */
const FUNCTION_TYPE_CONFIGS: Record<
  LambdaFunctionType,
  {
    memorySize: number;
    timeout: Duration;
    architecture: Architecture;
    invokeMode: InvokeMode;
    description: string;
  }
> = {
  [LambdaFunctionType.SERVER]: {
    memorySize: 1024,
    timeout: Duration.seconds(30),
    architecture: Architecture.ARM_64,
    invokeMode: InvokeMode.BUFFERED, // Default, can be overridden for streaming
    description: 'Next.js SSR function optimized for page rendering',
  },
  [LambdaFunctionType.API]: {
    memorySize: 512,
    timeout: Duration.seconds(15),
    architecture: Architecture.ARM_64,
    invokeMode: InvokeMode.BUFFERED, // API functions typically don't need streaming
    description: 'Next.js API function optimized for fast response',
  },
  [LambdaFunctionType.IMAGE]: {
    memorySize: 1536,
    timeout: Duration.seconds(60),
    architecture: Architecture.ARM_64,
    invokeMode: InvokeMode.BUFFERED, // Image processing doesn't benefit from streaming
    description: 'Next.js image optimization function',
  },
  [LambdaFunctionType.REVALIDATION]: {
    memorySize: 256,
    timeout: Duration.seconds(30),
    architecture: Architecture.ARM_64,
    invokeMode: InvokeMode.BUFFERED, // Revalidation is typically batch processing
    description: 'Next.js revalidation function for cache management',
  },
};

/**
 * Get base description for function type
 */
export function getDescriptionForType(functionType: LambdaFunctionType): string {
  return FUNCTION_TYPE_CONFIGS[functionType].description;
}

/**
 * Get invoke mode based on function type and streaming configuration
 */
export function getInvokeModeForFunction(functionType: LambdaFunctionType, streaming: boolean = false): InvokeMode {
  // Override invoke mode for streaming functions
  if (streaming && functionType === LambdaFunctionType.SERVER) {
    return InvokeMode.RESPONSE_STREAM;
  }

  return FUNCTION_TYPE_CONFIGS[functionType].invokeMode;
}

/**
 * Get optimized function properties based on ParsedServerFunction
 */
export function getFunctionPropsFromServerFunction(
  scope: Construct,
  serverFunction: ParsedServerFunction,
  environment: Record<string, string> = {}
): {
  functionProps: Omit<FunctionProps, 'code' | 'handler'>;
  invokeMode: InvokeMode;
} {
  const functionType = getFunctionTypeFromServerFunction(serverFunction);
  const config = FUNCTION_TYPE_CONFIGS[functionType];

  // Enhanced environment with streaming information
  const enhancedEnvironment = {
    ...environment,
    NEXT_STREAMING: serverFunction.streaming.toString(),
    NEXT_FUNCTION_NAME: serverFunction.name,
    NEXT_FUNCTION_TYPE: functionType,
  };

  // Apply streaming optimizations if enabled
  const streamingOptimizations = serverFunction.streaming ? getStreamingOptimizations(functionType) : {};

  const baseProps: Omit<FunctionProps, 'code' | 'handler'> = {
    runtime: Runtime.NODEJS_20_X,
    architecture: config.architecture,
    memorySize: streamingOptimizations.memorySize || config.memorySize,
    timeout: streamingOptimizations.timeout || config.timeout,
    environment: enhancedEnvironment,
    description: generateFunctionDescription(serverFunction, functionType),
    functionName: PhysicalName.GENERATE_IF_NEEDED,
    ...streamingOptimizations.additionalProps,
  };

  return {
    functionProps: baseProps,
    invokeMode: getInvokeModeForFunction(functionType, serverFunction.streaming),
  };
}

/**
 * Get streaming-specific optimizations
 */
function getStreamingOptimizations(functionType: LambdaFunctionType): {
  memorySize?: number;
  timeout?: Duration;
  additionalProps?: Partial<FunctionProps>;
} {
  switch (functionType) {
    case LambdaFunctionType.SERVER:
      return {
        memorySize: 1536, // More memory for streaming
        timeout: Duration.seconds(45), // Longer timeout for streaming
      };
    default:
      return {};
  }
}

/**
 * Generate comprehensive function description
 */
function generateFunctionDescription(serverFunction: ParsedServerFunction, functionType: LambdaFunctionType): string {
  const baseDescription = getDescriptionForType(functionType);
  const streamingInfo = serverFunction.streaming ? ' | Streaming: Enabled' : ' | Streaming: Disabled';
  const wrapperInfo = serverFunction.wrapper ? ` | Wrapper: ${serverFunction.wrapper}` : '';

  return `${baseDescription}${streamingInfo}${wrapperInfo}`;
}

/**
 * Get common function properties for standard configurations
 * Enhanced with function type detection and streaming support
 */
export function getCommonFunctionProps(
  scope: Construct,
  functionName: string,
  environment: Record<string, string> = {}
): Partial<FunctionProps> {
  const functionType = getUtilityFunctionType(functionName);
  const config = FUNCTION_TYPE_CONFIGS[functionType];

  return {
    runtime: Runtime.NODEJS_20_X,
    architecture: config.architecture,
    memorySize: config.memorySize,
    timeout: config.timeout,
    environment: {
      ...environment,
      NEXT_FUNCTION_NAME: functionName,
      NEXT_FUNCTION_TYPE: functionType,
    },
    description: `${config.description} | Function: ${functionName}`,
    functionName: PhysicalName.GENERATE_IF_NEEDED,
  };
}

const UTILITY_FUNCTION_TYPE_MAP: Record<string, LambdaFunctionType> = {
  'image-optimizer': LambdaFunctionType.IMAGE,
  'revalidation-queue': LambdaFunctionType.REVALIDATION,
  'revalidation-insert': LambdaFunctionType.REVALIDATION,
  'nextjs-bucket-deployment': LambdaFunctionType.SERVER,
  server: LambdaFunctionType.SERVER,
};

function getUtilityFunctionType(functionName: string): LambdaFunctionType {
  return UTILITY_FUNCTION_TYPE_MAP[functionName] || LambdaFunctionType.SERVER;
}
