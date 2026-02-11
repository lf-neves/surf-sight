// Cache for SSM parameters fetched at runtime
let ssmCache: {
  databaseUrl?: string;
  jwtSecret?: string;
  openaiApiKey?: string;
  stormglassApiKey?: string;
} = {};

// Fetch SSM parameter at runtime if not available in environment
async function fetchSSMParameter(paramName: string): Promise<string | null> {
  // Only fetch in Lambda environment (not local dev)
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      console.log(`[SSM] Fetching parameter: ${paramName}`);
      const { SSMClient, GetParameterCommand } = await import('@aws-sdk/client-ssm');
      const region = process.env.AWS_REGION || 'us-east-2';
      console.log(`[SSM] Using region: ${region}`);
      
      const ssmClient = new SSMClient({ region });
      
      const command = new GetParameterCommand({
        Name: paramName,
        WithDecryption: true,
      });
      
      const response = await ssmClient.send(command);
      const value = response.Parameter?.Value || null;
      
      if (value) {
        console.log(`[SSM] ✅ Successfully fetched ${paramName} (length: ${value.length})`);
      } else {
        console.log(`[SSM] ⚠️  Parameter ${paramName} exists but has no value`);
      }
      
      return value;
    } catch (error: any) {
      console.error(`[SSM] ❌ Failed to fetch ${paramName}:`, {
        error: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack,
      });
      return null;
    }
  }
  console.log(`[SSM] Skipping fetch (not in Lambda environment)`);
  return null;
}

// Lazy validation - only validate when env is accessed, not at module load
// This ensures environment variables from SSM are available when Lambda runs
// Also supports runtime fetching from SSM if deployment-time resolution fails
async function getEnvAsync() {
  let databaseUrl = process.env.DATABASE_URL || '';
  let jwtSecret = process.env.JWT_SECRET || '';
  const openaiApiKey = process.env.OPENAI_API_KEY || '';
  const stormglassApiKey = process.env.STORMGLASS_API_KEY || '';
  const nodeEnv = process.env.NODE_ENV || 'development';

  // If DATABASE_URL is empty or missing, try fetching from SSM at runtime
  if (!databaseUrl || databaseUrl.trim() === '') {
    console.log('[ENV] DATABASE_URL is empty, fetching from SSM...');
    if (!ssmCache.databaseUrl) {
      const fetched = await fetchSSMParameter('/surf-sight/db/url');
      if (fetched) {
        ssmCache.databaseUrl = fetched;
        databaseUrl = fetched;
        // Also set it in process.env for other code that might check it
        process.env.DATABASE_URL = fetched;
        console.log('[ENV] ✅ DATABASE_URL set from SSM');
      } else {
        console.error('[ENV] ❌ Failed to fetch DATABASE_URL from SSM');
      }
    } else {
      databaseUrl = ssmCache.databaseUrl;
      process.env.DATABASE_URL = ssmCache.databaseUrl;
      console.log('[ENV] ✅ Using cached DATABASE_URL from SSM');
    }
  } else {
    console.log('[ENV] ✅ DATABASE_URL already set in environment');
  }

  // If JWT_SECRET is empty or missing, try fetching from SSM at runtime
  if ((!jwtSecret || jwtSecret.trim() === '') && nodeEnv === 'production') {
    if (!ssmCache.jwtSecret) {
      const fetched = await fetchSSMParameter('/surf-sight/api/jwt-secret');
      if (fetched) {
        ssmCache.jwtSecret = fetched;
        jwtSecret = fetched;
        process.env.JWT_SECRET = fetched;
      }
    } else {
      jwtSecret = ssmCache.jwtSecret;
    }
  }

  // Validate required environment variables (only when accessed)
  if (!databaseUrl || databaseUrl.trim() === '') {
    throw new Error('DATABASE_URL is required. Could not fetch from environment or SSM Parameter Store.');
  }

  if (!jwtSecret && nodeEnv === 'production') {
    throw new Error('JWT_SECRET is required in production.');
  }

  return {
    databaseUrl,
    jwtSecret,
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv,
    openaiApiKey: openaiApiKey || ssmCache.openaiApiKey || '',
    stormglassApiKey: stormglassApiKey || ssmCache.stormglassApiKey || '',
  };
}

// Synchronous version for backward compatibility (non-async access)
// This will throw if DATABASE_URL is not available synchronously
function getEnv() {
  const databaseUrl = process.env.DATABASE_URL || '';
  const jwtSecret = process.env.JWT_SECRET || '';
  const nodeEnv = process.env.NODE_ENV || 'development';

  // If we have cached values from async fetch, use them
  if (!databaseUrl && ssmCache.databaseUrl) {
    return {
      databaseUrl: ssmCache.databaseUrl,
      jwtSecret: ssmCache.jwtSecret || jwtSecret,
      port: parseInt(process.env.PORT || '4000', 10),
      nodeEnv,
      openaiApiKey: ssmCache.openaiApiKey || process.env.OPENAI_API_KEY || '',
      stormglassApiKey: ssmCache.stormglassApiKey || process.env.STORMGLASS_API_KEY || '',
    };
  }

  // Validate required environment variables
  if (!databaseUrl || databaseUrl.trim() === '') {
    // In Lambda, we'll fetch async, but for sync access we need to throw
    // The async version should be used in Lambda handlers
    throw new Error('DATABASE_URL is required. Use getEnvAsync() in async contexts to fetch from SSM.');
  }

  if (!jwtSecret && nodeEnv === 'production') {
    throw new Error('JWT_SECRET is required in production.');
  }

  return {
    databaseUrl,
    jwtSecret,
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv,
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    stormglassApiKey: process.env.STORMGLASS_API_KEY || '',
  };
}

// Export async version for Lambda handlers
export { getEnvAsync };

// Export as a getter function that validates on access
// Note: In Lambda, prefer using getEnvAsync() to fetch from SSM if env vars are missing
export const env = new Proxy({} as ReturnType<typeof getEnv>, {
  get(_target, prop) {
    const envObj = getEnv();
    return (envObj as any)[prop];
  },
  ownKeys() {
    const envObj = getEnv();
    return Reflect.ownKeys(envObj);
  },
  getOwnPropertyDescriptor(_target, prop) {
    const envObj = getEnv();
    return Reflect.getOwnPropertyDescriptor(envObj, prop);
  },
});
