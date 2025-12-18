import { TranslationProvider } from "@/components/TranslationProvider";
import HashPassBrandingWrapper from "@/components/HashPassBrandingWrapper";
import { HeaderClient } from "@/components/HeaderClient";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Footer from "@/components/Footer";

const jetbrainsMono = {
  variable: "--font-jetbrains-mono",
  className: "font-mono",
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TranslationProvider>
      <SidebarProvider>
        <div className={`min-h-screen ${jetbrainsMono.className}`}>
          <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
            <HeaderClient />
          </div>
          <HashPassBrandingWrapper />
          {children}
          <Footer />
        </div>
      </SidebarProvider>
    </TranslationProvider>
  );
}
