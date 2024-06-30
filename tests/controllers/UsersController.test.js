import chai from 'chai';
import chaiHttp from 'chai-http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import app from '../../server';
import dbClient from '../../utils/db';

const { expect } = chai;
chai.use(chaiHttp);

let mongoServer;
let client;
let token;

before(async function setup() {
  this.timeout(10000); // Increase timeout to 10 seconds

  // Set up MongoDB in-memory server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();

  // Ensure client and db are set
  dbClient.client = client;
  dbClient.db = client.db();

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

  if (client) {
    await client.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('UsersController', () => {
  it('POST /users should create a new user', async () => {
    const res = await chai
      .request(app)
      .post('/users')
      .send({ email: 'newuser@example.com', password: 'newpassword123' });
    expect(res).to.have.status(201);
    expect(res.body).to.have.property('email').that.equals('newuser@example.com');
  });

  it('GET /users/me should retrieve the user based on the token', async () => {
    const res = await chai
      .request(app)
      .get('/users/me')
      .set('X-Token', token);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('email').that.equals('user@example.com');
  });
});
