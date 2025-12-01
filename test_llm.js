const fetch = require('node-fetch');

const API_KEY = "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"; // From your code
const MODEL = "meta-llama/llama-3.3-70b-instruct:free";

async function testLLM() {
    const text = "Vectra Market Have a New Tasks Claim Point...";

    console.log("Testing LLM with text:", text);
    console.log("Model:", MODEL);

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": `You are an expert airdrop hunter agent. Analyze Telegram messages.
                        
                        Determine TYPE:
                        1. 'NEW_AIRDROP': New airdrop announcement, waitlist, testnet, or "List Live Airdrops".
                        2. 'NEW_TASK': Update adding tasks, "Claim Point", "Connect Wallet", "New Tasks", or daily updates.
                        3. 'IRRELEVANT': Only for pure spam or unrelated chat.
                        
                        EXAMPLES (FOLLOW THESE PATTERNS):
                        
                        Input: "Vectra Market Have a New Tasks Claim Point..."
                        Output: {"type": "NEW_TASK", "data": {"targetAirdropName": "Vectra Market", "tasks": [{"title": "New Tasks Claim Point", "url": "", "completed": false}]}}
                        
                        Input: "Update Vectra Market Connect New Wallet..."
                        Output: {"type": "NEW_TASK", "data": {"targetAirdropName": "Vectra Market", "tasks": [{"title": "Connect New Wallet", "url": "", "completed": false}]}}
                        
                        Input: "🔥 LIST LIVE AIRDROPS 23 NOV - 30 NOV: 1. THEO 2. ORDERLY..."
                        Output: {"type": "NEW_AIRDROP", "data": {"name": "THEO", "description": "Listed in Live Airdrops summary", "category": "DeFi", "difficulty": "Medium", "potential": "High", "tasks": []}}
                        
                        Input: "gm guys"
                        Output: {"type": "IRRELEVANT"}

                        CRITICAL RULES:
                        - If message says "Update" or "New Tasks" or "Claim", it is NEW_TASK.
                        - Do NOT return IRRELEVANT just because details are missing. Guess the project name from the text.
                        
                        Return JSON ONLY.
                        
                        NEW_AIRDROP format:
                        {
                            "type": "NEW_AIRDROP",
                            "data": {
                                "name": "Project Name",
                                "description": "Description",
                                "category": "DeFi"|"NFT"|"L2"|"GameFi"|"Infrastructure"|"Wallet" (Default: "DeFi"),
                                "difficulty": "Easy"|"Medium"|"Hard" (Default: "Medium"),
                                "potential": "Low"|"Medium"|"High" (Default: "High"),
                                "tasks": [{"id": "uuid", "title": "Task", "url": "URL", "completed": false}]
                            }
                        }
                        
                        NEW_TASK format:
                        {
                            "type": "NEW_TASK",
                            "data": {
                                "targetAirdropName": "Project Name",
                                "tasks": [{"id": "uuid", "title": "Task Description", "url": "URL", "completed": false}]
                            }
                        }
                        
                        IRRELEVANT format:
                        { "type": "IRRELEVANT" }`
                    },
                    {
                        "role": "user",
                        "content": text
                    }
                ]
            })
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Full Response:", JSON.stringify(data, null, 2));

        if (data.choices && data.choices[0]) {
            console.log("Content:", data.choices[0].message.content);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

testLLM();
