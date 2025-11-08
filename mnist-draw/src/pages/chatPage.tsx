// src/components/ChatPage.tsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Sparkles, Send, MessageSquare } from 'lucide-react';
import EthContext from '../context/EthContext';

interface Message {
  sender: 'user' | 'ai';
  content: string;
}

const ChatPage: React.FC = () => {
  const { isAuthenticated, address, balance, setBalance } = useContext(EthContext);
  const [inputMessage, setInputMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!isAuthenticated || !address) {
      setError('Please connect your wallet to unlock the AI desk.');
      return;
    }

    if (balance === 0n) {
      setError('You have no credits available. Purchase more to continue chatting.');
      return;
    }

    setError('');
    setLoading(true);
    setChatHistory((prev) => [...prev, { sender: 'user', content: inputMessage }]);

    try {
      const response = await fetch('http://localhost:8000/query-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputMessage,
          ethAddress: address,
        }),
      });

      setBalance((current) => (current ? (current > 0n ? current - 1n : 0n) : 0n));
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'An error occurred. Please try again.';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const aiResponse = data.result;
      setChatHistory((prev) => [...prev, { sender: 'ai', content: aiResponse }]);
    } catch (err: any) {
      console.error('Error:', err);
      const errorMessage = err.message || 'Something went wrong. Try again.';
      setError(errorMessage);
      setChatHistory((prev) => [
        ...prev,
        { sender: 'ai', content: '⚠️ ' + errorMessage },
      ]);
    } finally {
      setLoading(false);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/60 to-slate-950" />
      <div className="relative grid gap-10 rounded-3xl border border-white/15 bg-black/20 p-6 shadow-2xl shadow-black/40 backdrop-blur lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)] lg:p-10">
        <div className="flex h-[620px] flex-col rounded-2xl border border-white/10 bg-white/5">
          <header className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">AI Desk</p>
              <h1 className="text-2xl font-semibold text-white">Mindchain Companion</h1>
              <p className="mt-1 text-sm text-white/60">Credits unlock Gemini-powered responses enhanced by on-chain knowledge.</p>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60 sm:flex">
              <Sparkles className="h-4 w-4 text-sky-300" />
              {balance ? balance.toString() : '0'} credits
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            {chatHistory.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white/55">
                <MessageSquare className="h-10 w-10" />
                <p className="text-sm uppercase tracking-[0.25em]">start a conversation</p>
                <p className="max-w-sm text-xs text-white/45">
                  Credits are consumed on send. Responses are grounded in KnowledgeShare entries and the hacks we shipped during the sprint.
                </p>
              </div>
            )}
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xl rounded-2xl border border-white/10 px-5 py-3 text-sm shadow-lg transition ${
                    message.sender === 'user'
                      ? 'bg-sky-500/80 text-slate-950'
                      : 'bg-white/8 text-white'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="mx-6 mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-white/5 bg-white/5 px-6 py-5">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:border-sky-400/60 focus:outline-none"
              placeholder={isAuthenticated ? 'Ask something…' : 'Connect your wallet to start chatting'}
              disabled={!isAuthenticated || loading}
            />
            <button
              onClick={handleSendMessage}
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
              disabled={!isAuthenticated || loading || balance === 0n}
            >
              {loading ? 'Sending…' : 'Send'} <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        <aside className="flex min-w-[320px] max-w-[420px] flex-col gap-6 rounded-2xl border border-white/10 bg-white/6 p-6 text-sm text-white/75">
          <div className="rounded-2xl border border-white/10 bg-white/8 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Credit Flow</p>
            <ul className="mt-4 space-y-3 text-white/75">
              <li>• 1 credit per AI response</li>
              <li>• Credits are minted via the <span className="text-sky-300">Authorization</span> contract</li>
              <li>• Usage is logged with <span className="text-sky-300">markUsage(address)</span></li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/8 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Knowledge Sources</p>
            <p className="mt-3 leading-relaxed text-white/75">
              Answers are grounded in real knowledge submissions and the demo scaffolding built during the hackathon sprint. Contribute more in <span className="text-sky-300">Knowledge Share</span> to shape the assistant.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/8 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Tip</p>
            <p className="mt-3 leading-relaxed text-white/75">
              Try prompts like:
              <br />
              <span className="text-sky-300">“Suggest two positive psychology exercises for remote teams.”</span>
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default ChatPage;
