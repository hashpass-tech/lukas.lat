export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        This Terms of Service page is a placeholder. Replace this text with your official terms.
      </p>

      <section className="mt-10 space-y-4 text-sm leading-6 text-foreground">
        <h2 className="text-lg font-medium">1. Overview</h2>
        <p>
          These terms govern your use of this website and any related services. By accessing or using the site, you agree
          to be bound by these terms.
        </p>

        <h2 className="text-lg font-medium">2. Wallet & Web3</h2>
        <p>
          You are responsible for your wallet security, private keys, and any transactions you authorize. Blockchain
          transactions may be irreversible.
        </p>

        <h2 className="text-lg font-medium">3. Contact</h2>
        <p>
          Add contact details and required legal disclosures here.
        </p>
      </section>
    </main>
  );
}
