/// <reference types="react" />

declare module "@privy-io/react-auth" {
  interface PrivyAppearance {
    theme?: "light" | "dark";
    accentColor?: string;
    loginMessage?: string;
    showWalletLoginFirst?: boolean;
    landingHeader?: string;
    logo?: string;
  }

  interface PrivyEmbeddedWalletsConfig {
    ethereum?: {
      createOnLogin?: "all-users" | "users-without-wallets";
    };
  }

  interface PrivyConfig {
    appearance?: PrivyAppearance;
    loginMethods?: string[];
    embeddedWallets?: PrivyEmbeddedWalletsConfig;
    defaultChain?: unknown;
    supportedChains?: unknown[];
  }

  interface PrivyProviderProps {
    appId: string;
    config?: PrivyConfig;
    children: React.ReactNode;
  }

  interface PrivyContext {
    ready: boolean;
    authenticated: boolean;
    user: unknown;
    login: () => Promise<void>;
    logout: () => Promise<void>;
  }

  interface PrivyWallet {
    address?: string;
    walletClientType?: string;
    getEthereumProvider?: () => Promise<unknown>;
    walletClient?: {
      transport?: unknown;
    };
  }

  interface WalletsContext {
    wallets: PrivyWallet[];
  }

  export const PrivyProvider: React.ComponentType<PrivyProviderProps>;
  export function usePrivy(): PrivyContext;
  export function useWallets(): WalletsContext;
}

declare module "@privy-io/wagmi" {
  interface WagmiProviderProps {
    config: unknown;
    children: React.ReactNode;
  }

  export const WagmiProvider: React.ComponentType<WagmiProviderProps>;
}


