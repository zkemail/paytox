import { type Platform, PLATFORMS } from "../types/platform";

interface PlatformSelectorProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  disabled?: boolean;
}

export default function PlatformSelector({
  selectedPlatform,
  onPlatformChange,
  disabled = false,
}: PlatformSelectorProps) {
  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <label
        style={{
          fontWeight: 500,
          fontSize: "15px",
          display: "block",
          marginBottom: "10px",
        }}
      >
        Select Platform
      </label>
      <div
        className="horizontal-scroll"
        style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          overflowY: "hidden",
          paddingBottom: "8px",
          WebkitOverflowScrolling: "touch",
          width: "100%",
        }}
      >
        {(Object.keys(PLATFORMS) as Platform[]).map((platformKey) => {
          const platform = PLATFORMS[platformKey];
          const isSelected = selectedPlatform === platform.id;
          const isComingSoon = platform.comingSoon;

          return (
            <button
              key={platform.id}
              onClick={() =>
                !disabled && !isComingSoon && onPlatformChange(platform.id)
              }
              disabled={disabled || isComingSoon}
              style={{
                padding: "16px",
                borderRadius: "12px",
                border: isSelected
                  ? "2px solid rgb(96, 165, 250)"
                  : "2px solid var(--border)",
                background: isSelected
                  ? "rgba(96, 165, 250, 0.1)"
                  : "var(--card)",
                cursor: disabled || isComingSoon ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                textAlign: "left",
                opacity: isComingSoon ? 0.6 : 1,
                position: "relative",
                minWidth: "180px",
                flexShrink: 0,
                flex: "0 0 auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: isSelected
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "rgba(148, 163, 184, 0.1)",
                  }}
                >
                  {platform.iconType === "image" ? (
                    <img
                      src={platform.icon}
                      alt={platform.name}
                      style={{
                        width: "20px",
                        height: "20px",
                        filter: isSelected ? "brightness(0) invert(1)" : "none",
                      }}
                    />
                  ) : (
                    platform.icon
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "15px",
                      color: isSelected ? "rgb(96, 165, 250)" : "var(--text)",
                    }}
                  >
                    {platform.name}
                  </div>
                </div>
              </div>
              {isComingSoon && (
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: "10px",
                    padding: "4px 8px",
                    background: "rgba(234, 179, 8, 0.15)",
                    borderRadius: "6px",
                    color: "#a16207",
                    fontWeight: 500,
                  }}
                >
                  Coming Soon
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
