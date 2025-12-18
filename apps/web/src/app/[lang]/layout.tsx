import type { Metadata } from "next";
import { TranslationProvider } from "@/components/TranslationProvider";
import HashPassBrandingWrapper from "@/components/HashPassBrandingWrapper";
import { HeaderClient } from "@/components/HeaderClient";
import { createMetadata } from "@/lib/metadata";
import { SidebarProvider } from "@/contexts/SidebarContext";

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
    <TranslationProvider initialLocale={lang as any}>
      <SidebarProvider>
        <div className={`min-h-screen ${jetbrainsMono.className}`}>
          <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
            <HeaderClient />
          </div>
          <HashPassBrandingWrapper />
          {children}
        </div>
      </SidebarProvider>
    </TranslationProvider>
  );
}
