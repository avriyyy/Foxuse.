import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    arbitrum,
    base,
    mainnet,
    optimism,
    polygon,
    avalanche,
} from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'FOXuse - Airdrop Hunter',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '21fb38e191c0f9209e4f37c8baf37625',
    chains: [
        mainnet,
        arbitrum,
        avalanche,
        base,
        optimism,
        polygon,
    ],
    ssr: true,
});
