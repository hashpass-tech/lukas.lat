"use client";

import { useState, useEffect } from "react";
import versionInfo from "../../public/version.json";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  GitBranch, 
  ChevronRight,
  Package,
  History,
  ExternalLink,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
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
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [changelogData, setChangelogData] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handlePreviousPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

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

                <DialogContent className="max-w-2xl max-h-[85vh] sm:max-h-[80vh] bg-background border-border rounded-3xl flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-foreground flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Changelog
                    </DialogTitle>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">
                        Current version: v{version}
                      </Badge>
                      <a
                        href="https://github.com/hashpass-tech/lukas.lat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        <span>View on GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <GitBranch className="w-3 h-3" />
                        <span>main</span>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="flex-1 max-h-[50vh] sm:max-h-[60vh] pr-4 overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="text-muted-foreground">Loading changelog...</div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentItems.length === 0 ? (
                          <div className="flex items-center justify-center h-40">
                            <div className="text-muted-foreground">No changelog entries available</div>
                          </div>
                        ) : (
                          currentItems.map((entry) => (
                            <div
                              key={entry.version}
                              className="bg-card/50 rounded-xl p-4 border border-border/50 hover:border-border transition-colors"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant="outline"
                                    className="text-primary border-primary/30 text-xs"
                                  >
                                    v{entry.version}
                                  </Badge>
                                  <div className="flex items-center text-muted-foreground text-xs">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {entry.date}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {entry.changes.added && entry.changes.added.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                                      Added
                                    </h4>
                                    <ul className="space-y-1">
                                      {entry.changes.added.map((change, idx) => (
                                        <li
                                          key={idx}
                                          className="text-sm text-foreground flex items-start"
                                        >
                                          <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                                          {change}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {entry.changes.changed && entry.changes.changed.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                                      Changed
                                    </h4>
                                    <ul className="space-y-1">
                                      {entry.changes.changed.map((change, idx) => (
                                        <li
                                          key={idx}
                                          className="text-sm text-foreground flex items-start"
                                        >
                                          <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
                                          {change}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {entry.changes.fixed && entry.changes.fixed.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                                      Fixed
                                    </h4>
                                    <ul className="space-y-1">
                                      {entry.changes.fixed.map((change, idx) => (
                                        <li
                                          key={idx}
                                          className="text-sm text-foreground flex items-start"
                                        >
                                          <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                                          {change}
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
                
                {/* Pagination in DialogFooter */}
                {totalPages > 1 && (
                  <DialogFooter className="border-t border-border bg-background/95 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-2 w-full p-4">
                      <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, index) => (
                          <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                              currentPage === index
                                ? 'bg-primary scale-125'
                                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 hover:scale-110'
                            }`}
                            aria-label={`Go to page ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </DialogFooter>
                )}
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 sm:gap-4" />
          </div>
        </div>
      </footer>
    </>
  );
}
