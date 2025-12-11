import type { Metadata } from "next";
import StyledComponentsRegistry from "@/lib/registry";
import { Providers } from "../providers/providers";
import { TranslationProvider } from "@/components/TranslationProvider";
import HashPassBrandingWrapper from "@/components/HashPassBrandingWrapper";
import { HeaderClient } from "@/components/HeaderClient";
import { HtmlLayout } from "@/components/HtmlLayout";
import { createMetadata } from "@/lib/metadata";

const jetbrainsMono = {
  variable: "--font-jetbrains-mono",
  className: "font-mono",
};

export const metadata: Metadata = createMetadata();

export default async function RootLayout(props: any) {
  const params = props?.params;
  const children = props?.children;
  const resolvedParams = params instanceof Promise ? await params : params;
  const lang = resolvedParams?.lang ?? "en";

  return (
    <HtmlLayout
      lang={lang}
      className={jetbrainsMono.className}
      bodyClassName="min-h-screen"
    >
      <StyledComponentsRegistry>
        <Providers>
          <TranslationProvider initialLocale={lang as any}>
            <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
              <HeaderClient />
            </div>
            <HashPassBrandingWrapper />
            {children}
          </TranslationProvider>
        </Providers>
      </StyledComponentsRegistry>
    </HtmlLayout>
  );
}
