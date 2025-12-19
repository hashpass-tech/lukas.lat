import PoolPageClient from "./PoolPageClient";

export default function PoolPage() {
  return <PoolPageClient />;
}

export function generateStaticParams() {
  return ["en", "es", "pt", "cl"].map((lang) => ({ lang }));
}
