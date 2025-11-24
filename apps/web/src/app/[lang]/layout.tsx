import "./globals.css";
import type { Metadata } from "next";
import { LightPullThemeSwitcher } from "@/components/LightPullThemeSwitcher";
import StyledComponentsRegistry from "@/lib/registry";
import { Providers } from "../providers/providers";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { I18nProvider } from "@/lib/i18n";
import { localeMessages } from "@/lib/locales";
import HashPassBrandingWrapper from "@/components/HashPassBrandingWrapper";

const jetbrainsMono = {
  variable: "--font-jetbrains-mono",
  className: "font-mono",
};

export const metadata: Metadata = {
  title: "$LUKAS - LatAm Basket-Stable Meme Coin",
  description: "The first regional Latin American basket-stable meme coin",
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
    title: "$LUKAS - LatAm Basket-Stable Meme Coin",
    description: "The first regional Latin American basket-stable meme coin",
  },
  twitter: {
    card: "summary_large_image",
    title: "$LUKAS - LatAm Basket-Stable Meme Coin",
    description: "The first regional Latin American basket-stable meme coin",
  },
};

export default async function RootLayout(props: any) {
  const params = props?.params;
  const children = props?.children;
  const resolvedParams = params instanceof Promise ? await params : params;
  const lang = resolvedParams?.lang ?? "en";
  return (
    <html lang={lang}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lukas" />
        <meta name="application-name" content="Lukas" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="theme-color" content="#10b981" />
        <link rel="apple-touch-icon" href="/logos/logo-full-hashpass-white.svg" />
        <link rel="icon" type="image/svg+xml" href="/logos/logo-full-hashpass-white.svg" />
      </head>
      <body className={jetbrainsMono.className}>
        <StyledComponentsRegistry>
          <Providers>
            <I18nProvider locale={lang} messages={localeMessages[lang] ?? localeMessages.en}>
              <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
                <div className="pointer-events-auto w-full flex justify-between items-center px-4 py-2">
                  <div className="flex-1" />
                  <LanguageSwitcher />
                  <div className="flex-1 flex justify-end">
                    <LightPullThemeSwitcher />
                  </div>
                </div>
              </div>
              <HashPassBrandingWrapper />
              {children}
            </I18nProvider>
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
