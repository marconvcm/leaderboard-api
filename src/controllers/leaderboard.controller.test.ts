import { Request, Response } from 'express';
import { addScore, getLeaderboard } from './leaderboard.controller';
import ScoreSegment from '../models/score.model';

// Mock the logger
jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock ScoreSegment
jest.mock('../models/score.model', () => {
  return {
    __esModule: true,
    default: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
  };
});

describe('Leaderboard Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      body: {},
      header: jest.fn().mockReturnValue('test-api-key'),
      query: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    mockNext = jest.fn();
  });

  describe('addScore', () => {
    test('should create a new segment when none exists', async () => {
      // Arrange
      mockRequest.body = { username: 'testUser', score: 100 };
      (ScoreSegment.findOne as jest.Mock).mockResolvedValue(null);
      (ScoreSegment.create as jest.Mock).mockResolvedValue({
        apiKey: 'test-api-key',
        users: new Map().set('testUser', { topScore: 100, entries: [{ score: 100, timestamp: expect.any(Date) }] }),
      });

      // Act
      await addScore(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(ScoreSegment.findOne).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
      expect(ScoreSegment.create).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        users: { testUser: { topScore: 100, entries: [{ score: 100, timestamp: expect.any(Date) }] } },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    test('should update an existing user score when segment exists', async () => {
      // Arrange
      mockRequest.body = { username: 'testUser', score: 150 };
      
      const userEntries: any[] = [];
      const mockUser = {
        topScore: 100,
        entries: userEntries
      };
      
      const mockUsers = new Map();
      mockUsers.set('testUser', mockUser);
      
      const mockSegment = {
        apiKey: 'test-api-key',
        users: mockUsers,
        save: jest.fn().mockResolvedValue(true),
      };
      
      (ScoreSegment.findOne as jest.Mock).mockResolvedValue(mockSegment);

      // Act
      await addScore(
        mockRequest as Request, 
        mockResponse as Response, 
        mockNext
      );

      // Assert
      expect(ScoreSegment.findOne).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
      expect(mockSegment.users.get('testUser').topScore).toBe(150);
      expect(mockSegment.users.get('testUser').entries.length).toBe(1);
      expect(mockSegment.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    test('should add new user when segment exists but user does not', async () => {
      // Arrange
      mockRequest.body = { username: 'newUser', score: 200 };
      
      const mockUsers = new Map();
      // No 'newUser' in the map initially
      
      const mockSegment = {
        apiKey: 'test-api-key',
        users: mockUsers,
        save: jest.fn().mockResolvedValue(true),
      };
      
      (ScoreSegment.findOne as jest.Mock).mockResolvedValue(mockSegment);

      // Act
      await addScore(
        mockRequest as Request, 
        mockResponse as Response, 
        mockNext
      );

      // Assert
      expect(ScoreSegment.findOne).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
      expect(mockSegment.users.get('newUser')).toBeDefined();
      expect(mockSegment.users.get('newUser').topScore).toBe(200);
      expect(mockSegment.users.get('newUser').entries.length).toBe(1);
      expect(mockSegment.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    test('should handle errors properly', async () => {
      // Arrange
      mockRequest.body = { username: 'testUser', score: 100 };
      const mockError = new Error('Test error');
      (ScoreSegment.findOne as jest.Mock).mockRejectedValue(mockError);

      // Act
      await addScore(
        mockRequest as Request, 
        mockResponse as Response, 
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Test error',
        status: 500,
        code: 'INTERNAL_ERROR'
      }));
    });
  });

  describe('getLeaderboard', () => {
    test('should return empty array when no segment exists', async () => {
      // Arrange
      (ScoreSegment.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      await getLeaderboard(
        mockRequest as Request, 
        mockResponse as Response, 
        mockNext
      );

      // Assert
      expect(ScoreSegment.findOne).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    test('should return sorted leaderboard with default limit', async () => {
      // Arrange
      const mockUsers = new Map();
      mockUsers.set('user1', { topScore: 100 });
      mockUsers.set('user2', { topScore: 300 });
      mockUsers.set('user3', { topScore: 200 });
      
      const mockSegment = {
        apiKey: 'test-api-key',
        users: mockUsers,
      };
      
      (ScoreSegment.findOne as jest.Mock).mockResolvedValue(mockSegment);

      // Act
      await getLeaderboard(
        mockRequest as Request, 
        mockResponse as Response, 
        mockNext
      );

      // Assert
      expect(ScoreSegment.findOne).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
      expect(mockResponse.json).toHaveBeenCalledWith([
        { username: 'user2', score: 300 },
        { username: 'user3', score: 200 },
        { username: 'user1', score: 100 }
      ]);
    });

    test('should respect limit parameter', async () => {
      // Arrange
      mockRequest.query = { limit: '2' };
      
      const mockUsers = new Map();
      mockUsers.set('user1', { topScore: 100 });
      mockUsers.set('user2', { topScore: 300 });
      mockUsers.set('user3', { topScore: 200 });
      mockUsers.set('user4', { topScore: 400 });
      
      const mockSegment = {
        apiKey: 'test-api-key',
        users: mockUsers,
      };
      
      (ScoreSegment.findOne as jest.Mock).mockResolvedValue(mockSegment);

      // Act
      await getLeaderboard(
        mockRequest as Request, 
        mockResponse as Response, 
        mockNext
      );

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith([
        { username: 'user4', score: 400 },
        { username: 'user2', score: 300 }
      ]);
    });

    test('should handle errors properly', async () => {
      // Arrange
      const mockError = new Error('Database error');
      (ScoreSegment.findOne as jest.Mock).mockRejectedValue(mockError);

      // Act
      await getLeaderboard(
        mockRequest as Request, 
        mockResponse as Response, 
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Database error',
        status: 500,
        code: 'INTERNAL_ERROR'
      }));
    });
  });
});
