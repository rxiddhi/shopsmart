require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test connection by querying the database
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test that we can query (even if tables are empty)
    const userCount = await prisma.user.count();
    console.log(`✅ Database query successful. Users: ${userCount}`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
