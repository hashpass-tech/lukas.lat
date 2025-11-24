import CurrencyPageClient from "./CurrencyPageClient";

export default function Home() {
  return <CurrencyPageClient />;
}

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return ["en", "es", "pt", "cl"].map((lang) => ({ lang }));
}
