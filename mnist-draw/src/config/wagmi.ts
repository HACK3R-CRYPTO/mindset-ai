import { createConfig, http } from "wagmi";
import { arbitrumSepolia } from "viem/chains";

export const supportedChains = [arbitrumSepolia] as const;

export const wagmiConfig = createConfig({
  chains: supportedChains,
  transports: {
    [arbitrumSepolia.id]: http(),
  },
  ssr: false,
});


