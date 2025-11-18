import type { Platform } from "../types/platform";

// Contract addresses for different networks and platforms
export const CONTRACTS = {
  sepolia: {
    x: {
      entrypoint: "0x593403CF4fC2761360cCB214Fc0999fcd7Df3aC4" as `0x${string}`,
    },
    discord: {
      entrypoint: "0xa8DfAe1030873d680440408aE3afbf9479a8a1bf" as `0x${string}`,
    },
    // Placeholders for future implementation
    github: {
      entrypoint: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    },
    reddit: {
      entrypoint: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    },
  },
} as const;

// Helper function to get contract for a platform
export function getContractForPlatform(platform: Platform) {
  return CONTRACTS.sepolia[platform];
}

// ZeroDev configuration
export const ZERODEV_CONFIG = {
  rpcUrl: import.meta.env.VITE_ZERODEV_RPC_URL,
  chainId: 11155111, // Sepolia
} as const;
