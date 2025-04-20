import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function connectDB() {
  try {
    // Attempting to connect to the database
    await prisma.$connect();
    console.log(`Successfully connected to MySQL (${process.env.NODE_ENV?.toUpperCase()})`);
  } catch (error) {
    // Improved error handling with more context
    console.error(`Failed to connect to MySQL (${process.env.NODE_ENV?.toUpperCase()})`);
    console.error('Error details:', error);

    // Print stack trace for better debugging
    if (error instanceof Error) {
      console.error(error.stack);
    }

    // Exit the process if connection fails
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  console.log('Disconnected from MySQL');
}

// Listen for termination signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default connectDB;
export { prisma };
