import { Duration, PhysicalName, Stack } from 'aws-cdk-lib';
import { Architecture, FunctionProps, InvokeMode, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

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
 * Defines optimized configurations for each function type.
 */
const FUNCTION_TYPE_CONFIGS: Record<
  LambdaFunctionType,
  {
    memorySize: number;
    timeout: Duration;
    description: string;
    environment: Record<string, string>;
    invokeMode: InvokeMode;
  }
> = {
  [LambdaFunctionType.SERVER]: {
    memorySize: 1536, // SSR is memory-intensive
    timeout: Duration.seconds(10),
    description: 'Next.js Server-Side Rendering Handler',
    environment: {
      // SSR function uses only default environment variables
    },
    invokeMode: InvokeMode.RESPONSE_STREAM, // SSR supports streaming
  },
  [LambdaFunctionType.API]: {
    memorySize: 1024, // API requires lightweight and fast response
    timeout: Duration.seconds(5),
    description: 'Next.js API Handler',
    environment: {
      NODE_ENV: 'production', // API function requires production mode
      NODE_OPTIONS: '--enable-source-maps', // Enable source maps for debugging
    },
    invokeMode: InvokeMode.BUFFERED, // API uses buffered response (stability and compatibility)
  },
  [LambdaFunctionType.IMAGE]: {
    memorySize: 2048, // Image processing is memory-intensive
    timeout: Duration.seconds(15),
    description: 'Next.js Image Optimization Handler',
    environment: {
      NODE_ENV: 'production',
      // Image processing optimization settings
      NEXT_SHARP: '1', // Force use of Sharp library
    },
    invokeMode: InvokeMode.BUFFERED, // Image optimization uses buffering
  },
  [LambdaFunctionType.REVALIDATION]: {
    memorySize: 512, // Revalidation is lightweight
    timeout: Duration.seconds(30),
    description: 'Next.js Revalidation Handler',
    environment: {
      NODE_ENV: 'production',
      // Cache invalidation optimization
      REVALIDATION_MODE: 'background',
    },
    invokeMode: InvokeMode.BUFFERED, // Revalidation uses buffering
  },
};

/**
 * Detects Lambda function type based on function name.
 */
export function detectFunctionType(functionName: string): LambdaFunctionType {
  const name = functionName.toLowerCase();

  // Type detection through explicit mapping
  const typePatterns: Array<[RegExp, LambdaFunctionType]> = [
    [/^(api|apifn)$/i, LambdaFunctionType.API],
    [/api/i, LambdaFunctionType.API],
    [/(image|img)/i, LambdaFunctionType.IMAGE],
    [/(revalidat|cache)/i, LambdaFunctionType.REVALIDATION],
  ];

  for (const [pattern, type] of typePatterns) {
    if (pattern.test(name)) {
      return type;
    }
  }

  // Default is SERVER type
  return LambdaFunctionType.SERVER;
}

/**
 * Returns default environment variables for function type.
 */
export function getDefaultEnvironmentForType(functionType: LambdaFunctionType): Record<string, string> {
  return FUNCTION_TYPE_CONFIGS[functionType].environment;
}

/**
 * Returns default description for function type.
 */
export function getDescriptionForType(functionType: LambdaFunctionType): string {
  return FUNCTION_TYPE_CONFIGS[functionType].description;
}

/**
 * Merges environment variables by function type.
 * Priority: userEnvironment > typeEnvironment
 */
export function mergeEnvironmentVariables(
  functionType: LambdaFunctionType,
  userEnvironment: Record<string, string> = {}
): Record<string, string> {
  const typeEnvironment = getDefaultEnvironmentForType(functionType);

  return {
    ...typeEnvironment,
    ...userEnvironment, // User settings take priority
  };
}

/**
 * Returns common Lambda function properties.
 */
function getBaseFunctionProps(
  scope: Construct
): Omit<FunctionProps, 'code' | 'handler' | 'memorySize' | 'timeout' | 'description' | 'environment'> {
  return {
    architecture: Architecture.ARM_64, // Use ARM64 for all functions (cost efficiency)
    runtime: Runtime.NODEJS_20_X,
    // prevents "Resolution error: Cannot use resource in a cross-environment
    // fashion, the resource's physical name must be explicit set or use
    // PhysicalName.GENERATE_IF_NEEDED."
    functionName: Stack.of(scope).region !== 'us-east-1' ? PhysicalName.GENERATE_IF_NEEDED : undefined,
  };
}

/**
 * Returns Lambda function properties optimized for the specified type.
 */
export function getFunctionProps(
  scope: Construct,
  functionType: LambdaFunctionType,
  userEnvironment?: Record<string, string>
): Omit<FunctionProps, 'code' | 'handler'> {
  const baseProps = getBaseFunctionProps(scope);
  const typeConfig = FUNCTION_TYPE_CONFIGS[functionType];
  const environment = mergeEnvironmentVariables(functionType, userEnvironment);

  return {
    ...baseProps,
    memorySize: typeConfig.memorySize,
    timeout: typeConfig.timeout,
    description: typeConfig.description,
    environment,
  };
}

/**
 * Returns automatically optimized Lambda function properties based on function name.
 */
export function getOptimizedFunctionProps(
  scope: Construct,
  functionName: string,
  userEnvironment?: Record<string, string>
): Omit<FunctionProps, 'code' | 'handler'> {
  const functionType = detectFunctionType(functionName);
  return getFunctionProps(scope, functionType, userEnvironment);
}

// Maintain existing functions for backward compatibility
export function getCommonFunctionProps(scope: Construct): Omit<FunctionProps, 'code' | 'handler'> {
  return getFunctionProps(scope, LambdaFunctionType.SERVER);
}

/**
 * @deprecated Use getOptimizedFunctionProps or getFunctionProps instead
 */
export function getApiFunctionProps(scope: Construct): Omit<FunctionProps, 'code' | 'handler'> {
  return getFunctionProps(scope, LambdaFunctionType.API);
}

/**
 * Returns default Invoke Mode for function type.
 */
export function getInvokeModeForType(functionType: LambdaFunctionType): InvokeMode {
  return FUNCTION_TYPE_CONFIGS[functionType].invokeMode;
}
