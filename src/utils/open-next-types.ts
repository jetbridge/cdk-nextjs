/**
 * Edge function configuration for CloudFront
 */
export interface OpenNextEdgeFunction {
  /** Edge function name */
  name: string;
  /** Deployment ID for the edge function */
  deploymentId: string;
  /** Runtime environment for the edge function */
  runtime?: string;
  /** Environment variables for the edge function */
  environment?: Record<string, string>;
}

/**
 * Origin configuration for open-next output
 */
export interface OpenNextOrigin {
  /** Type of origin - either function or S3 */
  type: 'function' | 's3';
  /** Lambda function handler path */
  handler?: string;
  /** Bundle path for the function code */
  bundle?: string;
  /** Whether streaming is enabled */
  streaming?: boolean;
  /** Image loader configuration */
  imageLoader?: string;
  /** Function wrapper configuration */
  wrapper?: string;
  /** Function converter configuration */
  converter?: string;
  /** Queue configuration for the function */
  queue?: string;
  /** Incremental cache configuration */
  incrementalCache?: string;
  /** Tag cache configuration */
  tagCache?: string;
  /** Origin path for S3 origins */
  originPath?: string;
  /** Copy configurations for static assets */
  copy?: Array<{
    /** Source path */
    from: string;
    /** Destination path */
    to: string;
    /** Whether the file should be cached */
    cached: boolean;
    /** Versioned subdirectory */
    versionedSubDir?: string;
  }>;
}

/**
 * CloudFront behavior pattern configuration
 */
export interface OpenNextBehavior {
  /** Path pattern for CloudFront behavior */
  pattern: string;
  /** Origin name that this behavior should route to */
  origin: string;
}

/**
 * Additional properties for open-next configuration
 */
export interface OpenNextAdditionalProps {
  /** Warmer function configuration */
  warmer?: {
    /** Handler path for warmer function */
    handler: string;
    /** Bundle path for warmer function */
    bundle: string;
  };
  /** Initialization function configuration */
  initializationFunction?: {
    /** Handler path for initialization function */
    handler: string;
    /** Bundle path for initialization function */
    bundle: string;
  };
  /** Revalidation function configuration */
  revalidationFunction?: {
    /** Handler path for revalidation function */
    handler: string;
    /** Bundle path for revalidation function */
    bundle: string;
  };
}

/**
 * Complete open-next output configuration
 */
export interface OpenNextOutput {
  /** Edge functions configuration */
  edgeFunctions: Record<string, OpenNextEdgeFunction>;
  /** Origins configuration mapping */
  origins: Record<string, OpenNextOrigin>;
  /** Behaviors configuration array */
  behaviors: OpenNextBehavior[];
  /** Additional properties for advanced configurations */
  additionalProps?: OpenNextAdditionalProps;
}

/**
 * Parsed server function configuration for CDK usage
 */
export interface ParsedServerFunction {
  /** Function name identifier */
  name: string;
  /** Local bundle path for the function code */
  bundlePath: string;
  /** Lambda handler path */
  handler: string;
  /** Whether streaming is enabled for this function */
  streaming: boolean;
  /** Function wrapper configuration */
  wrapper?: string;
  /** Function converter configuration */
  converter?: string;
  /** Queue configuration */
  queue?: string;
  /** Incremental cache configuration */
  incrementalCache?: string;
  /** Tag cache configuration */
  tagCache?: string;
}

/**
 * Validation result for open-next output
 */
export interface OpenNextValidationResult {
  /** Whether the configuration is valid */
  isValid: boolean;
  /** Array of validation errors */
  errors: string[];
  /** Array of validation warnings */
  warnings: string[];
}

/**
 * Validates the open-next output configuration
 */
export function validateOpenNextOutput(output: any): OpenNextValidationResult {
  const result: OpenNextValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (!output) {
    result.isValid = false;
    result.errors.push('OpenNext output is null or undefined');
    return result;
  }

  // Validate required fields
  if (!output.origins || typeof output.origins !== 'object') {
    result.isValid = false;
    result.errors.push("Missing or invalid 'origins' configuration");
  }

  if (!output.behaviors || !Array.isArray(output.behaviors)) {
    result.isValid = false;
    result.errors.push("Missing or invalid 'behaviors' configuration");
  }

  // Validate origins
  if (output.origins) {
    for (const [name, origin] of Object.entries(output.origins)) {
      if (typeof origin !== 'object' || !origin) {
        result.isValid = false;
        result.errors.push(`Invalid origin configuration for '${name}'`);
        continue;
      }

      const typedOrigin = origin as any;
      if (!typedOrigin.type || !['function', 's3'].includes(typedOrigin.type)) {
        result.isValid = false;
        result.errors.push(`Invalid or missing type for origin '${name}'`);
      }

      if (typedOrigin.type === 'function' && !typedOrigin.bundle) {
        result.warnings.push(`Function origin '${name}' has no bundle path`);
      }
    }
  }

  // Validate behaviors
  if (output.behaviors && Array.isArray(output.behaviors)) {
    for (let i = 0; i < output.behaviors.length; i++) {
      const behavior = output.behaviors[i];
      if (!behavior.pattern || !behavior.origin) {
        result.isValid = false;
        result.errors.push(`Invalid behavior at index ${i}: missing pattern or origin`);
      }
    }
  }

  return result;
}

/**
 * Enhanced behavior configuration with pre-processed metadata
 * This eliminates the need for repeated pattern matching and lookups
 */
