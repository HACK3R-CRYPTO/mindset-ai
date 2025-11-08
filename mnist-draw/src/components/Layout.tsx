import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ethers } from "ethers";
import EthContext from "../context/EthContext";
import { ABI_TALENT, AUTHORIZATION } from "../utils/contracts";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "AI Chat", href: "/knowledge" },
  { label: "Share", href: "/knowledge/share" },
  { label: "MNIST", href: "/mnist" },
  { label: "Purchase", href: "/purchase" },
];

function truncateAddress(address: string | null) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setIsAuthenticated(true);
          const signer = await provider.getSigner();
          const userAddress = await signer.getAddress();
          setAddress(userAddress);

          const contract = new ethers.Contract(AUTHORIZATION, ABI_TALENT, provider);
          const userBalance = await contract.balanceOf(userAddress);
          setBalance(userBalance);
        }
      }
      setLoading(false);
    };
    checkWalletConnection();
  }, []);

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

      const contract = new ethers.Contract(AUTHORIZATION, ABI_TALENT, provider);
      const userBalance = await contract.balanceOf(userAddress);
      setBalance(userBalance);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      setIsAuthenticated(false);
    }
  };

  const handleDisconnectWallet = () => {
    setIsAuthenticated(false);
    setAddress(null);
    setBalance(0n);
    window.location.reload();
  };

  if (loading) {
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
      value={{ isAuthenticated, balance: balance ?? 0n, setBalance, address }}
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
              onClick={() => setMobileOpen((prev) => !prev)}
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
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 shadow-lg shadow-black/30">
                  <div className="hidden flex-col text-left sm:flex">
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">wallet</span>
                    <span className="font-mono text-sm text-white">{truncateAddress(address)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">credits</span>
                    <span className="font-semibold text-sky-300">{balance?.toString() ?? "0"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDisconnectWallet}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:bg-white/10"
                  >
                    Disconnect
                  </button>
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
            <nav className="mx-4 mb-4 flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#101431]/90 p-4 text-sm font-medium text-white/80 shadow-lg shadow-black/30 backdrop-blur md:hidden">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 transition duration-200 ${
                      isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
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
