import { useState, useEffect, useRef } from "react";
import { PLATFORMS, type Platform } from "../types/platform";

interface GoogleAuthBackendProps {
  onSuccess: (proofId: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  label?: string;
  platform?: Platform;
  handle?: string;
  withdrawAddress?: string;
}

export default function GoogleAuthBackend({
  onSuccess,
  onError,
  disabled = false,
  label = "Sign in with Google",
  platform = "x",
  handle,
  withdrawAddress,
}: GoogleAuthBackendProps) {
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  // Listen for messages from the OAuth callback
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin
      if (event.origin !== window.location.origin) return;

      const { type, proofId, error } = event.data;

      if (type === "GOOGLE_AUTH_SUCCESS" && proofId) {
        setIsLoading(false);
        if (popupRef.current) {
          popupRef.current.close();
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        onSuccess(proofId);
      } else if (type === "GOOGLE_AUTH_ERROR" && error) {
        setIsLoading(false);
        if (popupRef.current) {
          popupRef.current.close();
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        onError?.(error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess, onError]);

  const handleSignIn = () => {
    setIsLoading(true);

    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "https://noir-prover.zk.email";

    // Get platform configuration
    const platformConfig = PLATFORMS[platform];
    const query = getGmailQueryForPlatform(platform);

    // Build the command - if withdrawAddress is provided, use full command format
    const command = withdrawAddress
      ? `Withdraw all eth to ${withdrawAddress}`
      : "withdraw";

    // Build the OAuth initiation URL with parameters
    const params = new URLSearchParams({
      query,
      blueprint: platformConfig.blueprint,
      command,
    });

    // Add handle if provided
    if (handle) {
      params.set("handle", handle);
    }

    const authUrl = `${backendUrl}/gmail/auth?${params.toString()}`;

    // Open popup for OAuth flow
    const popup = window.open(
      authUrl,
      "google-auth",
      "width=500,height=600,left=100,top=100"
    );

    if (!popup) {
      setIsLoading(false);
      onError?.("Failed to open popup. Please allow popups for this site.");
      return;
    }

    popupRef.current = popup;

    // Check if popup was closed manually
    intervalRef.current = window.setInterval(() => {
      if (popup.closed) {
        setIsLoading(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        onError?.("Authentication cancelled");
      }
    }, 1000);
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={disabled || isLoading}
      style={{
        padding: "12px 24px",
        backgroundColor: disabled || isLoading ? "#ccc" : "#4285f4",
        color: "white",
        border: "none",
        borderRadius: "4px",
        fontSize: "16px",
        cursor: disabled || isLoading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontWeight: 500,
      }}
    >
      {isLoading ? (
        <>
          <span>🔄</span>
          <span>Authenticating...</span>
        </>
      ) : (
        <>
          <span>🔐</span>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// Get Gmail search query for each platform
function getGmailQueryForPlatform(platform: Platform = "x"): string {
  const queries: Record<Platform, string> = {
    x: 'from:info@x.com subject:"password reset"',
    discord: 'from:discord.com subject:"Password Reset Request for Discord"',
    github: "from:github.com",
    reddit: "from:reddit.com",
  };
  return queries[platform];
}
