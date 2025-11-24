import CurrencyPageClient from "./CurrencyPageClient";

export default function Home() {
  return <CurrencyPageClient />;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return ["en", "es", "pt", "cl"].map((lang) => ({ lang }));
}
