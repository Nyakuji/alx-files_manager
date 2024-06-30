import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../server';
import dbClient from '../../utils/db';
import redisClient from '../../utils/redis';

const { expect } = chai;
chai.use(chaiHttp);

let token;

before(async function setup() {
  this.timeout(10000); // Increase timeout to 10 seconds

  // Ensure DB is clean before tests
  if (dbClient.db) {
    await dbClient.db.collection('users').deleteMany({});
  } else {
    console.error('DB is not connected');
  }
  if (redisClient.client) {
    await redisClient.client.flushdb();
  } else {
    console.error('Redis is not connected');
  }

  // Create a user and get the token
  await chai.request(app).post('/users').send({ email: 'user@example.com', password: 'password123' });
  const res = await chai
    .request(app)
    .get('/connect')
    .set('Authorization', `Basic ${Buffer.from('user@example.com:password123').toString('base64')}`);
  token = res.body.token;
});

after(async function teardown() {
  this.timeout(10000); // Increase timeout to 10 seconds

  if (dbClient.db) {
    await dbClient.db.collection('users').deleteMany({});
  } else {
    console.error('DB is not connected');
  }
  if (redisClient.client) {
    await redisClient.client.flushdb();
  } else {
    console.error('Redis is not connected');
  }
});

describe('AuthController', () => {
  it('GET /connect should sign in the user and return a token', async () => {
    const res = await chai
      .request(app)
      .get('/connect')
      .set('Authorization', `Basic ${Buffer.from('user@example.com:password123').toString('base64')}`);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('token');
  });

  it('GET /disconnect should sign out the user', async () => {
    const res = await chai
      .request(app)
      .get('/disconnect')
      .set('X-Token', token);
    expect(res).to.have.status(204);
  });
});
