import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jetbrains-mono"
});
import OrbitingSkills from "@/components/OrbitingSkills";
import { LightPullThemeSwitcher } from "@/components/LightPullThemeSwitcher";
import StyledComponentsRegistry from "@/lib/registry";
import { Providers } from "./providers";
import HashPassBranding from "@/components/HashPassBranding";

export const metadata: Metadata = {
  title: "$LUKAS - LatAm Basket-Stable Meme Coin",
  description: "The first regional Latin American basket-stable meme coin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={jetbrainsMono.className}>
        <StyledComponentsRegistry>
          <Providers>
            <OrbitingSkills />
            <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
              <div className="pointer-events-auto w-full flex justify-center">
                <LightPullThemeSwitcher />
              </div>
            </div>
            <HashPassBranding />
            {children}
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
