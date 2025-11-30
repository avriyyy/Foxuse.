import { AirdropApp } from "@/types";

export const AIRDROPS: AirdropApp[] = [
    {
        id: "zksync",
        name: "zkSync Era",
        description: "Layer 2 scaling solution for Ethereum. High potential airdrop.",
        category: "L2",
        url: "https://zksync.io/",
        difficulty: "Medium",
        potential: "High",
        tasks: [
            {
                id: "t1",
                title: "Bridge funds to zkSync Era",
                url: "https://bridge.zksync.io/",
                completed: false
            },
            {
                id: "t2",
                title: "Swap on SyncSwap",
                url: "https://syncswap.xyz/",
                completed: false
            },
            {
                id: "t3",
                title: "Hold funds for at least 7 days",
                description: "Keep your assets on zkSync for minimum 7 days",
                // No URL - just a checklist item
                completed: false
            },
            {
                id: "t4",
                title: "Mint an NFT",
                url: "https://mintsquare.io/zksync",
                completed: false
            },
        ]
    },
    {
        id: "layerzero",
        name: "LayerZero",
        description: "Omnichain interoperability protocol.",
        category: "Infrastructure",
        url: "https://layerzero.network/",
        difficulty: "Hard",
        potential: "High",
        tasks: [
            {
                id: "t1",
                title: "Use Stargate Bridge",
                url: "https://stargate.finance/",
                completed: false
            },
            {
                id: "t2",
                title: "Bridge at least 3 times",
                description: "Complete minimum 3 cross-chain transactions",
                // No URL - tracking item
                completed: false
            },
            {
                id: "t3",
                title: "Vote on DAO proposals",
                url: "https://snapshot.org/#/stgdao.eth",
                completed: false
            },
            {
                id: "t4",
                title: "Hold STG tokens",
                url: "https://app.uniswap.org/",
                completed: false
            },
        ]
    },
    {
        id: "starknet",
        name: "Starknet",
        description: "Validity Rollup Layer 2. The future of scaling.",
        category: "L2",
        url: "https://www.starknet.io/en",
        difficulty: "Hard",
        potential: "High",
        tasks: [
            {
                id: "t1",
                title: "Setup Argent X Wallet",
                url: "https://www.argent.xyz/argent-x/",
                completed: false
            },
            {
                id: "t2",
                title: "Bridge from Ethereum Mainnet",
                url: "https://starkgate.starknet.io/",
                completed: false
            },
            {
                id: "t3",
                title: "Make at least 5 transactions",
                description: "Interact with various dApps on Starknet",
                // No URL - tracking milestone
                completed: false
            },
            {
                id: "t4",
                title: "Interact with JediSwap",
                url: "https://app.jediswap.xyz/",
                completed: false
            },
        ]
    },
    {
        id: "scroll",
        name: "Scroll",
        description: "Native zkEVM Layer 2 for Ethereum.",
        category: "L2",
        url: "https://scroll.io/",
        difficulty: "Medium",
        potential: "Medium",
        tasks: [
            {
                id: "t1",
                title: "Bridge to Scroll",
                url: "https://scroll.io/bridge",
                completed: false
            },
            {
                id: "t2",
                title: "Interact with at least 3 protocols",
                description: "Use different dApps on Scroll network",
                // No URL - general task
                completed: false
            },
            {
                id: "t3",
                title: "Deploy a contract",
                url: "https://scrollscan.com/",
                completed: false
            },
        ]
    },
    {
        id: "base",
        name: "Base",
        description: "Secure, low-cost, builder-friendly Ethereum L2 built to bring the next billion users onchain.",
        category: "L2",
        url: "https://base.org",
        difficulty: "Easy",
        potential: "Medium",
        tasks: [
            {
                id: "t1",
                title: "Bridge ETH to Base",
                url: "https://bridge.base.org/",
                completed: false
            },
            {
                id: "t2",
                title: "Mint 'Base, Introduced' NFT",
                url: "https://base.org/names",
                completed: false
            },
            {
                id: "t3",
                title: "Complete at least 10 transactions",
                description: "Be active on Base network",
                // No URL - activity tracking
                completed: false
            },
        ]
    }
];
