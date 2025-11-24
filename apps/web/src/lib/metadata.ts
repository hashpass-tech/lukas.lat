import type { Metadata } from "next";

export const createMetadata = (title?: string, description?: string): Metadata => {
  const defaultTitle = "$LUKAS - LatAm Basket-Stable Meme Coin";
  const defaultDescription = "The first regional Latin American basket-stable meme coin designed to unify Latin American currency volatility into a single, gravity-centered asset.";
  
  return {
    title: title || defaultTitle,
    description: description || defaultDescription,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Lukas",
    },
    icons: {
      icon: "/logos/logo-full-hashpass-white.svg",
      apple: "/logos/logo-full-hashpass-white.svg",
    },
    openGraph: {
      title: title || defaultTitle,
      description: description || defaultDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: title || defaultTitle,
      description: description || defaultDescription,
    },
  };
};
