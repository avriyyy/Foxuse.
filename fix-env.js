const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const postgresUrlMatch = envContent.match(/POSTGRES_URL="?([^"\n]+)"?/);

if (postgresUrlMatch) {
    const postgresUrl = postgresUrlMatch[1];
    if (!envContent.includes('DATABASE_URL=')) {
        fs.appendFileSync(envPath, `\nDATABASE_URL="${postgresUrl}"\n`);
        console.log('Added DATABASE_URL to .env');
    } else {
        console.log('DATABASE_URL already exists in .env');
    }
} else {
    console.log('POSTGRES_URL not found in .env');
}
