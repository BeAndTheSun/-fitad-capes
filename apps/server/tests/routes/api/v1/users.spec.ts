import express from 'express';
import request from 'supertest';

import { usersRouter } from '@/routes/api/v1/users';
import { db } from '@/utils/db';

const createdAt = new Date().toISOString();

// Mock the db module
jest.mock('@/utils/db', () => ({
  db: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

// Create an instance
const app = express();
app.use('/users', usersRouter);

describe('GET /users', () => {
  it('should return a list of users', async () => {
    // Mock the db call
    const mockUsers = [
      {
        id: 1,
        email: 'test1@example.com',
        name: 'User One',
        createdAt,
        is2faEnabled: false,
      },
      {
        id: 2,
        email: 'test2@example.com',
        name: 'User Two',
        createdAt,
        is2faEnabled: false,
      },
    ];
    (db.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

    // Make the request
    const response = await request(app).get('/users');

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      results: [
        {
          id: 1,
          email: 'test1@example.com',
          name: 'User One',
          createdAt,
          is2faEnabled: false,
        },
        {
          id: 2,
          email: 'test2@example.com',
          name: 'User Two',
          createdAt,
          is2faEnabled: false,
        },
      ],
    });
  });
});
