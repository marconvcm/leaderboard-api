import { apiKeyValidation } from './apiKeyValidation';
import * as apiKeyService from '../services/apiKey.service';

// Mock the API key service
jest.mock('../services/apiKey.service');
jest.mock('./logger', () => ({
   error: jest.fn(),
   warn: jest.fn(),
   info: jest.fn()
}));

describe('apiKeyValidation', () => {
   beforeEach(() => {
      jest.resetAllMocks();
   });

   it('returns true for a valid and enabled API key', async () => {
      // Mock the API key service to return a valid API key
      (apiKeyService.getApiKey as jest.Mock).mockResolvedValue({
         key: 'valid-key',
         secret: 'secret',
         enabled: true
      });
      
      (apiKeyService.updateLastUsed as jest.Mock).mockResolvedValue(true);
      
      const result = await apiKeyValidation('valid-key');
      
      expect(result).toBe(true);
      expect(apiKeyService.getApiKey).toHaveBeenCalledWith('valid-key');
      expect(apiKeyService.updateLastUsed).toHaveBeenCalledWith('valid-key');
   });

   it('returns false for a disabled API key', async () => {
      // Mock the API key service to return a disabled API key
      (apiKeyService.getApiKey as jest.Mock).mockResolvedValue({
         key: 'disabled-key',
         secret: 'secret',
         enabled: false
      });
      
      const result = await apiKeyValidation('disabled-key');
      
      expect(result).toBe(false);
      expect(apiKeyService.getApiKey).toHaveBeenCalledWith('disabled-key');
      expect(apiKeyService.updateLastUsed).not.toHaveBeenCalled();
   });

   it('returns false for a non-existent API key', async () => {
      // Mock the API key service to return null (key not found)
      (apiKeyService.getApiKey as jest.Mock).mockResolvedValue(null);
      
      const result = await apiKeyValidation('non-existent-key');
      
      expect(result).toBe(false);
      expect(apiKeyService.getApiKey).toHaveBeenCalledWith('non-existent-key');
      expect(apiKeyService.updateLastUsed).not.toHaveBeenCalled();
   });

   it('returns false if an error occurs', async () => {
      // Mock the API key service to throw an error
      (apiKeyService.getApiKey as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      const result = await apiKeyValidation('error-key');
      
      expect(result).toBe(false);
      expect(apiKeyService.getApiKey).toHaveBeenCalledWith('error-key');
      expect(apiKeyService.updateLastUsed).not.toHaveBeenCalled();
   });
});
