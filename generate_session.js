const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // npm install input

const apiId = 38882589;
const apiHash = "c71d392287aadf2a242105e7bc9fef16";
const stringSession = new StringSession(""); // Start with empty session

(async () => {
    console.log("Loading interactive example...");
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text("Please enter your number: "),
        password: async () => await input.text("Please enter your password: "),
        phoneCode: async () => await input.text("Please enter the code you received: "),
        onError: (err) => console.log(err),
    });

    console.log("You should now be connected.");
    console.log("Save this string to your DB/Admin Panel:");
    console.log(client.session.save()); // This will print the session string
    process.exit(0);
})();
