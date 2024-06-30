import sinon from 'sinon';
import chai from 'chai';
import redisClient from '../../utils/redis';

const { expect } = chai;

describe('redisClient', () => {
  let connectStub;
  let quitStub;

  before(() => {
    connectStub = sinon.stub(redisClient.client, 'on').callsFake((event, callback) => {
      if (event === 'connect') callback();
    });
    quitStub = sinon.stub(redisClient.client, 'quit').returns(true);
  });

  after(() => {
    connectStub.restore();
    quitStub.restore();
  });

  it('should connect to Redis', () => {
    expect(redisClient.isAlive()).to.be.true;
  });

  it('should get and set a key', async () => {
    await redisClient.set('test', 'value', 10);
    const value = await redisClient.get('test');
    expect(value).to.equal('value');
  });

  it('should delete a key', async () => {
    await redisClient.set('test', 'value', 10);
    await redisClient.del('test');
    const value = await redisClient.get('test');
    expect(value).to.be.null;
  });
});
