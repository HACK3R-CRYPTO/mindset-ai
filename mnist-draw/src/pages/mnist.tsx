
// Mnist.jsx
import { useContext, useEffect, useState } from 'react';
import { PenTool, Info } from 'lucide-react';
import PixelGrid from '../components/PixelGrid';
import EthContext from '../context/EthContext';

export default function Mnist() {
  const { isAuthenticated } = useContext(EthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [isAuthenticated]);

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-white/10 bg-black/20 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-sky-300" />
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">loading studio…</p>
        </div>
      </div>
    );

  if (!isAuthenticated) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mx-auto max-w-xl space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            <PenTool className="h-4 w-4" /> mnist studio
          </div>
          <h1 className="text-3xl font-semibold">Connect your wallet to sketch digits</h1>
          <p className="text-sm text-white/60">
            Credits pay for each inference. Mint at least one credit, connect via the header, and come back to see the TensorFlow model in action.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10 pb-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/60 to-slate-950 p-1">
        <div className="relative rounded-[calc(1.5rem-1px)] bg-black/50 p-8 sm:p-12">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.25),transparent_65%)]" />
          <div className="flex flex-col gap-6 text-white lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
                <PenTool className="h-3 w-3" /> mnist studio
              </span>
              <h1 className="text-4xl font-semibold sm:text-5xl">Debit a credit & watch the model guess the digit</h1>
              <p className="text-sm text-white/65 sm:max-w-xl">
                Draw directly on the 28×28 grid. The canvas payload is sent to the Flask TensorFlow API, gated by the same credits you minted earlier.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-xl shadow-black/30">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">usage tips</p>
              <ul className="mt-4 space-y-3">
                <li>• Use your mouse or trackpad to sketch a bold digit.</li>
                <li>• Each prediction consumes one credit.</li>
                <li>• Hit “Reset” on the right-hand controls to start over.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.45fr)]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
          <PixelGrid />
        </div>
        <aside className="flex min-w-[320px] max-w-[420px] flex-col gap-6 rounded-3xl border border-white/10 bg-white/6 p-6 text-sm text-white/75 shadow-xl shadow-black/30">
          <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-white/45">model specs</p>
            <p className="mt-3 leading-relaxed text-white/75">
              Trained CNN → 2 convolution layers, 1 dense layer, ~99% accuracy on test set. Hosted via Flask, available at `POST /predict`.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-white/45">did you know?</p>
            <p className="mt-3 leading-relaxed text-white/75">
              MNIST was released in 1998 and remains the “hello world” of computer vision. We made it payable with Stylus credits to show how Web3 can gate ML APIs.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-white/45">having trouble?</p>
            <p className="mt-3 leading-relaxed text-white/75">
              Ensure the Flask server (`python3 app.py`) is running and you have credits left. Thin lines can confuse the model—draw with confidence!
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
