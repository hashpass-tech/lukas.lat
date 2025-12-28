import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --- TYPES ---
interface Wallet {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  onConnect: () => void;
}

interface ConnectWalletModalProps
  extends React.ComponentProps<typeof Dialog> {
  wallets: Wallet[];
  termsUrl?: string;
  policyUrl?: string;
}

// --- ICONS ---
const MetamaskIcon = (props: { className?: string }) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.236 7.707l-1.414-1.414a1 1 0 00-1.414 0l-1.414 1.414a1 1 0 01-1.414 0l-1.061-1.061a1 1 0 00-1.414 0l-2.121 2.121a1 1 0 01-1.414 0l-1.061-1.061a1 1 0 00-1.414 0l-1.414 1.414a1 1 0 01-1.414 0L3.586 11.293a1 1 0 00-1.414 1.414l7.071 7.071a1 1 0 001.414 0l2.121-2.121a1 1 0 011.414 0l1.061 1.061a1 1 0 001.414 0l2.121-2.121a1 1 0 011.414 0l1.061 1.061a1 1 0 001.414 0l1.414-1.414a1 1 0 000-1.414z" fill="#F6851B"/>
  </svg>
);

const CoinbaseWalletIcon = (props: { className?: string }) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-2-5h4v-2h-4v2zm0-4h4v-2h-4v2z" fill="#0052FF"/>
  </svg>
);

const WalletConnectIcon = (props: { className?: string }) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.07z" fill="#3B99FC"/>
  </svg>
);

const AlchemyIcon = (props: { className?: string }) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#6366F1" stroke="#6366F1" strokeWidth="2"/>
    <path d="M12 6V18M6 12H18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ArrowRightIcon = (props: { className?: string }) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);

// --- MAIN COMPONENT ---
export function ConnectWalletModal({
  wallets,
  termsUrl = "#",
  policyUrl = "#",
  ...props
}: ConnectWalletModalProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Dialog {...props}>
      <DialogContent className="bg-card/95 dark:bg-card/95 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 lg:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-md xl:max-w-md mx-4 border border-border shadow-2xl">
        <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground flex items-center justify-center gap-3">
            <span className="text-2xl sm:text-3xl">🔗</span>
            Connect Wallet
          </DialogTitle>
        </DialogHeader>

        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {wallets
            .filter(wallet => wallet.id === 'metamask' || wallet.id === 'walletconnect')
            .map((wallet) => (
            <motion.button
              key={wallet.id}
              variants={itemVariants}
              onClick={wallet.onConnect}
              className="group flex items-center justify-between w-full px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-foreground font-medium rounded-xl sm:rounded-2xl border border-border bg-background/20 hover:bg-background/30 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              aria-label={`Connect with ${wallet.name}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <wallet.icon className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm sm:text-base lg:text-lg">{wallet.name}</div>
                  <div className="text-xs sm:text-xs lg:text-sm text-muted-foreground">
                    {wallet.id === 'metamask' ? 'Most popular wallet' : 'Connect mobile wallets'}
                  </div>
                </div>
              </div>
              <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </motion.button>
          ))}
        </motion.div>
        {/* Terms and privacy links intentionally removed for wallet settings modal */}
      </DialogContent>
    </Dialog>
  );
}

// Export icons for reuse
export { MetamaskIcon, CoinbaseWalletIcon, WalletConnectIcon, AlchemyIcon };
