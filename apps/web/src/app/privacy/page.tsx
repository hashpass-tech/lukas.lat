export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        This Privacy Policy page is a placeholder. Replace this text with your official privacy policy.
      </p>

      <section className="mt-10 space-y-4 text-sm leading-6 text-foreground">
        <h2 className="text-lg font-medium">1. Information We Collect</h2>
        <p>
          Describe what information is collected (e.g., analytics, device info) and what is not collected.
        </p>

        <h2 className="text-lg font-medium">2. Wallet Addresses</h2>
        <p>
          Wallet addresses may be displayed in the app and are public on-chain. Clarify your handling of addresses.
        </p>

        <h2 className="text-lg font-medium">3. Contact</h2>
        <p>
          Add contact details, DPO info, and required disclosures here.
        </p>
      </section>
    </main>
  );
}
