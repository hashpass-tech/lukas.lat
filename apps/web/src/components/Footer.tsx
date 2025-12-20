"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import versionInfo from "../../public/version.json";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/translator";
import { 
  FileText, 
  Calendar, 
  GitBranch, 
  Package,
  ExternalLink
} from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    added?: string[];
    changed?: string[];
    fixed?: string[];
  };
}

interface FooterProps {
  version?: string;
  className?: string;
}

// Function to parse CHANGELOG.md file
async function parseChangelog(): Promise<ChangelogEntry[]> {
  try {
    const response = await fetch('/CHANGELOG.md');
    const text = await response.text();
    
    const entries: ChangelogEntry[] = [];
    const lines = text.split('\n');
    let currentEntry: Partial<ChangelogEntry> = {};
    let currentSection: 'added' | 'changed' | 'fixed' | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Match version header: ## [0.2.8] - 2025-12-16
      const versionMatch = line.match(/^## \[([0-9.]+)\] - (\d{4}-\d{2}-\d{2})$/);
      if (versionMatch) {
        // Save previous entry if it exists
        if (currentEntry.version && currentEntry.date) {
          entries.push(currentEntry as ChangelogEntry);
        }
        
        // Start new entry
        currentEntry = {
          version: versionMatch[1],
          date: versionMatch[2],
          changes: {}
        };
        currentSection = null;
        continue;
      }
      
      // Match section headers: ### Added, ### Changed, ### Fixed
      if (line === '### Added') {
        currentSection = 'added';
        if (!currentEntry.changes) currentEntry.changes = {};
        currentEntry.changes.added = [];
        continue;
      }
      
      if (line === '### Changed') {
        currentSection = 'changed';
        if (!currentEntry.changes) currentEntry.changes = {};
        currentEntry.changes.changed = [];
        continue;
      }
      
      if (line === '### Fixed') {
        currentSection = 'fixed';
        if (!currentEntry.changes) currentEntry.changes = {};
        currentEntry.changes.fixed = [];
        continue;
      }
      
      // Skip empty lines and other headers
      if (!line || line.startsWith('#') || line === '### Added' || line === '### Changed' || line === '### Fixed') {
        continue;
      }
      
      // Parse list items (starting with -)
      if (line.startsWith('-') && currentSection && currentEntry.changes) {
        const item = line.substring(1).trim();
        if (item) {
          const sectionArray = currentEntry.changes[currentSection];
          if (sectionArray) {
            sectionArray.push(item);
          }
        }
      }
    }
    
    // Add the last entry
    if (currentEntry.version && currentEntry.date) {
      entries.push(currentEntry as ChangelogEntry);
    }
    
    return entries;
  } catch (error) {
    console.error('Error parsing changelog:', error);
    return [];
  }
}

