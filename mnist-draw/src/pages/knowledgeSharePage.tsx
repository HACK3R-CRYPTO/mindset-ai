// src/components/KnowledgeSharePage.tsx
import React, { useState, useEffect, useContext } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { Lightbulb, ShieldCheck, Sparkles } from 'lucide-react';
import EthContext from '../context/EthContext';
import { KNOWLEDGE_ABI, KNOWLEDGE_PUBLISH } from '../utils/contracts';

type KnowledgeItem = {
  address: string;
  knowledge: string;
};

const KnowledgeSharePage: React.FC = () => {
  const { isAuthenticated, address, setBalance } = useContext(EthContext);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isRewardInProgress, setIsRewardInProgress] = useState<boolean>(false);
  const [knowledge, setKnowledge] = useState<string>('');
  const [submittedKnowledge, setSubmittedKnowledge] = useState<KnowledgeItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [voteCount, setVoteCount] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated || !address) {
        setLoading(false);
        return;
      }

      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new Contract(KNOWLEDGE_PUBLISH, KNOWLEDGE_ABI, signer);
        setContract(contractInstance);

        const rewardStatus: boolean = await contractInstance.isRewardInProgress();
        setIsRewardInProgress(rewardStatus);

        const submissions: Array<{ addr: string; knowledge: string }> =
          await contractInstance.getSubmittedKnowledge();
        setSubmittedKnowledge(
          submissions.map((entry) => ({ address: entry.addr, knowledge: entry.knowledge }))
        );

        const userVoteCount = await contractInstance.getVote();
        setVoteCount(Number(userVoteCount));
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
      setLoading(false);
    };

    init();
  }, [isAuthenticated, address]);

  const handleKnowledgeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setKnowledge(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!knowledge.trim()) {
      setStatusMessage('Please enter some knowledge to share.');
      return;
    }

    if (!contract) {
      setStatusMessage('Smart contract is not initialized.');
      return;
    }

    try {
      setStatusMessage('Submitting knowledge to the blockchain...');
      const tx = await contract.share(knowledge);
      await tx.wait();
      setStatusMessage('Knowledge shared successfully!');
      setKnowledge('');

      const submissions: Array<{ addr: string; knowledge: string }> =
        await contract.getSubmittedKnowledge();
      setSubmittedKnowledge(
        submissions.map((entry) => ({ address: entry.addr, knowledge: entry.knowledge }))
      );
    } catch (error) {
      console.error('Error sharing knowledge:', error);
      setStatusMessage('Failed to share knowledge. Please try again.');
    }
  };

  const handleVote = async (index: number) => {
    if (!contract) {
      setStatusMessage('Smart contract is not initialized.');
      return;
    }

    try {
      setStatusMessage('Submitting your vote...');
      const tx = await contract.vote(index);
      await tx.wait();
      setStatusMessage('Vote submitted successfully!');

      const updatedVoteCount = await contract.getVote();
      setVoteCount(Number(updatedVoteCount));
    } catch (error) {
      console.error('Error submitting vote:', error);
      setStatusMessage('Failed to submit vote. Please try again.');
    }
  };

  const disconnectWallet = () => {
    setBalance(0n);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-white/10 bg-black/20 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-sky-300" />
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">loading knowledge hub…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !address) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mx-auto max-w-xl space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            <Lightbulb className="h-4 w-4" /> knowledge share
          </div>
          <h1 className="text-3xl font-semibold">Connect your wallet to contribute to Mindchain AI</h1>
          <p className="text-sm text-white/60">
            Credits power every submission. Mint your first credit, connect via the header, and help shape the assistant’s knowledge base.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/60 to-slate-950 p-1">
        <div className="relative rounded-[calc(1.5rem-1px)] bg-black/50 p-8 sm:p-12">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.25),transparent_65%)]" />
          <div className="flex flex-col gap-6 text-white lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">
                <Sparkles className="h-3 w-3" /> community intelligence
              </span>
              <h1 className="text-4xl font-semibold sm:text-5xl">Anchor Gemini’s tone with on-chain knowledge</h1>
              <p className="text-sm text-white/65 sm:max-w-xl">
                Submit tips, wellness practices, or ML insights. Each entry is stored via Stylus and immediately influences the chat assistant’s responses.
              </p>
            </div>
            <div className="grid w-full max-w-sm gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-xl shadow-black/30">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-500/15 text-sky-300">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">your votes</p>
                  <p className="text-2xl font-semibold text-sky-300">{voteCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">reward window</p>
                  <p className="text-sm font-medium text-white">
                    {isRewardInProgress ? 'Paused – waiting for votes' : 'Open for new submissions'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.55fr,0.45fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/30">
          {isRewardInProgress ? (
            <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-6 text-sm text-yellow-100">
              <h2 className="text-lg font-semibold text-yellow-200">Reward cycle in progress</h2>
              <p className="mt-3 text-yellow-100/80">
                We’ve hit the current share limit. Cast your vote below to finalize this round; new submissions will unlock as soon as the vote concludes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-white/40">share a tip</label>
                <textarea
                  value={knowledge}
                  onChange={handleKnowledgeChange}
                  rows={6}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-sky-400 focus:outline-none"
                  placeholder="Describe a coping strategy, fine-tuning insight, or community note…"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-sky-400"
              >
                Commit knowledge
              </button>
            </form>
          )}

          {statusMessage && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              {statusMessage}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/30">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Knowledge feed</h3>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                {submittedKnowledge.length} entries
              </span>
            </div>
            {submittedKnowledge.length > 0 ? (
              <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '420px' }}>
                {submittedKnowledge.map((item, index) => (
                  <article
                    key={`${item.address}-${index}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80 transition hover:border-sky-400/50 hover:bg-sky-500/10"
                  >
                    <p className="leading-relaxed text-white/90">{item.knowledge}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-white/40">
                      <span className="font-mono">{item.address}</span>
                      <button
                        onClick={() => handleVote(index)}
                        className="rounded-full border border-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-sky-400/60 hover:text-sky-300"
                      >
                        Vote
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/50">
                No knowledge has been shared yet—be the first contributor!
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/70 shadow-xl shadow-black/30">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">session controls</p>
            <p className="mt-3 text-white/70">
              Finished contributing for now? Disconnect your wallet to end the session and come back with fresh insights.
            </p>
            <button
              onClick={disconnectWallet}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-red-500/40 hover:text-red-200"
            >
              Disconnect wallet
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KnowledgeSharePage;
