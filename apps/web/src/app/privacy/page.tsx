"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";
import { translator, Locale, useTranslation } from "@/lib/translator";

function stripFrontmatter(md: string) {
  return md.replace(/^---\s*[\s\S]*?\s*---\s*/m, "");
}

function stripLeadingH1(md: string) {
  return md.replace(/^#\s+.*\n+/, "");
}

const PRIVACY_TITLES: Record<Locale, string> = {
  en: "Privacy Policy",
  es: "Política de Privacidad",
  pt: "Política de Privacidade",
  cl: "Política de Privacidad",
};

export default function PrivacyPage() {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { locale: currentLocale } = useTranslation();

  useEffect(() => {
    const load = async () => {
      try {
        const detected = currentLocale || translator.detectBrowserLocale();
        const locale: Exclude<Locale, "cl"> = detected === "cl" ? "es" : detected;

        const res = await fetch(`/legal/${locale}/privacy.md`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load privacy policy (${res.status})`);
        const raw = await res.text();
        const md = stripLeadingH1(stripFrontmatter(raw));

        setHtml(marked.parse(md) as string);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load privacy policy");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentLocale]);

  const title = PRIVACY_TITLES[currentLocale] || PRIVACY_TITLES.en;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pt-24 pb-28">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-400">{error}</div>
      ) : (
        <article
          className="prose prose-sm dark:prose-invert max-w-none mt-6 select-none pointer-events-none"
          onClickCapture={(e) => {
            const target = e.target as HTMLElement | null;
            if (target?.tagName === "A") {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </main>
  );
}
