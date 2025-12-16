"use client";

import { useState } from "react";
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

export default function Footer({ version = versionInfo.version, className = "" }: FooterProps) {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Parse changelog data - in a real app, this would come from the actual changelog file
  const changelogData: ChangelogEntry[] = [
    {
      version: "0.2.3",
      date: "2025-12-16",
      changes: {
        fixed: [
          "Fixed Join Movement card being cut by footer on mobile by adding responsive bottom padding",
          "Added proper bottom spacing to prevent footer overlap with content"
        ]
      }
    },
    {
      version: "0.2.2",
      date: "2025-12-16",
      changes: {
        added: [
          "Added footer to mobile sidebar with proper positioning",
          "Created global sidebar context for state management",
          "Implemented proper theme-aware styling for sidebar footer"
        ],
        fixed: [
          "Fixed scroll button visibility when sidebar is open on mobile",
          "Resolved z-index layering and overlapping issues",
          "Fixed footer light mode behavior in sidebar",
          "Updated changelog modal border radius to match UI consistency",
          "Completely hidden CTA button when sidebar is open on mobile"
        ]
      }
    },
    {
      version: "0.2.1",
      date: "2025-12-16",
      changes: {
        added: [
          "Animated percentage display for currency cards and main donut chart",
          "Filling animation effect for LUKAS card",
          "Smooth counting animation with adjustable duration"
        ],
        fixed: [
          "Fixed white corner artifacts on currency cards",
          "Fixed light mode text colors for better readability",
          "LUKAS modal mobile responsiveness and scrolling behavior"
        ]
      }
    },
    {
      version: "0.2.0",
      date: "2025-12-15",
      changes: {
        added: [
          "Major mobile sidebar improvements",
          "Enhanced wallet integration features",
          "Improved responsive design across components"
        ]
      }
    },
    {
      version: "0.1.45",
      date: "2025-12-11",
      changes: {
        fixed: [
          "Aligned Join Movement and Swap cards to share the same minimum height for a stable layout",
          "Updated footer version badge to read from generated version.json so it always matches the current release"
        ]
      }
    },
    {
      version: "0.1.44", 
      date: "2025-12-11",
      changes: {
        added: [],
        changed: [],
        fixed: []
      }
    },
    {
      version: "0.1.43",
      date: "2025-12-11", 
      changes: {
        added: [
          "WalletConnect v3 integration using project ID env config and Ethereum provider",
          "Advanced swap card and Join Movement swap flow improvements when wallet is connected"
        ],
        changed: [
          "Refined wallet header and mobile wallet button UX for clearer connect/disconnect states"
        ],
        fixed: [
          "Wallet connect modal not appearing due to missing WalletConnect provider setup"
        ]
      }
    },
    {
      version: "0.1.42",
      date: "2025-12-10",
      changes: {
        added: [
          "Enhanced donut chart animations",
          "Improved currency card interactions"
        ]
      }
    },
    {
      version: "0.1.41",
      date: "2025-12-09",
      changes: {
        fixed: [
          "Resolved mobile layout issues",
          "Fixed navigation responsiveness"
        ]
      }
    }
  ];

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
                    <div className="space-y-4">
                      {currentItems.map((entry) => (
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
                      ))}
                    </div>
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
