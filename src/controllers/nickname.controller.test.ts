import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as NicknameController from './nickname.controller';
import NicknameEntry from '../models/nickname.model';

// Mock the logger to avoid console output during tests
jest.mock('../utils/logger', () => ({
   info: jest.fn(),
   error: jest.fn(),
   warn: jest.fn(),
   debug: jest.fn()
}));

// Create express app for testing
const app = express();
app.use(express.json());
app.post('/nickname', NicknameController.create);
app.get('/nickname/:hash', NicknameController.getNicknameByHash);
app.get('/nickname/uid/:uid', NicknameController.getNicknameByUID);
app.put('/nickname/:hash', NicknameController.update);

describe('NicknameController', () => {
   let mongoServer: MongoMemoryServer;

   beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
   });

   afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
   });

   beforeEach(async () => {
      // Clear the database before each test
      await NicknameEntry.deleteMany({});
   });

   describe('createNickname', () => {
      it('should create a new nickname entry', async () => {
         const payload = {
            nickname: 'test-nick1',
            UID: '123e4567-e89b-42d3-a456-556642440000'
         };

         const response = await request(app)
            .post('/nickname')
            .send(payload);

         expect(response.status).toBe(201);
         expect(response.body).toHaveProperty('nickname', payload.nickname);
         expect(response.body).toHaveProperty('UID', payload.UID);
         expect(response.body).toHaveProperty('hash');
         expect(response.body.hash).toMatch(/^\d{6}$/);

         // Verify it was saved in the database
         const savedEntry = await NicknameEntry.findOne({ UID: payload.UID });
         expect(savedEntry).toBeTruthy();
         expect(savedEntry?.nickname).toBe(payload.nickname);
      });

      it('should return 409 if UID already has a nickname', async () => {
         // Create initial nickname
         await NicknameEntry.create({
            nickname: 'test-nick1',
            UID: '123e4567-e89b-42d3-a456-556642440000',
            hash: '123456'
         });

         // Try to create another one with same UID
         const payload = {
            nickname: 'test-nick2',
            UID: '123e4567-e89b-42d3-a456-556642440000'
         };

         const response = await request(app)
            .post('/nickname')
            .send(payload);

         expect(response.status).toBe(409);
         expect(response.body.error).toBe('UID already has a nickname assigned');
      });

      it('should validate the nickname format', async () => {
         const payload = {
            nickname: 'too-loooooonnnnggg',
            UID: '123e4567-e89b-42d3-a456-556642440000'
         };

         const response = await request(app)
            .post('/nickname')
            .send(payload);

         expect(response.status).toBe(400);
         expect(response.body).toHaveProperty('error', 'Validation error');
      });

      it('should validate the UID format', async () => {
         const payload = {
            nickname: 'test-nick1',
            UID: 'asdas'
         };

         const response = await request(app)
            .post('/nickname')
            .send(payload);

         expect(response.status).toBe(400);
         expect(response.body).toHaveProperty('error', 'Validation error');
      });
   });

   describe('getNicknameByHash', () => {
      it('should return a nickname entry by hash', async () => {
         // Create a test nickname
         const entry = await NicknameEntry.create({
            nickname: 'test-nick1',
            UID: '123e4567-e89b-42d3-a456-556642440000',
            hash: '123456'
         });

         const response = await request(app)
            .get(`/nickname/${entry.hash}`);

         expect(response.status).toBe(200);
         expect(response.body).toHaveProperty('nickname', 'test-nick1');
         expect(response.body).toHaveProperty('UID', '123e4567-e89b-42d3-a456-556642440000');
         expect(response.body).toHaveProperty('hash', '123456');
      });

      it('should return 404 if hash not found', async () => {
         const response = await request(app)
            .get('/nickname/999999');

         expect(response.status).toBe(404);
         expect(response.body.error).toBe('Nickname not found');
      });
   });

   describe('getNicknameByUID', () => {
      it('should return a nickname entry by UID', async () => {
         // Create a test nickname
         const entry = await NicknameEntry.create({
            nickname: 'test-nick1',
            UID: '123e4567-e89b-42d3-a456-556642440000',
            hash: '123456'
         });

         const response = await request(app)
            .get(`/nickname/uid/${entry.UID}`);

         expect(response.status).toBe(200);
         expect(response.body).toHaveProperty('nickname', 'test-nick1');
         expect(response.body).toHaveProperty('UID', '123e4567-e89b-42d3-a456-556642440000');
         expect(response.body).toHaveProperty('hash', '123456');
      });

      it('should return 404 if UID not found', async () => {
         const response = await request(app)
            .get('/nickname/uid/123e4567-e89b-42d3-a456-556642440999');

         expect(response.status).toBe(404);
         expect(response.body.error).toBe('No nickname found for this UID');
      });
   });

   describe('updateNickname', () => {
      it('should update an existing nickname', async () => {
         // Create initial nickname
         const entry = await NicknameEntry.create({
            nickname: 'test-nick1',
            UID: '123e4567-e89b-42d3-a456-556642440000',
            hash: '123456'
         });
         
         const payload = {
            nickname: 'test-nick2'
         };
         
         const response = await request(app)
            .put(`/nickname/${entry.hash}`)
            .send(payload);
            
         expect(response.status).toBe(200);
         expect(response.body).toHaveProperty('nickname', payload.nickname);
         expect(response.body).toHaveProperty('UID', entry.UID);
         expect(response.body).toHaveProperty('hash', entry.hash);
         expect(response.body).toHaveProperty('updated', true);
         
         // Verify it was updated in the database
         const updatedEntry = await NicknameEntry.findOne({ hash: entry.hash });
         expect(updatedEntry?.nickname).toBe(payload.nickname);
      });
      
      it('should return 404 if nickname not found', async () => {
         const payload = {
            nickname: 'test-nick1'
         };
         
         const response = await request(app)
            .put('/nickname/999999')
            .send(payload);
            
         expect(response.status).toBe(404);
         expect(response.body.error).toBe('Nickname not found');
      });
      
      it('should validate the new nickname format', async () => {
         // Create a nickname
         await NicknameEntry.create({
            nickname: 'test-nick1',
            UID: '123e4567-e89b-42d3-a456-556642440000',
            hash: '123456'
         });
         
         // Try to update with invalid nickname (containing special characters)
         const payload = {
            nickname: 'bad@nick!'
         };
         
         const response = await request(app)
            .put('/nickname/123456')
            .send(payload);
            
         expect(response.status).toBe(400);
         expect(response.body).toHaveProperty('error', 'Validation error');
         
         // Verify the nickname wasn't changed
         const originalEntry = await NicknameEntry.findOne({ hash: '123456' });
         expect(originalEntry?.nickname).toBe('test-nick1');
      });
   });
});
