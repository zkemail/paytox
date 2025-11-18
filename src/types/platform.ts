export type Platform = "x" | "discord" | "github" | "reddit";

export type ProvingMode = "local" | "remote";

export const PLATFORMS = {
  x: {
    id: "x" as const,
    name: "X (Twitter)",
    icon: "/x-logo.svg",
    iconType: "image" as const,
    placeholder: "@username",
    description: "X (Twitter) handle",
    ensSuffix: ".x.zkemail.eth",
    blueprint: "benceharomi/x_handle@v1",
    emailType: "X password reset email",
    provingMode: "local" as const,
    comingSoon: false,
  },
  discord: {
    id: "discord" as const,
    name: "Discord",
    icon: "/discord-logo.svg",
    iconType: "image" as const,
    placeholder: "username#1234",
    description: "Discord username",
    ensSuffix: ".discord.zkemail.eth",
    blueprint: "zkemail/discord@v1",
    emailType: "Discord verification email",
    provingMode: "remote" as const,
    remoteProvingUrl: "https://noir-prover.zk.email/prove",
    handleRegistrar: "0x9f6b4122c714dFCD32c24d7515dDFA7fec97746D" as const,
    comingSoon: false,
  },
  github: {
    id: "github" as const,
    name: "GitHub",
    icon: "/github-logo.svg",
    iconType: "image" as const,
    placeholder: "@username",
    description: "GitHub username",
    ensSuffix: ".github.zkemail.eth",
    blueprint: "benceharomi/github_handle@v1",
    emailType: "GitHub notification email",
    provingMode: "remote" as const,
    remoteProvingUrl: "https://dev-conductor.zk.email/api/prove",
    comingSoon: true,
  },
  reddit: {
    id: "reddit" as const,
    name: "Reddit",
    icon: "/reddit-logo.svg",
    iconType: "image" as const,
    placeholder: "u/username",
    description: "Reddit username",
    ensSuffix: ".reddit.zkemail.eth",
    blueprint: "benceharomi/reddit_handle@v1",
    emailType: "Reddit notification email",
    provingMode: "remote" as const,
    remoteProvingUrl: "https://dev-conductor.zk.email/api/prove",
    comingSoon: true,
  },
} as const;

export type PlatformConfig = (typeof PLATFORMS)[keyof typeof PLATFORMS];
