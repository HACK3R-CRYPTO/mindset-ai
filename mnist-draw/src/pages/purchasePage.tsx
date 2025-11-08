import { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { Coins, CreditCard, ArrowRightCircle } from "lucide-react";
import { ABI_TALENT, AUTHORIZATION } from "../utils/contracts";

export default function PurchasePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [contract, setContract] = useState<Contract | null>(null);
  const [purchasing, setPurchasing] = useState<boolean>(false);

  const CONTRACT_ADDRESS = AUTHORIZATION;
  const ABI = ABI_TALENT;
  const ACCESS_COST = 2180330000000000n; // Cost per access in wei

  const etherCost = ethers.formatEther(ACCESS_COST);

  useEffect(() => {
    const initialize = async () => {
      if (!window.ethereum) {
        setLoading(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);

      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      setContract(contractInstance);
      const userBalance = await contractInstance.balanceOf(userAddress);
      setBalance(userBalance);
      setLoading(false);
    };

    initialize();
  }, []);

  const handlePurchase = async () => {
    if (!contract) return;
    setPurchasing(true);
    try {
      const tx = await contract.purchase({ value: ACCESS_COST });
      await tx.wait();

      if (address) {
        const userBalance = await contract.balanceOf(address);
        setBalance(userBalance);
      }
      setPurchasing(false);
    } catch (error) {
      console.error("Purchase failed:", error);
      setPurchasing(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to use this feature.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setIsAuthenticated(true);
      setAddress(userAddress);

      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      setContract(contractInstance);

      const userBalance = await contractInstance.balanceOf(userAddress);
      setBalance(userBalance);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      setIsAuthenticated(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-white/10 bg-black/20 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-sky-300" />
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">syncing credits…</p>
        </div>
      </div>
    );

  return (
    <section className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/60 to-slate-950 p-1">
        <div className="relative rounded-[calc(1.5rem-1px)] bg-black/50 p-8 sm:p-12">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.25),transparent_65%)]" />
          <div className="flex flex-col gap-6 text-white lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">
                <Coins className="h-3 w-3" /> credit terminal
              </span>
              <h1 className="text-4xl font-semibold sm:text-5xl">Mint access credits for Mindchain AI</h1>
              <p className="text-sm text-white/65 sm:max-w-xl">
                Each credit unlocks a full Gemini response and MNIST inference. All purchases flow through the `purchase()` method on-chain—transparent, auditable, unstoppable.
              </p>
            </div>
            <div className="grid w-full max-w-sm gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">price per credit</p>
                <p className="text-lg font-semibold text-sky-300">{etherCost} ETH</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">live balance</p>
                <p className="text-lg font-semibold text-sky-300">{balance ? balance.toString() : '0'}</p>
              </div>
              <p className="text-xs text-white/50">
                Gas fees apply. Credits spend automatically when you post prompts or submit knowledge.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.55fr,0.45fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/30">
          {isAuthenticated ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">connected wallet</p>
                <p className="mt-3 font-mono text-sm text-white/80">{address}</p>
              </div>
              <button
                type="button"
                onClick={handlePurchase}
                disabled={purchasing}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
              >
                {purchasing ? 'Processing…' : 'Purchase credit'} <ArrowRightCircle className="h-4 w-4" />
              </button>
              <p className="text-xs text-white/50">
                After minting, your balance updates instantly inside the header badge and here. Each chat response or MNIST inference will spend one credit.
              </p>
            </div>
          ) : (
            <div className="space-y-6 text-center text-white/70">
              <CreditCard className="mx-auto h-10 w-10 text-sky-300" />
              <p className="text-lg font-semibold text-white">Connect wallet to mint credits</p>
              <p className="text-sm text-white/50">
                We’ll switch you to Arbitrum Sepolia automatically. Keep at least 0.01 ETH for gas plus credit purchases.
              </p>
              <button
                type="button"
                onClick={handleConnectWallet}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-sky-400"
              >
                Connect wallet
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/70 shadow-xl shadow-black/30">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">credit flow</p>
            <ul className="mt-4 space-y-3">
              <li>• `purchase()` mints 1 credit per {etherCost} ETH.</li>
              <li>• `markUsage(address)` burns credits after each AI interaction.</li>
              <li>• You can inspect every transaction on Arbiscan for full transparency.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/70 shadow-xl shadow-black/30">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">need Sepolia ETH?</p>
            <p className="mt-3 text-white/70">
              Grab testnet ETH from an Arbitrum Sepolia faucet and keep a small buffer for gas. Credits never expire, so you can stock up for demos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