export default function Footer({ version = versionInfo.version, className = "" }: FooterProps) {
  const [mounted, setMounted] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [changelogData, setChangelogData] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // Ensure component is mounted before rendering Dialog to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const getDocumentationHref = () => {
    if (process.env.NODE_ENV === "development") return "http://localhost:3001";
    return "/documentation";
  };

  // Load changelog data when modal opens
  useEffect(() => {
    if (isChangelogOpen && changelogData.length === 0) {
      setLoading(true);
      parseChangelog().then((data) => {
        // Get only the last 9 versions (excluding unreleased)
        const releasedVersions = data.filter(entry => entry.version !== 'Unreleased');
        const lastNineVersions = releasedVersions.slice(0, 9);
        setChangelogData(lastNineVersions);
        setLoading(false);
      }).catch((error) => {
        console.error('Error loading changelog:', error);
        setLoading(false);
      });
    }
  }, [isChangelogOpen, changelogData.length]);

  // Pagination logic - show 3 items per page (1x3 layout)
  const itemsPerPage = 3;
  const totalPages = Math.ceil(changelogData.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = changelogData.slice(startIndex, endIndex);

  const handleDotClick = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  return (
    <>
      <footer className={`fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50 ${className}`}>
        <div className="w-full max-w-full px-3 sm:px-6 py-2 sm:py-3">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-muted-foreground text-sm">
              <Package className="w-4 h-4" />
              <span className="whitespace-nowrap">Lukas Latam</span>
              {mounted && (
              <Dialog open={isChangelogOpen} onOpenChange={setIsChangelogOpen}>
                <DialogTrigger asChild>
                  <button type="button" className="focus:outline-none">
                    <Badge
                      variant="secondary"
                      className="text-[11px] sm:text-xs cursor-pointer"
                    >
                      v{version}
                    </Badge>
                  </button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[85vh] sm:max-h-[80vh] bg-background border-border rounded-xl sm:rounded-2xl flex flex-col p-0 gap-0 overflow-hidden">
                  <DialogHeader className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-border/50 bg-muted/30 rounded-t-xl sm:rounded-t-2xl">
                    <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Changelog
                    </DialogTitle>
                    <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        Current: v{version}
                      </Badge>
                      <a
                        href="https://github.com/hashpass-tech/lukas.lat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                      >
                        <span className="hidden sm:inline">View on GitHub</span>
                        <span className="sm:hidden">GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <GitBranch className="w-3 h-3" />
                        <span>main</span>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="flex-1 min-h-0 px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="text-muted-foreground">Loading changelog...</div>
                      </div>
                    ) : (
                      <div className="space-y-4 sm:space-y-5">
                        {currentItems.length === 0 ? (
                          <div className="flex items-center justify-center h-40">
                            <div className="text-muted-foreground">No changelog entries available</div>
                          </div>
                        ) : (
                          currentItems.map((entry) => (
                            <div
                              key={entry.version}
                              className="bg-card/60 rounded-xl p-4 sm:p-5 border border-border/60 hover:border-border/80 hover:bg-card/80 transition-all duration-200"
                            >
                              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <Badge
                                    variant="outline"
                                    className="text-primary border-primary/40 bg-primary/5 text-xs sm:text-sm font-medium px-2.5 py-0.5"
                                  >
                                    v{entry.version}
                                  </Badge>
                                  <div className="flex items-center text-muted-foreground text-xs sm:text-sm">
                                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                    <span>{entry.date}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3 sm:space-y-4">
                                {entry.changes.added && entry.changes.added.length > 0 && (
                                  <div className="space-y-1.5">
                                    <h4 className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                      Added
                                    </h4>
                                    <ul className="space-y-1 pl-3">
                                      {entry.changes.added.map((change, idx) => (
                                        <li
                                          key={idx}
                                          className="text-xs sm:text-sm text-foreground/90 flex items-start gap-2"
                                        >
                                          <span className="text-green-500/70 mt-1.5 shrink-0">•</span>
                                          <span className="leading-relaxed">{change}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {entry.changes.changed && entry.changes.changed.length > 0 && (
                                  <div className="space-y-1.5">
                                    <h4 className="text-xs sm:text-sm font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                      Changed
                                    </h4>
                                    <ul className="space-y-1 pl-3">
                                      {entry.changes.changed.map((change, idx) => (
                                        <li
                                          key={idx}
                                          className="text-xs sm:text-sm text-foreground/90 flex items-start gap-2"
                                        >
                                          <span className="text-yellow-500/70 mt-1.5 shrink-0">•</span>
                                          <span className="leading-relaxed">{change}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {entry.changes.fixed && entry.changes.fixed.length > 0 && (
                                  <div className="space-y-1.5">
                                    <h4 className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                      Fixed
                                    </h4>
                                    <ul className="space-y-1 pl-3">
                                      {entry.changes.fixed.map((change, idx) => (
                                        <li
                                          key={idx}
                                          className="text-xs sm:text-sm text-foreground/90 flex items-start gap-2"
                                        >
                                          <span className="text-blue-500/70 mt-1.5 shrink-0">•</span>
                                          <span className="leading-relaxed">{change}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <DialogFooter className="shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-border/50 bg-muted/30 rounded-b-xl sm:rounded-b-2xl">
                    <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
                      {Array.from({ length: totalPages }, (_, index) => (
                        <button
                          key={index}
                          onClick={() => handleDotClick(index)}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                            currentPage === index
                              ? 'bg-primary scale-110'
                              : 'bg-muted-foreground/25 hover:bg-muted-foreground/40'
                          }`}
                          aria-label={`Go to page ${index + 1}`}
                        />
                      ))}
                    </div>
                  </DialogFooter>
                )}
                </DialogContent>
              </Dialog>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 sm:gap-4">
              <a
                href={getDocumentationHref()}
                target={process.env.NODE_ENV === "development" ? "_blank" : undefined}
                rel={process.env.NODE_ENV === "development" ? "noopener noreferrer" : undefined}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("footer.docs", "Docs")}
              </a>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("footer.privacy", "Privacy")}
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("footer.terms", "Terms")}
              </Link>
              <a
                href="https://x.com/Lukas_lat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                X
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
