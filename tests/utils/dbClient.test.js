const dbClient = require('../../utils/db');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const chai = require('chai');
const { expect } = chai;

let mongoServer;
let client;

before(async function () {
  this.timeout(100000);
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();

  dbClient.client = client;
  dbClient.db = client.db();
});

after(async function () {
  this.timeout(100000);
  if (client) {
    await client.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('dbClient', () => {
  it('should connect to MongoDB', () => {
    expect(dbClient.isAlive()).to.be.true;
  });

  it('should count users', async () => {
    const usersCount = await dbClient.nbUsers();
    expect(usersCount).to.equal(0);
  });

  it('should count files', async () => {
    const filesCount = await dbClient.nbFiles();
    expect(filesCount).to.equal(0);
  });
});
