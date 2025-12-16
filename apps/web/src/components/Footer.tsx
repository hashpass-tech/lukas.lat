"use client";

import { useState } from "react";
import versionInfo from "../../public/version.json";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  GitBranch, 
  ChevronRight,
  Package,
  History,
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

export default function Footer({ version = versionInfo.version, className = "" }: FooterProps) {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  // Parse changelog data - in a real app, this would come from the actual changelog file
  const changelogData: ChangelogEntry[] = [
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
        // Placeholder: no specific entries recorded in summary
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
    }
  ];

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

                <DialogContent className="max-w-2xl max-h-[80vh] bg-background border-border rounded-3xl">
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

                  <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-6">
                      {changelogData.map((entry) => (
                        <div
                          key={entry.version}
                          className="border-b border-border pb-4 last:border-0"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className="text-primary border-primary/30"
                              >
                                v{entry.version}
                              </Badge>
                              <div className="flex items-center text-muted-foreground text-sm">
                                <Calendar className="w-3 h-3 mr-1" />
                                {entry.date}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
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
                  </ScrollArea>
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
