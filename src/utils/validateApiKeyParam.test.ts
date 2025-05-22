import { Request, Response, NextFunction } from 'express';
import { validateApiKey } from './validateApiKeyParam';
import * as apiKeyService from '../services/apiKey.service';

// Mock the API key service
jest.mock('../services/apiKey.service', () => ({
  getApiKey: jest.fn(),
  updateLastUsed: jest.fn()
}));

// Mock the logger
jest.mock('./logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('validateApiKey middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() if the API key is valid', async () => {
    // Arrange
    const validApiKey = 'valid-api-key';
    (apiKeyService.getApiKey as jest.Mock).mockResolvedValue({
      key: validApiKey,
      name: 'Test API Key',
      enabled: true
    });

    // Act
    await validateApiKey(validApiKey)(req as Request, res as Response, next);

    // Assert
    expect(apiKeyService.getApiKey).toHaveBeenCalledWith(validApiKey);
    expect(apiKeyService.updateLastUsed).toHaveBeenCalledWith(validApiKey);
    // @ts-ignore
    expect(req.apiKey).toBe(validApiKey);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 401 if the API key is not found', async () => {
    // Arrange
    const invalidApiKey = 'invalid-api-key';
    (apiKeyService.getApiKey as jest.Mock).mockResolvedValue(null);

    // Act
    await validateApiKey(invalidApiKey)(req as Request, res as Response, next);

    // Assert
    expect(apiKeyService.getApiKey).toHaveBeenCalledWith(invalidApiKey);
    expect(apiKeyService.updateLastUsed).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
  });

  it('should return 401 if no API key is provided', async () => {
    // Arrange
    const emptyApiKey = '';

    // Act
    await validateApiKey(emptyApiKey)(req as Request, res as Response, next);

    // Assert
    expect(apiKeyService.getApiKey).not.toHaveBeenCalled();
    expect(apiKeyService.updateLastUsed).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'API key required' });
  });

  it('should return 500 if an error occurs during validation', async () => {
    // Arrange
    const validApiKey = 'valid-api-key';
    const error = new Error('Database error');
    (apiKeyService.getApiKey as jest.Mock).mockRejectedValue(error);

    // Act
    await validateApiKey(validApiKey)(req as Request, res as Response, next);

    // Assert
    expect(apiKeyService.getApiKey).toHaveBeenCalledWith(validApiKey);
    expect(apiKeyService.updateLastUsed).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
