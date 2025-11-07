// Environment configuration
const getEnvVar = (key: string, defaultValue = ''): string => {
  return (window as any).__ENV__?.[key] || import.meta.env?.[key] || defaultValue;
};

export const ENV = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  API_BASE_URL: getEnvVar('REACT_APP_API_BASE_URL', '/api'),
  MAP_API_KEY: getEnvVar('REACT_APP_MAP_API_KEY', ''),
  ENVIRONMENT: getEnvVar('REACT_APP_ENVIRONMENT', 'development'),
  
  // Feature flags
  ENABLE_ANALYTICS: getEnvVar('REACT_APP_ENABLE_ANALYTICS') === 'true',
  ENABLE_PUSH_NOTIFICATIONS: getEnvVar('REACT_APP_ENABLE_PUSH_NOTIFICATIONS') === 'true',
  
  // Development helpers
  IS_DEVELOPMENT: getEnvVar('NODE_ENV', 'development') === 'development',
  IS_PRODUCTION: getEnvVar('NODE_ENV', 'development') === 'production',
  IS_TEST: getEnvVar('NODE_ENV', 'development') === 'test',
} as const;

// Validate required environment variables
export function validateEnvironment(): void {
  const requiredVars = ['REACT_APP_API_BASE_URL'];
  const missingVars = requiredVars.filter(varName => !getEnvVar(varName));
  
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars);
    console.warn('Please check your .env file and ensure all required variables are set.');
  }
}

// Call validation on import
if (ENV.IS_DEVELOPMENT) {
  validateEnvironment();
}