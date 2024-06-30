import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../server';
import dbClient from '../../utils/db';
import redisClient from '../../utils/redis';

const { expect } = chai;
chai.use(chaiHttp);

describe('AppController', () => {
  it('GET /status should return Redis and DB status', async () => {
    const res = await chai.request(app).get('/status');
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('redis').that.equals(redisClient.isAlive());
    expect(res.body).to.have.property('db').that.equals(dbClient.isAlive());
  });

  it('GET /stats should return the number of users and files', async () => {
    const res = await chai.request(app).get('/stats');
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('users').that.is.a('number');
    expect(res.body).to.have.property('files').that.is.a('number');
  });
});
