const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function substitutePlaceholders(content, config) {
  const { entities, contact, jurisdiction } = config;
  let result = content;

  // New explicit placeholders for each entity
  result = result.replace(/\[HASHPASS_LEGAL_NAME\]/g, entities.hashpass.name);
  result = result.replace(/\[HASHPASS_ADDRESS\]/g, entities.hashpass.address);
  result = result.replace(/\[BFL_LEGAL_NAME\]/g, entities.bfl.name);
  result = result.replace(/\[BFL_ADDRESS\]/g, entities.bfl.address);

  // Backwards-compatible generic placeholders (map to HashPass by default)
  result = result.replace(/\[LEGAL NAME\]/g, entities.hashpass.name);
  result = result.replace(/\[ADDRESS\]/g, entities.hashpass.address);

  // Contact emails
  result = result.replace(/\[LEGAL_EMAIL\]/g, contact.legal);
  result = result.replace(/\[PRIVACY_EMAIL\]/g, contact.privacy);
  result = result.replace(/\[FOUNDATION_EMAIL\]/g, contact.foundation);
  result = result.replace(/\[SUPPORT_EMAIL\]/g, contact.support);

  // Jurisdiction/placeholders
  result = result.replace(/\[JURISDICTION\]/g, jurisdiction.law);
  result = result.replace(/\[VENUE\]/g, jurisdiction.venue);

  return result;
}

function syncOne({ kind, locale, srcRoot, webPublicRoot, docsRoot, config }) {
  const src = path.join(srcRoot, kind, `${locale}.md`);

  if (!fs.existsSync(src)) {
    throw new Error(`[sync-legal-content] Missing source file: ${src}`);
  }

  let content = fs.readFileSync(src, "utf-8");
  content = substitutePlaceholders(content, config);

  // Next.js (static export) needs markdown available at runtime.
  const webDest = path.join(webPublicRoot, "legal", locale, `${kind}.md`);
  ensureDir(path.dirname(webDest));
  fs.writeFileSync(webDest, content, "utf-8");

  // Docusaurus: canonical docs are in docs/, translations are in i18n/{locale}/.../current/
  // We keep EN in docs/legal/ and translated versions in i18n/*.
  if (locale === "en") {
    const docsEnDest = path.join(docsRoot, "docs", "legal", `${kind}.md`);
    ensureDir(path.dirname(docsEnDest));
    fs.writeFileSync(docsEnDest, content, "utf-8");
  } else {
    const docsI18nDest = path.join(
      docsRoot,
      "i18n",
      locale,
      "docusaurus-plugin-content-docs",
      "current",
      "legal",
      `${kind}.md`,
    );
    ensureDir(path.dirname(docsI18nDest));
    fs.writeFileSync(docsI18nDest, content, "utf-8");
  }
}

function main() {
  const repoRoot = path.join(__dirname, "..");
  const srcRoot = path.join(repoRoot, "packages", "legal-content");
  const webPublicRoot = path.join(repoRoot, "apps", "web", "public");
  const docsRoot = path.join(repoRoot, "apps", "docs");

  const configPath = path.join(srcRoot, "legal-config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  const kinds = ["terms", "privacy"];
  const locales = ["en", "es", "pt"];

  for (const kind of kinds) {
    for (const locale of locales) {
      syncOne({ kind, locale, srcRoot, webPublicRoot, docsRoot, config });
    }
  }

  // Ensure legal docs appear in docs sidebar by creating folder in docs/.
  // (Files are written above; this is just an explicit directory ensure.)
  ensureDir(path.join(docsRoot, "docs", "legal"));
}

main();
