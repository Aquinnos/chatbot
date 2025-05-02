import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user';
import Chat from '../models/chat';
import OfflineResponse from '../models/offlineResponse';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    const MONGO_URI =
      process.env.MONGO_URI || 'mongodb://localhost:27017/chatbot';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Chat.deleteMany({});
    await OfflineResponse.deleteMany({});
    console.log('Cleared existing data');

    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      apiKey: 'test-api-key-12345',
    });

    await testUser.save();
    console.log(
      `Created test user: ${testUser.username} (ID: ${testUser._id})`
    );

    const chatData = [
      {
        title: 'Basic Questions',
        messages: [
          {
            role: 'user',
            content: 'Hello, how are you?',
            timestamp: new Date(),
          },
          {
            role: 'assistant',
            content:
              "I'm doing well, thank you for asking! How can I help you today?",
            timestamp: new Date(),
          },
          {
            role: 'user',
            content: 'What can you do?',
            timestamp: new Date(),
          },
          {
            role: 'assistant',
            content:
              'I can answer questions, help solve problems, provide information, and much more. Just ask!',
            timestamp: new Date(),
          },
        ],
      },
      {
        title: 'Technical Questions',
        messages: [
          {
            role: 'user',
            content: 'How does Node.js work?',
            timestamp: new Date(),
          },
          {
            role: 'assistant',
            content:
              "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows you to run JavaScript code on the server side. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.",
            timestamp: new Date(),
          },
          {
            role: 'user',
            content: 'What is Express.js?',
            timestamp: new Date(),
          },
          {
            role: 'assistant',
            content:
              'Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It facilitates the creation of web APIs and web applications with built-in methods and middleware.',
            timestamp: new Date(),
          },
        ],
      },
    ];

    const chats = [];

    for (const chatInfo of chatData) {
      const chat = new Chat({
        title: chatInfo.title,
        userId: testUser._id,
        messages: chatInfo.messages,
      });

      await chat.save();
      chats.push(chat);
      console.log(`Created test chat: ${chat.title} (ID: ${chat._id})`);
    }

    testUser.chats = chats.map(
      (chat) => chat._id
    ) as unknown as mongoose.Types.ObjectId[];
    await testUser.save();
    console.log('Updated user with chat references');

    const offlineResponses = [
      {
        query: 'hello, how are you?',
        response:
          "I'm doing well, thank you for asking! How can I help you today?",
        userId: testUser._id,
        chatId: chats[0]._id,
        used: false,
      },
      {
        query: 'what can you do?',
        response:
          'I can answer questions, help solve problems, provide information, and much more. Just ask!',
        userId: testUser._id,
        chatId: chats[0]._id,
        used: false,
      },
      {
        query: 'how does node.js work?',
        response:
          "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows you to run JavaScript code on the server side. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.",
        userId: testUser._id,
        chatId: chats[1]._id,
        used: false,
      },
    ];

    for (const offlineData of offlineResponses) {
      const offlineResponse = new OfflineResponse(offlineData);
      await offlineResponse.save();
      console.log(
        `Created offline response for query: "${offlineResponse.query}"`
      );
    }

    testUser.offlineResponses = (
      await OfflineResponse.find({ userId: testUser._id })
    ).map((r) => r._id) as unknown as mongoose.Types.ObjectId[];
    await testUser.save();
    console.log('Updated user with offline response references');

    console.log('Database successfully seeded with test data!');
    console.log('\nYou can log in using:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB database');
    process.exit(0);
  }
};

seedDatabase();
