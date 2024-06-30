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
let fileId;

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

  // Log to ensure correct assignment
  console.log('DB Client:', dbClient.client);
  console.log('DB Instance:', dbClient.db);

  // Create a user and get the token
  await chai.request(app).post('/users').send({ email: 'user@example.com', password: 'password123' });
  const res = await chai
    .request(app)
    .get('/connect')
    .set('Authorization', `Basic ${Buffer.from('user@example.com:password123').toString('base64')}`);
  token = res.body.token;
});

after(async function cleanup() {
  this.timeout(10000); // Increase timeout to 10 seconds

  if (client) {
    await client.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('FilesController', () => {
  it('POST /files', async () => {
    const res = await chai
      .request(app)
      .post('/files')
      .set('X-Token', token)
      .send({ name: 'example.txt', type: 'file', data: Buffer.from('Hello world').toString('base64') });
    expect(res).to.have.status(201);
    fileId = res.body.id;
  });

  it('GET /files/:id', async () => {
    const res = await chai
      .request(app)
      .get(`/files/${fileId}`)
      .set('X-Token', token);
    expect(res).to.have.status(200);
  });

  it('GET /files', async () => {
    const res = await chai
      .request(app)
      .get('/files')
      .set('X-Token', token)
      .query({ parentId: '0', page: 0 });
    expect(res).to.have.status(200);
  });

  it('PUT /files/:id/publish', async () => {
    const res = await chai
      .request(app)
      .put(`/files/${fileId}/publish`)
      .set('X-Token', token);
    expect(res).to.have.status(200);
    expect(res.body.isPublic).to.be.true;
  });

  it('PUT /files/:id/unpublish', async () => {
    const res = await chai
      .request(app)
      .put(`/files/${fileId}/unpublish`)
      .set('X-Token', token);
    expect(res).to.have.status(200);
    expect(res.body.isPublic).to.be.false;
  });

  it('GET /files/:id/data', async () => {
    const res = await chai
      .request(app)
      .get(`/files/${fileId}/data`)
      .set('X-Token', token);
    expect(res).to.have.status(200);
    expect(res.text).to.equal('Hello world');
  });
});
