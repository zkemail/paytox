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
  label,
  platform = "x",
  handle,
  withdrawAddress,
}: GoogleAuthBackendProps) {
  const platformConfig = PLATFORMS[platform];
  
  // If disabled and no withdrawAddress, show "Choose withdraw address" message
  const buttonLabel = label || 
    (!withdrawAddress && disabled 
      ? "Choose withdraw address" 
      : `Sign in with Google to access your ${platformConfig.emailType}`);

  const handleSignIn = () => {

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

    // Redirect to OAuth URL in the same page
    window.location.href = authUrl;
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={disabled}
      style={{
        width: "100%",
        backgroundColor: "#ffffff",
        color: "#3c4043",
        border: "1px solid #dadce0",
        borderRadius: "4px",
        fontSize: "14px",
        fontWeight: 500,
        fontFamily: "'Google Sans', 'Roboto', arial, sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "12px",
        minHeight: "40px",
        boxShadow: "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
        transition: "background-color 0.218s, border-color 0.218s, box-shadow 0.218s",
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "#f8f9fa";
          e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "#ffffff";
          e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)";
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "#f1f3f4";
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "#f8f9fa";
        }
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <g fill="none" fillRule="evenodd">
          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </g>
      </svg>
      <span>{buttonLabel}</span>
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
