import request from 'supertest';
import { app } from '../../src/server'; // assuming server exports app
import { prisma } from '../../src/config/db';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // any setup
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should reject login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid@test.com',
        password: 'wrongpassword'
      });
    
    expect(res.status).toBe(401);
  });
});