export interface ProcessedBehaviorConfig {
  /** Original path pattern */
  pattern: string;
  /** Origin identifier */
  origin: string;
  /** Type of origin for easy classification */
  originType: 'function' | 'imageOptimizer' | 's3' | 'custom';
  /** Associated server function if origin is a function */
  serverFunction?: ParsedServerFunction;
  /** Function name for easy reference */
  functionName?: string;
  /** Lambda function type for optimization */
  functionType?: import('./common-lambda-props').LambdaFunctionType;
  /** Pre-generated description for the function */
  description?: string;
  /** Cache policy type hint */
  cachePolicyType?: 'server' | 'image' | 'static';
  /** Priority for behavior ordering (lower = higher priority) */
  priority: number;
}

/**
 * Utility class to process and enhance behavior configurations
 * Eliminates repeated pattern matching across components
 */
export class BehaviorProcessor {
  private serverFunctions: Map<string, ParsedServerFunction> = new Map();
  private processedBehaviors?: ProcessedBehaviorConfig[];

  constructor(
    private behaviors: OpenNextBehavior[],
    serverFunctions: ParsedServerFunction[]
  ) {
    // Build function lookup map
    for (const func of serverFunctions) {
      this.serverFunctions.set(func.name, func);
    }
  }

  /**
   * Process all behaviors and return enhanced configurations
   */
  public getProcessedBehaviors(): ProcessedBehaviorConfig[] {
    if (this.processedBehaviors) {
      return this.processedBehaviors;
    }

    this.processedBehaviors = this.behaviors.map((behavior, index) => this.processBehavior(behavior, index));

    // Sort by priority (specific patterns first, wildcard last)
    this.processedBehaviors.sort((a, b) => a.priority - b.priority);

    return this.processedBehaviors;
  }

  /**
   * Get behaviors by origin type
   */
  public getBehaviorsByOriginType(originType: ProcessedBehaviorConfig['originType']): ProcessedBehaviorConfig[] {
    return this.getProcessedBehaviors().filter((b) => b.originType === originType);
  }

  /**
   * Get behaviors for a specific function
   */
  public getBehaviorsForFunction(functionName: string): ProcessedBehaviorConfig[] {
    return this.getProcessedBehaviors().filter(
      (b) => b.functionName === functionName || this.isPatternForFunction(b, functionName)
    );
  }

  /**
   * Get function names that have associated behaviors
   */
  public getFunctionNames(): string[] {
    const functions = new Set<string>();
    for (const behavior of this.getProcessedBehaviors()) {
      if (behavior.functionName) {
        functions.add(behavior.functionName);
      }
    }
    return Array.from(functions);
  }

  /**
   * Get function names that are actually used in CloudFront behaviors
   * This helps avoid creating unused Lambda functions
   */
  public getUsedFunctionNames(): string[] {
    const usedFunctions = new Set<string>();

    for (const behavior of this.behaviors) {
      if (this.serverFunctions.has(behavior.origin)) {
        usedFunctions.add(behavior.origin);
      }
    }

    return Array.from(usedFunctions);
  }

  /**
   * Check if a specific function is actually used in behaviors
   */
  public isFunctionUsed(functionName: string): boolean {
    return this.behaviors.some((behavior) => behavior.origin === functionName);
  }

  private processBehavior(behavior: OpenNextBehavior, index: number): ProcessedBehaviorConfig {
    const { detectFunctionType, getDescriptionForType } = require('./common-lambda-props');

    let originType: ProcessedBehaviorConfig['originType'] = 'custom';
    let serverFunction: ParsedServerFunction | undefined;
    let functionName: string | undefined;
    let functionType: any;
    let description: string | undefined;
    let cachePolicyType: ProcessedBehaviorConfig['cachePolicyType'];
    let priority = index;

    // Determine origin type and associated data
    if (this.serverFunctions.has(behavior.origin)) {
      originType = 'function';
      serverFunction = this.serverFunctions.get(behavior.origin);
      functionName = behavior.origin;

      if (functionName) {
        functionType = detectFunctionType(functionName);
        const baseDescription = getDescriptionForType(functionType);
        description = `${baseDescription} | Handles: ${behavior.pattern}`;
        cachePolicyType = 'server';
      }
    } else if (behavior.origin === 'imageOptimizer') {
      originType = 'imageOptimizer';
      description = 'Next.js Image Optimization Function';
      cachePolicyType = 'image';
      priority = 100; // Lower priority than function routes
    } else if (behavior.origin === 's3') {
      originType = 's3';
      description = 'Static Assets';
      cachePolicyType = 'static';
      priority = 200; // Lowest priority
    }

    // Special pattern priorities
    if (behavior.pattern === '*') {
      priority = 1000; // Wildcard always last
    } else if (behavior.pattern.includes('api/')) {
      priority = 10; // API routes high priority
    } else if (behavior.pattern.includes('_next/')) {
      priority = 20; // Next.js internals high priority
    }

    return {
      pattern: behavior.pattern,
      origin: behavior.origin,
      originType,
      serverFunction,
      functionName,
      functionType,
      description,
      cachePolicyType,
      priority,
    };
  }

  private isPatternForFunction(behavior: ProcessedBehaviorConfig, functionName: string): boolean {
    // Image optimizer origin is handled by image-related functions
    if (behavior.origin === 'imageOptimizer' && functionName.toLowerCase().includes('image')) {
      return true;
    }

    // Default origin is handled by main server function
    if (
      behavior.origin === 'default' &&
      (functionName === 'default' || functionName.toLowerCase().includes('server'))
    ) {
      return true;
    }

    // API function origin is handled by API-related functions
    if (behavior.origin === 'apiFn' && functionName.toLowerCase().includes('api')) {
      return true;
    }

    return false;
  }
}
