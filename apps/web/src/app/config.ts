import { AlchemyAccountsUIConfig, createConfig } from "@account-kit/react";
import { sepolia, alchemy } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";

const uiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: "outline",
  auth: {
    sections: [
      [{ type: "email" }],
      [
        { type: "passkey" },
        { type: "social", authProviderId: "google", mode: "popup" },
        { type: "social", authProviderId: "facebook", mode: "popup" },
        { type: "social", authProviderId: "twitch", mode: "popup" },
        {
          type: "social",
          authProviderId: "auth0",
          mode: "popup",
          auth0Connection: "discord",
          displayName: "Discord",
          logoUrl: "/images/discord.svg",
          scope: "openid profile",
        },
        {
          type: "social",
          authProviderId: "auth0",
          mode: "popup",
          auth0Connection: "twitter",
          displayName: "Twitter",
          logoUrl: "/images/twitter.svg",
          logoUrlDark: "/images/twitter-dark.svg",
          scope: "openid profile",
        },
      ],
      [
        {
          type: "external_wallets",
          walletConnect: { projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "" },
          wallets: ["wallet_connect", "coinbase wallet"],
          chainType: ["evm"],
          moreButtonText: "More wallets",
          hideMoreButton: false,
          numFeaturedWallets: 1,
        },
      ],
    ],
    addPasskeyOnSignup: false,
  },
};

export const alchemyConfig = createConfig(
  {
    // Use your Alchemy API key for the transport
    // Get this from https://dashboard.alchemy.com/apps
    transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "" }),
    chain: sepolia,
    ssr: true, // set to false if you're not using server-side rendering
    enablePopupOauth: true,
  },
  uiConfig,
);

export const queryClient = new QueryClient();
