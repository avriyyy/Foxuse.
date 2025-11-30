"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, Bookmark, Shield, X } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useDisconnect, useAccount } from 'wagmi';

export function Navbar() {
    const pathname = usePathname();
    const { disconnect } = useDisconnect();
    const { isConnected } = useAccount();

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <nav className="border-b-4 border-black bg-white">
            <div className="container mx-auto flex items-center justify-between px-4 py-2">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-8 h-8 text-pink-500">
                        <path d="M15 73 L45 73" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M45 73 L55 27 M55 27 L85 27 M55 44 L85 44" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-2xl font-black italic">FOXuse.</span>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-4">
                    {isConnected && (
                        <>
                            {/* Search - Ghost Variant */}


                            <Link href="/dashboard">
                                <Button
                                    variant={isActive("/dashboard") ? "primary" : "outline"}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <span className="hidden sm:inline">DASHBOARD</span>
                                </Button>
                            </Link>

                            <Link href="/my-airdrops">
                                <Button
                                    variant={isActive("/my-airdrops") ? "primary" : "outline"}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <span className="hidden sm:inline">MY AIRDROPS</span>
                                </Button>
                            </Link>
                        </>
                    )}

                    {/* RainbowKit Custom Connect Button */}
                    <div className="ml-2">
                        <ConnectButton.Custom>
                            {({
                                account,
                                chain,
                                openAccountModal,
                                openChainModal,
                                openConnectModal,
                                authenticationStatus,
                                mounted,
                            }) => {
                                const ready = mounted && authenticationStatus !== 'loading';
                                const connected =
                                    ready &&
                                    account &&
                                    chain &&
                                    (!authenticationStatus ||
                                        authenticationStatus === 'authenticated');

                                return (
                                    <div
                                        {...(!ready && {
                                            'aria-hidden': true,
                                            'style': {
                                                opacity: 0,
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                            },
                                        })}
                                    >
                                        {(() => {
                                            if (!connected) {
                                                return (
                                                    <Button onClick={openConnectModal} variant="primary" size="sm">
                                                        CONNECT WALLET
                                                    </Button>
                                                );
                                            }

                                            if (chain.unsupported) {
                                                return (
                                                    <Button onClick={openChainModal} variant="secondary" size="sm">
                                                        Wrong network
                                                    </Button>
                                                );
                                            }
                                            return (
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={openAccountModal}
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2 text-pink-600 border-pink-600 hover:bg-pink-50"
                                                    >
                                                        <span className="font-mono">{account.displayName}</span>
                                                        <div
                                                            role="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                disconnect();
                                                            }}
                                                            className="ml-1 hover:text-red-500"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </div>
                                                    </Button>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                );
                            }}
                        </ConnectButton.Custom>
                    </div>
                </div>
            </div>
        </nav>
    );
}
