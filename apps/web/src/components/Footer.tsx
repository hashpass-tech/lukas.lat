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
}

export default function Footer({ version = versionInfo.version }: FooterProps) {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  // Parse changelog data - in a real app, this would come from the actual changelog file
  const changelogData: ChangelogEntry[] = [
    {
      version: "0.1.32",
      date: "2025-12-10",
      changes: {
        fixed: [
          "Restricted orbiting currency cursor animation to first section only",
          "Hidden orbiting animation completely when scrolling to second section"
        ]
      }
    },
    {
      version: "0.1.30", 
      date: "2025-11-24",
      changes: {
        added: [
          "Auto-commit and auto-push functionality to version bump script",
          "Enhanced theme switching reliability in hero background animation"
        ],
        changed: [
          "Improved version script to handle uncommitted changes automatically"
        ]
      }
    },
    {
      version: "0.1.28",
      date: "2025-11-24", 
      changes: {
        added: [
          "Final version validation system",
          "Prevention of empty releases",
          "Enhanced changelog management"
        ],
        fixed: [
          "Changelog cleanup removing unreleased entries",
          "Version script workflow issues"
        ]
      }
    }
  ];

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/50">
        <div className="w-full max-w-full px-3 sm:px-6 py-2 sm:py-3">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-400 text-sm">
              <Package className="w-4 h-4" />
              <span className="whitespace-nowrap">Lukas Latam</span>
              <Dialog open={isChangelogOpen} onOpenChange={setIsChangelogOpen}>
                <DialogTrigger asChild>
                  <button type="button" className="focus:outline-none">
                    <Badge
                      variant="secondary"
                      className="text-[11px] sm:text-xs bg-slate-800/80 text-slate-100 border border-slate-700/60 cursor-pointer"
                    >
                      v{version}
                    </Badge>
                  </button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl max-h-[80vh] bg-slate-950 border-slate-800">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-slate-100 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Changelog
                    </DialogTitle>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <Badge variant="outline" className="border-slate-700 text-slate-200">
                        Current version: v{version}
                      </Badge>
                      <a
                        href="https://github.com/hashpass-tech/lukas.lat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors"
                      >
                        <span>View on GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <div className="flex items-center gap-1 text-slate-500">
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
                          className="border-b border-slate-800 pb-4 last:border-0"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className="text-cyan-400 border-cyan-400/30"
                              >
                                v{entry.version}
                              </Badge>
                              <div className="flex items-center text-slate-400 text-sm">
                                <Calendar className="w-3 h-3 mr-1" />
                                {entry.date}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {entry.changes.added && entry.changes.added.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-green-400 mb-2">
                                  Added
                                </h4>
                                <ul className="space-y-1">
                                  {entry.changes.added.map((change, idx) => (
                                    <li
                                      key={idx}
                                      className="text-sm text-slate-300 flex items-start"
                                    >
                                      <span className="text-green-400 mr-2">•</span>
                                      {change}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {entry.changes.changed && entry.changes.changed.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-yellow-400 mb-2">
                                  Changed
                                </h4>
                                <ul className="space-y-1">
                                  {entry.changes.changed.map((change, idx) => (
                                    <li
                                      key={idx}
                                      className="text-sm text-slate-300 flex items-start"
                                    >
                                      <span className="text-yellow-400 mr-2">•</span>
                                      {change}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {entry.changes.fixed && entry.changes.fixed.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-blue-400 mb-2">
                                  Fixed
                                </h4>
                                <ul className="space-y-1">
                                  {entry.changes.fixed.map((change, idx) => (
                                    <li
                                      key={idx}
                                      className="text-sm text-slate-300 flex items-start"
                                    >
                                      <span className="text-blue-400 mr-2">•</span>
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
