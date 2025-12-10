"use client";

import { useState } from "react";
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

export default function Footer({ version = "0.1.32" }: FooterProps) {
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
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <Package className="w-4 h-4" />
              <span>Lukas Latam</span>
              <a 
                href="https://github.com/hashpass-tech/lukas.lat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Badge variant="secondary" className="text-xs hover:bg-slate-700 transition-colors cursor-pointer">
                  v{version}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Badge>
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Dialog open={isChangelogOpen} onOpenChange={setIsChangelogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                >
                  <History className="w-4 h-4 mr-2" />
                  Changelog
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] bg-slate-950 border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-slate-100 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Changelog
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-6">
                    {changelogData.map((entry) => (
                      <div key={entry.version} className="border-b border-slate-800 pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
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
                              <h4 className="text-sm font-medium text-green-400 mb-2">Added</h4>
                              <ul className="space-y-1">
                                {entry.changes.added.map((change, idx) => (
                                  <li key={idx} className="text-sm text-slate-300 flex items-start">
                                    <span className="text-green-400 mr-2">•</span>
                                    {change}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {entry.changes.changed && entry.changes.changed.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-yellow-400 mb-2">Changed</h4>
                              <ul className="space-y-1">
                                {entry.changes.changed.map((change, idx) => (
                                  <li key={idx} className="text-sm text-slate-300 flex items-start">
                                    <span className="text-yellow-400 mr-2">•</span>
                                    {change}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {entry.changes.fixed && entry.changes.fixed.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-blue-400 mb-2">Fixed</h4>
                              <ul className="space-y-1">
                                {entry.changes.fixed.map((change, idx) => (
                                  <li key={idx} className="text-sm text-slate-300 flex items-start">
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

            <div className="flex items-center space-x-2 text-slate-500 text-xs">
              <GitBranch className="w-3 h-3" />
              <span>main</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
