import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount, useDisconnect } from "wagmi";
import EthContext from "../context/EthContext";
import { ABI_TALENT, AUTHORIZATION } from "../utils/contracts";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "AI Chat", href: "/knowledge" },
  { label: "Share", href: "/knowledge/share" },
  { label: "MNIST", href: "/mnist" },
  { label: "Purchase", href: "/purchase" },
];

function truncateAddress(address?: string | null) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function Layout() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [balance, setBalanceState] = useState<bigint>(0n);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState<boolean>(false);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setWalletMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setWalletMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    const handleTouchOutside = (event: TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setWalletMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleTouchOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleTouchOutside);
    };
  }, []);

  const isAuthenticated = Boolean(ready && authenticated && isConnected && address);

  useEffect(() => {
    if (!isAuthenticated || !address) {
      setBalanceState(0n);
      return;
    }

    let ignore = false;

    const resolveProvider = async () => {
      const normalizedAddress = address.toLowerCase();
      const connectedWallet =
        wallets.find((wallet: any) => wallet.address?.toLowerCase() === normalizedAddress) ?? wallets[0];

      if (connectedWallet) {
        const anyWallet = connectedWallet as unknown as {
          getEthereumProvider?: () => Promise<unknown>;
          walletClient?: { transport?: unknown };
        };

        if (typeof anyWallet.getEthereumProvider === "function") {
          const provider = await anyWallet.getEthereumProvider();
          if (provider) {
            return new ethers.BrowserProvider(provider as any);
          }
        }

        const transport = anyWallet.walletClient?.transport as any;
        if (transport && typeof transport.request === "function") {
          return new ethers.BrowserProvider(transport);
        }
      }

      if (window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
      }

      throw new Error("No Ethereum provider available.");
    };

    const fetchBalance = async () => {
      try {
        const provider = await resolveProvider();
        const contract = new ethers.Contract(AUTHORIZATION, ABI_TALENT, provider);
        const userBalance = await contract.balanceOf(address);
        if (!ignore && typeof userBalance === "bigint") {
          setBalanceState(userBalance);
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        if (!ignore) {
          setBalanceState(0n);
        }
      }
    };

    fetchBalance();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, address, wallets]);

  const handleConnectWallet = async () => {
    if (!ready) return;
    try {
      await login();
    } catch (error) {
      console.error("Privy login failed:", error);
    }
  };

  const handleDisconnectWallet = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (isDisconnecting) return;

    setIsDisconnecting(true);
    setWalletMenuOpen(false);

    try {
      if (authenticated) {
        await logout();
      }

      if (isConnected) {
        await disconnect();
      }

      setBalanceState(0n);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 150));
      setIsDisconnecting(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
    } catch (error) {
      console.error("Failed to copy address", error);
    }
  };

  const showLoader = !mounted || !ready;

  if (showLoader) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#05060F] text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-sky-400" />
          <p className="text-sm uppercase tracking-[0.6em] text-white/60">SYNCING WALLET…</p>
        </div>
      </div>
    );
  }

  return (
    <EthContext.Provider
      value={{ isAuthenticated, balance, setBalance: setBalanceState, address: address ?? null }}
    >
      <div className="relative flex min-h-screen w-full flex-col bg-[#05060F] text-slate-100">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-[-10rem] h-[420px] w-[420px] rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute right-[-6rem] top-32 h-[360px] w-[360px] rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-[-14rem] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <header className="sticky top-0 z-30 border-b border-white/5 bg-[#06091A]/80 backdrop-blur-2xl">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/40 via-[#0b1030]/50 to-black/40" />
          <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
            <NavLink to="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20 text-sm font-semibold text-sky-300">
                MAI
              </span>
              <div className="flex flex-col">
                <span className="text-base font-semibold tracking-wide text-white">Mindchain AI</span>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                  Credits · Mnist · Knowledge
                </span>
              </div>
            </NavLink>

            <button
              type="button"
              className="rounded-full border border-white/15 bg-white/5 p-2 text-white/70 md:hidden"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setMobileOpen((prev) => !prev);
              }}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm font-medium text-white/70 shadow-lg shadow-black/20 backdrop-blur md:flex">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 transition duration-200 ${
                      isActive ? "bg-white/20 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setWalletMenuOpen((prev) => !prev)}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 shadow-lg shadow-black/30 transition hover:border-sky-400/40 hover:bg-white/15"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="font-mono text-sm text-white">{truncateAddress(address)}</span>
                      </span>
                        <span className="hidden items-center gap-2 text-xs uppercase tracking-[0.3em] text-sky-200 md:flex">
                        <span className="h-2 w-2 rounded-full bg-sky-400/80" />
                        {balance.toString()} credits
                      </span>
                      <svg
                        className={`h-4 w-4 text-white transition-transform ${walletMenuOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {walletMenuOpen && (
                    <div className="absolute right-6 mt-3 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0A0D24]/95 shadow-2xl shadow-black/40 backdrop-blur">
                        <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20">
                          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">MAI</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs uppercase tracking-[0.3em] text-white/40">connected wallet</span>
                          <span className="font-mono text-sm text-white">
                            {truncateAddress(address)}{" "}
                            <span className="ml-2 text-[10px] uppercase tracking-[0.3em] text-white/30">
                              {wallets[0]?.walletClientType || connector?.name || "Wallet"}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-xs uppercase tracking-[0.3em] text-white/40">credits</span>
                          <span className="text-base font-semibold text-sky-300">{balance.toString()}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyAddress}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:bg-white/10"
                        >
                          Copy Address
                        </button>
                      </div>

                      <div className="border-t border-white/10 bg-white/5 px-4 py-3">
                        <button
                          type="button"
                          onClick={handleDisconnectWallet}
                          disabled={isDisconnecting}
                          className={`flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                            isDisconnecting
                              ? "border-white/10 text-white/40"
                              : "border-red-500/30 text-red-300 hover:border-red-400/50 hover:bg-red-500/10"
                          }`}
                        >
                          {isDisconnecting ? (
                            <>
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-transparent" />
                              Disconnecting…
                            </>
                          ) : (
                            "Disconnect"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectWallet}
                  className="group relative overflow-hidden rounded-full border border-sky-500/40 bg-sky-500/20 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-sky-200 transition hover:bg-sky-500/30"
                >
                  <span className="relative z-10">Connect Wallet</span>
                  <span className="absolute inset-0 -translate-y-full bg-sky-400/40 transition duration-300 group-hover:translate-y-0" />
                </button>
              )}
            </div>
          </div>

          {mobileOpen && (
            <nav
              ref={mobileMenuRef}
              className="mx-4 mb-4 flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#101431]/95 p-4 text-sm font-medium text-white/80 shadow-lg shadow-black/30 backdrop-blur md:hidden"
            >
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 transition duration-200 ${
                      isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-3 border-t border-white/10 pt-3">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.3em] text-white/50">wallet</span>
                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60 transition hover:bg-white/10"
                      >
                        Copy
                      </button>
                    </div>
                        <span className="font-mono text-sm text-white">{truncateAddress(address)}</span>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/40">
                      <span>credits</span>
                      <span className="text-sky-300">{balance.toString()}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        handleDisconnectWallet(event);
                        setMobileOpen(false);
                      }}
                      disabled={isDisconnecting}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                        isDisconnecting
                          ? "border-white/10 text-white/40"
                          : "border-red-500/30 text-red-300 hover:border-red-400/50 hover:bg-red-500/10"
                      }`}
                    >
                      {isDisconnecting ? "Disconnecting…" : "Disconnect"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleConnectWallet();
                      setMobileOpen(false);
                    }}
                    className="w-full rounded-full border border-sky-500/40 bg-sky-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200 transition hover:bg-sky-500/30"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </nav>
          )}
        </header>

        <main className="relative z-10 flex w-full flex-1 flex-col overflow-x-hidden">
          <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:py-16 lg:py-20">
            <Outlet />
          </div>
        </main>

        <footer className="relative z-10 border-t border-white/5 bg-black/40 py-6 text-center text-xs uppercase tracking-[0.3em] text-white/40 backdrop-blur">
          mindchain ai · built for the web3bridge hackathon · arbitrum stylus · {new Date().getFullYear()}
        </footer>
      </div>
    </EthContext.Provider>
  );
}
