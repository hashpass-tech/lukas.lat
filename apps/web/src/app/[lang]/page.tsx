import CurrencyPageClient from "./CurrencyPageClient";

export default function Home() {
  return <CurrencyPageClient />;
}

export function generateStaticParams() {
  return ["en", "es", "pt", "cl"].map((lang) => ({ lang }));
}
