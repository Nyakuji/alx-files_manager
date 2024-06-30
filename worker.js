const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs').promises;
const { ObjectId } = require('mongodb');
const dbClient = require('./utils/db');

// Create the fileQueue
const fileQueue = new Queue('fileQueue');

// Create the userQueue
const userQueue = new Queue('userQueue');

// Process the fileQueue for thumbnail generation
fileQueue.process('thumbnailGeneration', async (job, done) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });
  if (!file) {
    throw new Error('File not found');
  }

  const sizes = [500, 250, 100];
  await Promise.all(sizes.map(async (size) => {
    const thumbnail = await imageThumbnail(file.localPath, { width: size });
    const thumbnailPath = `${file.localPath}_${size}`;
    await fs.writeFile(thumbnailPath, thumbnail);
  }));

  done();
});

fileQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

fileQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

// Process the userQueue for sending welcome emails
userQueue.process(async (job, done) => {
  const { userId } = job.data;

  if (!userId) {
    done(new Error('Missing userId'));
    return;
  }

  const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });

  if (!user) {
    done(new Error('User not found'));
    return;
  }

  console.log(`Welcome ${user.email}!`);

  done();
});

userQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

userQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

module.exports = { fileQueue, userQueue };
