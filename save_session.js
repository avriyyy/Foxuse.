const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const sessionString = "1BQANOTEuMTA4LjU2LjE1OAG7c54MYleym6Y/f8YwqY+YusT5atZZUiDfwlW7hYR9lOsR1V082QQFAHyxj/6W5SOpoc1c9nKpglXLrsN/MMb6F9dUiWMe2gJbZ1y3c1hS33II3JA2A1Hr30yppIn9WZeNtQWUHSUzVEfptdx41ZT/TDzcP//88eGT/xr0RhX8NySKk2E3c+8rpOurEZlpzSDXugDfGH4pGUz08UcYCIZkoplJDiH1CpFgil2DJGZDW2EJvuaF9zV1BWGkXqs9IoGR9JzuDPwAMPvCWGHYY4UnWqO1st4ioTT6MpTrWPO3TU43n9I3VEN9HUHhNGCK90dmxfsMV0PxztzYUC/ksWv50A==";

    // Update the first config found, or create one
    const config = await prisma.agentConfig.findFirst();

    if (config) {
        await prisma.agentConfig.update({
            where: { id: config.id },
            data: {
                sessionString: sessionString,
                isActive: true
            }
        });
        console.log("Updated existing config with session string.");
    } else {
        // Create new if doesn't exist (using dummy values for other fields if needed, but assuming they are filled via UI)
        // If UI hasn't been used yet, this might fail on required fields.
        // Let's assume user already saved config via UI as instructed.
        console.log("No config found. Please save config via Admin UI first.");
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
