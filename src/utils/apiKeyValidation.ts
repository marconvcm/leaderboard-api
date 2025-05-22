import dotenv from 'dotenv';
dotenv.config();

export type ApiKeyProvider = 'env' | 'external';

// This function will be extended to support external validation
export async function apiKeyValidation(apiKey: string): Promise<boolean> {
   // Provider is determined by env, default to 'env'
   const provider = process.env.API_KEY_PROVIDER as ApiKeyProvider || 'env';

   if (provider === 'env') {
      // Accept a comma-separated list of valid API keys in .env as API_KEYS
      const validKeys = process.env.API_KEYS?.split(',').map(k => k.trim()) || [];
      return validKeys.includes(apiKey);
   } else if (provider === 'external') {
      // Placeholder for external service validation
      // TODO: Implement external service call
      return false;
   }
   return false;
}
