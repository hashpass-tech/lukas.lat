import type { Metadata } from "next";

const siteUrl = "https://lukas.lat";
const defaultTitle = "$LUKAS - LatAm Basket-Stable Meme Coin";
const defaultDescription =
  "The first regional Latin American basket-stable meme coin designed to unify Latin American currency volatility into a single, gravity-centered asset.";
const defaultImage = "/android-chrome-512x512.png";

export const createMetadata = (
  title?: string,
  description?: string,
  path: string = "/",
): Metadata => {
  const resolvedTitle = title || defaultTitle;
  const resolvedDescription = description || defaultDescription;

  return {
    metadataBase: new URL(siteUrl),
    title: resolvedTitle,
    description: resolvedDescription,
    manifest: "/manifest.json",
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Lukas",
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: path,
      siteName: "$LUKAS",
      type: "website",
      images: [
        {
          url: defaultImage,
          width: 512,
          height: 512,
          alt: resolvedTitle,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: resolvedTitle,
      description: resolvedDescription,
      images: [defaultImage],
    },
  };
};
