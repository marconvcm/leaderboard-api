import { apiKeyValidation } from './apiKeyValidation';

describe('apiKeyValidation', () => {
   const OLD_ENV = process.env;

   beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
   });

   afterAll(() => {
      process.env = OLD_ENV;
   });

   it('returns true for a valid API key from env', async () => {
      process.env.API_KEY_PROVIDER = 'env';
      process.env.API_KEYS = 'key1,key2,key3';
      expect(await apiKeyValidation('key2')).toBe(true);
   });

   it('returns false for an invalid API key from env', async () => {
      process.env.API_KEY_PROVIDER = 'env';
      process.env.API_KEYS = 'key1,key2,key3';
      expect(await apiKeyValidation('invalid')).toBe(false);
   });

   it('returns false for external provider (not implemented)', async () => {
      process.env.API_KEY_PROVIDER = 'external';
      process.env.API_KEYS = 'key1,key2,key3';
      expect(await apiKeyValidation('key1')).toBe(false);
   });

   it('returns false if API_KEYS is not set', async () => {
      process.env.API_KEY_PROVIDER = 'env';
      delete process.env.API_KEYS;
      expect(await apiKeyValidation('key1')).toBe(false);
   });
});
