const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        const airdrops = await prisma.airdrop.findMany();
        console.log('Successfully connected!');
        console.log(`Found ${airdrops.length} airdrops.`);
    } catch (e) {
        console.error('Database connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
