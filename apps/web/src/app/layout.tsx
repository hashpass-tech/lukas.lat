import "./globals.css";
import StyledComponentsRegistry from "@/lib/registry";
import { Providers } from "./providers/providers";
import { HtmlLayout } from "@/components/HtmlLayout";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HtmlLayout>
      <StyledComponentsRegistry>
        <Providers>{children}</Providers>
      </StyledComponentsRegistry>
    </HtmlLayout>
  );
}
