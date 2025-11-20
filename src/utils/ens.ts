import { type Address, createPublicClient, getAddress, http } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { normalize } from "viem/ens";
import { ZERODEV_CONFIG } from "../config/contracts";
import { type Platform, PLATFORMS } from "../types/platform";

const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(ZERODEV_CONFIG.rpcUrl),
});

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export function handleToEnsName(
  handleRaw: string,
  platform: Platform = "x"
): string {
  const platformConfig = PLATFORMS[platform];
  let handle = (handleRaw || "").trim();

  // Platform-specific handle normalization
  if (platform === "x") {
    handle = handle.replace(/^@/, "").replace(/_/g, "-");
  } else if (platform === "discord") {
    // Discord usernames can have various formats
    // Remove @ if present, normalize underscores and special chars
    handle = handle.replace(/^@/, "").replace(/_/g, "-").replace(/#/g, "-");
  }

  return handle ? `${handle}${platformConfig.ensSuffix}` : "";
}

export async function resolveEnsToPredictedAddress(
  name: string
): Promise<Address | null> {
  try {
    if (!name) return null;
    const normalizedName = normalize(name);

    // Try mainnet first
    const mainnetAddr = await mainnetClient.getEnsAddress({
      name: normalizedName,
    });

    if (mainnetAddr) {
      return getAddress(mainnetAddr);
    }

    // Fall back to Sepolia if not found on mainnet
    const sepoliaAddr = await sepoliaClient.getEnsAddress({
      name: normalizedName,
    });

    if (sepoliaAddr) {
      return getAddress(sepoliaAddr);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Resolves an ENS name or returns the address if it's already a valid address.
 * Tries mainnet first, then falls back to Sepolia.
 */
export async function resolveEnsOrAddress(
  input: string
): Promise<Address | null> {
  try {
    if (!input) return null;
    const trimmed = input.trim();

    // If it's already a valid Ethereum address, return it
    if (trimmed.match(/^0x[a-fA-F0-9]{40}$/)) {
      return getAddress(trimmed);
    }

    // Otherwise, try to resolve as ENS name
    const normalizedName = normalize(trimmed);

    // Try mainnet first
    const mainnetAddr = await mainnetClient.getEnsAddress({
      name: normalizedName,
    });

    if (mainnetAddr) {
      return getAddress(mainnetAddr);
    }

    // Fall back to Sepolia if not found on mainnet
    const sepoliaAddr = await sepoliaClient.getEnsAddress({
      name: normalizedName,
    });

    if (sepoliaAddr) {
      return getAddress(sepoliaAddr);
    }

    return null;
  } catch {
    return null;
  }
}

export async function getSepoliaBalance(address: Address) {
  return sepoliaClient.getBalance({ address });
}

export function truncateMiddle(value: string, prefix = 6, suffix = 4) {
  if (!value) return "";
  if (value.length <= prefix + suffix + 3) return value;
  return `${value.slice(0, prefix)}...${value.slice(-suffix)}`;
}

/**
 * Validates a handle for a given platform
 */
export function validateHandle(
  handle: string,
  platform: Platform
): {
  valid: boolean;
  error?: string;
} {
  const trimmed = handle.trim();

  if (!trimmed) {
    return { valid: false, error: "Handle cannot be empty" };
  }

  switch (platform) {
    case "x": {
      // Twitter handles: 1-15 chars, alphanumeric + underscore
      const xHandle = trimmed.replace(/^@/, "");
      if (!/^[a-zA-Z0-9_]{1,15}$/.test(xHandle)) {
        return {
          valid: false,
          error:
            "X handles must be 1-15 characters (letters, numbers, underscore)",
        };
      }
      return { valid: true };
    }

    case "discord": {
      // Discord usernames: 2-32 chars, lowercase alphanumeric + underscore + period
      const discordHandle = trimmed.replace(/^@/, "").toLowerCase();
      if (!/^[a-z0-9_.]{2,32}$/.test(discordHandle)) {
        return {
          valid: false,
          error:
            "Discord usernames must be 2-32 characters (lowercase, numbers, underscore, period)",
        };
      }
      return { valid: true };
    }

    case "github": {
      // GitHub usernames: 1-39 chars, alphanumeric + hyphen, can't start/end with hyphen
      const ghHandle = trimmed.replace(/^@/, "");
      if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(ghHandle)) {
        return {
          valid: false,
          error: "Invalid GitHub username format",
        };
      }
      return { valid: true };
    }

    case "reddit":
      // Reddit usernames: u/username format, 3-20 chars
      if (!/^u\/[A-Za-z0-9_-]{3,20}$/.test(trimmed)) {
        return {
          valid: false,
          error:
            "Reddit usernames must be in format: u/username (3-20 characters)",
        };
      }
      return { valid: true };

    default:
      return { valid: false, error: "Unknown platform" };
  }
}
