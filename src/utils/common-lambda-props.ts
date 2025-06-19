import { Duration, PhysicalName, Stack } from "aws-cdk-lib";
import {
  Architecture,
  FunctionProps,
  InvokeMode,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

/**
 * Lambda 함수의 타입을 정의합니다.
 */
export enum LambdaFunctionType {
  /** SSR (Server-Side Rendering) 함수 - 기본 설정 */
  SERVER = "server",
  /** API 전용 함수 - 빠른 응답과 비용 효율성에 최적화 */
  API = "api",
  /** 이미지 최적화 함수 - 메모리 집약적 작업에 최적화 */
  IMAGE = "image",
  /** Revalidation 함수 - 가벼운 작업에 최적화 */
  REVALIDATION = "revalidation",
}

/**
 * 각 함수 타입별 최적화된 설정을 정의합니다.
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
    memorySize: 1536, // SSR은 메모리 집약적
    timeout: Duration.seconds(10),
    description: "Next.js Server-Side Rendering Handler",
    environment: {
      // SSR 함수는 기본 환경변수만 사용
    },
    invokeMode: InvokeMode.RESPONSE_STREAM, // SSR은 스트리밍 지원
  },
  [LambdaFunctionType.API]: {
    memorySize: 1024, // API는 가볍고 빠른 응답이 중요
    timeout: Duration.seconds(5),
    description: "Next.js API Handler",
    environment: {
      NODE_ENV: "production", // API 함수는 production 모드 필수
      NODE_OPTIONS: "--enable-source-maps", // 디버깅을 위한 소스맵 활성화
    },
    invokeMode: InvokeMode.BUFFERED, // API는 버퍼링된 응답 사용 (안정성과 호환성)
  },
  [LambdaFunctionType.IMAGE]: {
    memorySize: 2048, // 이미지 처리는 메모리 집약적
    timeout: Duration.seconds(15),
    description: "Next.js Image Optimization Handler",
    environment: {
      NODE_ENV: "production",
      // 이미지 처리 최적화 설정
      NEXT_SHARP: "1", // Sharp 라이브러리 사용 강제
    },
    invokeMode: InvokeMode.BUFFERED, // 이미지 최적화는 버퍼링 사용
  },
  [LambdaFunctionType.REVALIDATION]: {
    memorySize: 512, // Revalidation은 가벼운 작업
    timeout: Duration.seconds(30),
    description: "Next.js Revalidation Handler",
    environment: {
      NODE_ENV: "production",
      // 캐시 무효화 최적화
      REVALIDATION_MODE: "background",
    },
    invokeMode: InvokeMode.BUFFERED, // Revalidation은 버퍼링 사용
  },
};

/**
 * 함수 이름을 기반으로 Lambda 함수 타입을 감지합니다.
 */
export function detectFunctionType(functionName: string): LambdaFunctionType {
  const name = functionName.toLowerCase();

  // 명시적인 매핑을 통한 타입 감지
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

  // 기본값은 SERVER 타입
  return LambdaFunctionType.SERVER;
}

/**
 * 함수 타입별 기본 환경변수를 반환합니다.
 */
export function getDefaultEnvironmentForType(
  functionType: LambdaFunctionType,
): Record<string, string> {
  return FUNCTION_TYPE_CONFIGS[functionType].environment;
}

/**
 * 함수 타입별 기본 설명을 반환합니다.
 */
export function getDescriptionForType(
  functionType: LambdaFunctionType,
): string {
  return FUNCTION_TYPE_CONFIGS[functionType].description;
}

/**
 * 함수 타입별 환경변수를 병합합니다.
 * 우선순위: userEnvironment > typeEnvironment
 */
export function mergeEnvironmentVariables(
  functionType: LambdaFunctionType,
  userEnvironment: Record<string, string> = {},
): Record<string, string> {
  const typeEnvironment = getDefaultEnvironmentForType(functionType);

  return {
    ...typeEnvironment,
    ...userEnvironment, // 사용자 설정이 우선
  };
}

/**
 * 공통 Lambda 함수 속성을 반환합니다.
 */
function getBaseFunctionProps(
  scope: Construct,
): Omit<
  FunctionProps,
  "code" | "handler" | "memorySize" | "timeout" | "description" | "environment"
> {
  return {
    architecture: Architecture.ARM_64, // 모든 함수에서 ARM64 사용 (비용 효율성)
    runtime: Runtime.NODEJS_20_X,
    // prevents "Resolution error: Cannot use resource in a cross-environment
    // fashion, the resource's physical name must be explicit set or use
    // PhysicalName.GENERATE_IF_NEEDED."
    functionName:
      Stack.of(scope).region !== "us-east-1"
        ? PhysicalName.GENERATE_IF_NEEDED
        : undefined,
  };
}

/**
 * 지정된 타입에 최적화된 Lambda 함수 속성을 반환합니다.
 */
export function getFunctionProps(
  scope: Construct,
  functionType: LambdaFunctionType,
  userEnvironment?: Record<string, string>,
): Omit<FunctionProps, "code" | "handler"> {
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
 * 함수 이름을 기반으로 자동으로 최적화된 Lambda 함수 속성을 반환합니다.
 */
export function getOptimizedFunctionProps(
  scope: Construct,
  functionName: string,
  userEnvironment?: Record<string, string>,
): Omit<FunctionProps, "code" | "handler"> {
  const functionType = detectFunctionType(functionName);
  return getFunctionProps(scope, functionType, userEnvironment);
}

// 하위 호환성을 위한 기존 함수들 유지
export function getCommonFunctionProps(
  scope: Construct,
): Omit<FunctionProps, "code" | "handler"> {
  return getFunctionProps(scope, LambdaFunctionType.SERVER);
}

/**
 * @deprecated getOptimizedFunctionProps 또는 getFunctionProps를 사용하세요
 */
export function getApiFunctionProps(
  scope: Construct,
): Omit<FunctionProps, "code" | "handler"> {
  return getFunctionProps(scope, LambdaFunctionType.API);
}

/**
 * 함수 타입별 기본 Invoke Mode를 반환합니다.
 */
export function getInvokeModeForType(
  functionType: LambdaFunctionType,
): InvokeMode {
  return FUNCTION_TYPE_CONFIGS[functionType].invokeMode;
}
