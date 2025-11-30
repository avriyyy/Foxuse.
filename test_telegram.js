const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = 30386736;
const apiHash = "b858476b707a3d364630f8ade488133f";
const sessionString = "1BQANOTEuMTA4LjU2LjE1OAG7SpzllPCpk3HFcR5YaSg0qhWOY6z5KJVjhFs2MWl0OmRbOQFzKVixcm2i90WaOEZTWQiPOG16UhIEW2sGPmZEwaUfQG244TZ3bPmFbwDeJGIrCfHRoiaxgeaOCUQel2rmPyRTLM+/Ub0b9D93l3DwCvd6j+WixCjSrp0pgi7NNb00sDWQ28SQrPGGkiUILMikHrvz4PCgIAJnVHFCI/aI6md4G60jcK9RlXO7hEgxzgOoF2DC63SoazD0BwgH04iZNUcekAO5mmmhkhNWVeREaa9VyL1b46FhJg3ZZFWVOzmGR/XN8tqUbbLv891FS6qHBOhuorzdeZlmt1gpUJb01A==";

(async () => {
    console.log("Testing Telegram connection...");

    const stringSession = new StringSession(sessionString);
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.connect();
    console.log("✅ Connected successfully!");

    // Get messages from @airdropfind
    const entity = await client.getEntity("@airdropfind");
    console.log("✅ Found group:", entity.title);

    // Get last 5 messages
    const messages = await client.getMessages(entity, { limit: 5 });
    console.log(`\n📬 Last ${messages.length} messages:\n`);

    messages.forEach((msg, idx) => {
        if (msg.message) {
            console.log(`[${idx + 1}] ID: ${msg.id}`);
            console.log(`    Date: ${msg.date}`);
            console.log(`    Text: ${msg.message.substring(0, 100)}...`);
            console.log(`    Reply: ${msg.replyTo ? 'Yes' : 'No'}`);
            console.log('');
        }
    });

    await client.disconnect();
    console.log("✅ Test complete!");
})();
