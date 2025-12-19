/**
 * Network-specific color scheme for UI components
 * Provides consistent color coding across all network indicators
 */

export type NetworkColorScheme = {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Background colors
  bg: string;
  bgLight: string;
  bgDark: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Text colors
  text: string;
  textLight: string;
  
  // Glow/shadow colors
  glow: string;
  glowLight: string;
  
  // Tailwind class names for quick use
  tailwind: {
    bg: string;
    text: string;
    border: string;
    glow: string;
    badge: string;
  };
};

export const NETWORK_COLORS: Record<number, NetworkColorScheme> = {
  // Ethereum Mainnet - Green
  1: {
    primary: '#10b981',
    primaryLight: '#6ee7b7',
    primaryDark: '#059669',
    bg: 'rgb(16, 185, 129)',
    bgLight: 'rgba(16, 185, 129, 0.1)',
    bgDark: 'rgba(16, 185, 129, 0.2)',
    border: 'rgb(5, 150, 105)',
    borderLight: 'rgba(5, 150, 105, 0.3)',
    text: '#ffffff',
    textLight: '#10b981',
    glow: 'rgba(16, 185, 129, 0.5)',
    glowLight: 'rgba(16, 185, 129, 0.2)',
    tailwind: {
      bg: 'bg-emerald-500',
      text: 'text-emerald-600',
      border: 'border-emerald-500',
      glow: 'shadow-emerald-500/50',
      badge: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    },
  },
  
  // Polygon Amoy Testnet - Purple
  80002: {
    primary: '#a855f7',
    primaryLight: '#d8b4fe',
    primaryDark: '#7e22ce',
    bg: 'rgb(168, 85, 247)',
    bgLight: 'rgba(168, 85, 247, 0.1)',
    bgDark: 'rgba(168, 85, 247, 0.2)',
    border: 'rgb(126, 34, 206)',
    borderLight: 'rgba(126, 34, 206, 0.3)',
    text: '#ffffff',
    textLight: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.5)',
    glowLight: 'rgba(168, 85, 247, 0.2)',
    tailwind: {
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      border: 'border-purple-500',
      glow: 'shadow-purple-500/50',
      badge: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
    },
  },
  
  // Sepolia Testnet - Blue
  11155111: {
    primary: '#3b82f6',
    primaryLight: '#93c5fd',
    primaryDark: '#1d4ed8',
    bg: 'rgb(59, 130, 246)',
    bgLight: 'rgba(59, 130, 246, 0.1)',
    bgDark: 'rgba(59, 130, 246, 0.2)',
    border: 'rgb(29, 78, 216)',
    borderLight: 'rgba(29, 78, 216, 0.3)',
    text: '#ffffff',
    textLight: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.5)',
    glowLight: 'rgba(59, 130, 246, 0.2)',
    tailwind: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      border: 'border-blue-500',
      glow: 'shadow-blue-500/50',
      badge: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    },
  },
};

// Default colors for unknown networks
export const DEFAULT_NETWORK_COLORS: NetworkColorScheme = {
  primary: '#6b7280',
  primaryLight: '#d1d5db',
  primaryDark: '#374151',
  bg: 'rgb(107, 114, 128)',
  bgLight: 'rgba(107, 114, 128, 0.1)',
  bgDark: 'rgba(107, 114, 128, 0.2)',
  border: 'rgb(55, 65, 81)',
  borderLight: 'rgba(55, 65, 81, 0.3)',
  text: '#ffffff',
  textLight: '#6b7280',
  glow: 'rgba(107, 114, 128, 0.5)',
  glowLight: 'rgba(107, 114, 128, 0.2)',
  tailwind: {
    bg: 'bg-gray-500',
    text: 'text-gray-600',
    border: 'border-gray-500',
    glow: 'shadow-gray-500/50',
    badge: 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400',
  },
};

/**
 * Get network color scheme by chain ID
 */
export function getNetworkColors(chainId: number | null | undefined): NetworkColorScheme {
  if (!chainId) return DEFAULT_NETWORK_COLORS;
  return NETWORK_COLORS[chainId] || DEFAULT_NETWORK_COLORS;
}

/**
 * Get network emoji/icon by chain ID
 */
export function getNetworkEmoji(chainId: number | null | undefined): string {
  const emojis: Record<number, string> = {
    1: '🟢',        // Ethereum Mainnet - Green
    80002: '🟣',    // Polygon Amoy - Purple
    11155111: '🔵', // Sepolia - Blue
  };
  return emojis[chainId || 0] || '🌐';
}

/**
 * Get network icon/symbol by chain ID
 */
export function getNetworkIcon(chainId: number | null | undefined): string {
  const icons: Record<number, string> = {
    1: 'Ξ',        // Ethereum Mainnet - Ethereum symbol
    80002: '◆',    // Polygon Amoy - Diamond
    11155111: 'Ξ', // Sepolia - Ethereum symbol
  };
  return icons[chainId || 0] || '◎';
}

/**
 * Get network name by chain ID
 */
export function getNetworkName(chainId: number | null | undefined): string {
  const names: Record<number, string> = {
    1: 'Ethereum Mainnet',
    80002: 'Polygon Amoy',
    11155111: 'Sepolia',
  };
  return names[chainId || 0] || `Chain ${chainId || 'Unknown'}`;
}
