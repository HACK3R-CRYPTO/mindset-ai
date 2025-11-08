import { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Code, Database, Sparkles, Users } from 'lucide-react';
import EthContext from '../context/EthContext';
import { AUTHORIZATION, EXPLORER_ADDRESS_BASE } from '../utils/contracts';

const QuickLink = ({ to, label, description }: { to: string; label: string; description: string }) => (
  <Link
    to={to}
    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:border-sky-400/60 hover:bg-white/10"
  >
    <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/0 via-sky-500/0 to-sky-500/10 opacity-0 transition duration-300 group-hover:opacity-100" />
    <div className="relative flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">Explore</p>
        <h3 className="mt-2 text-xl font-semibold text-white">{label}</h3>
        <p className="mt-2 text-sm text-white/60">{description}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition group-hover:border-sky-400/60 group-hover:text-sky-300">
        <ArrowRight className="h-5 w-5" />
      </div>
    </div>
  </Link>
);

const FeatureCard = ({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) => (
  <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/10 backdrop-blur">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/15 text-sky-300">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="text-sm text-white/60">{body}</p>
  </div>
);

function Home() {
  const { isAuthenticated } = useContext(EthContext);
  const contractExplorerUrl = useMemo(
    () => `${EXPLORER_ADDRESS_BASE}/${AUTHORIZATION}`,
    []
  );

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-tr from-slate-900 via-slate-900/80 to-[#132347] p-1">
        <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#0c1020]/80 px-8 py-12 sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="absolute inset-y-0 right-[-20%] hidden w-[45%] rounded-full bg-sky-500/20 blur-[120px] lg:block" />
          <div className="relative z-10 max-w-xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-sky-300">
              <Sparkles className="h-3 w-3" /> live on arbitrum stylus
            </span>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Build & gate AI experiences <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">on-chain</span>
            </h1>
            <p className="max-w-lg text-base text-white/65 sm:text-lg">
              Mindchain AI is a composable playground where wallets purchase usage credits, community members share knowledge, and neural networks respond in real time—secured by Stylus smart contracts.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/knowledge"
                    className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-sky-400"
                  >
                    Open AI Desk <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/mnist"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white/80 transition hover:border-sky-400/60 hover:text-white"
                  >
                    Draw a digit
                  </Link>
                </>
              ) : (
                <Link
                  to="/purchase"
                  className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-sky-400"
                >
                  Connect & mint credits
                </Link>
              )}
              <a
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/0 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white/60 transition hover:border-white/40 hover:text-white"
                href={contractExplorerUrl}
                target="_blank"
                rel="noreferrer"
              >
                View contracts
              </a>
            </div>
          </div>
          <div className="relative z-10 mt-10 flex w-full max-w-md flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:mx-auto lg:mt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-500/15 text-sky-300">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">live metrics</p>
                <h3 className="text-lg font-semibold text-white">Hackathon snapshot</h3>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm text-white">
              <div>
                <dt className="text-white/40">Credits minted</dt>
                <dd className="mt-1 text-xl font-semibold text-sky-300">120+</dd>
              </div>
              <div>
                <dt className="text-white/40">Knowledge entries</dt>
                <dd className="mt-1 text-xl font-semibold text-sky-300">58</dd>
              </div>
              <div>
                <dt className="text-white/40">MNIST accuracy</dt>
                <dd className="mt-1 text-xl font-semibold text-sky-300">99.1%</dd>
              </div>
              <div>
                <dt className="text-white/40">Response latency</dt>
                <dd className="mt-1 text-xl font-semibold text-sky-300">~1.8s</dd>
              </div>
            </dl>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              user journey
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
              <span className="rounded-full bg-white/5 px-4 py-2 text-white/70">connect</span>
              <span className="rounded-full bg-white/5 px-4 py-2 text-white/70">purchase</span>
              <span className="rounded-full bg-white/5 px-4 py-2 text-white/70">predict</span>
              <span className="rounded-full bg-white/5 px-4 py-2 text-white/70">share</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <FeatureCard
          icon={Brain}
          title="On-chain intelligence"
          body="Stylus contracts meter API usage and keep AI interactions verifiable for every connected wallet."
        />
        <FeatureCard
          icon={Users}
          title="Collective knowledge"
          body="Community submissions are stored via KnowledgeShare, powering contextual responses in the chat."
        />
        <FeatureCard
          icon={Code}
          title="Full-stack ready"
          body="Rust, React, TensorFlow, and Gemini—wired together in under 24 hours for the hackathon showcase."
        />
        <FeatureCard
          icon={Database}
          title="Composable credits"
          body="The authorization contract can gate any API—from models to storage—making Mindchain AI reusable boilerplate."
        />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <QuickLink
          to="/knowledge"
          label="AI Desk"
          description="Ask questions and watch on-chain credits unlock Gemini responses in real time."
        />
        <QuickLink
          to="/knowledge/share"
          label="Knowledge Share"
          description="Commit your tips and wellness insights to the chain—curate the assistant's voice."
        />
        <QuickLink
          to="/mnist"
          label="MNIST Studio"
          description="Sketch digits, debit a token, and get predictions from the on-chain gated TensorFlow model."
        />
        <QuickLink
          to="/purchase"
          label="Credit Terminal"
          description="Bridge Sepolia ETH for AI access. Purchases and usage are transparent and auditable."
        />
      </section>
    </div>
  );
}

export default Home;
