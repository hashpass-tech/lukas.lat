import "./globals.css";
import StyledComponentsRegistry from "@/lib/registry";
import { Providers } from "./providers/providers";

export const metadata = {
  title: "$LUKAS - LatAm Basket-Stable Meme Coin",
  description: "The first regional stable-basket meme coin designed to unify Latin American currency volatility into a single, gravity-centered asset.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-mono antialiased">
        <StyledComponentsRegistry>
          <Providers>{children}</Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
