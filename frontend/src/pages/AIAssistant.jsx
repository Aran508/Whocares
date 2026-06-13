import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import api from '../services/api.js';

const SUGGESTIONS = [
  'I need to buy 100 motors',
  'What is my current stock status?',
  'How do I reduce procurement costs?',
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "I'm your Business Brain. Tell me what you need — I can create purchase requests, check stock, or answer operations questions." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const message = text || input;
    if (!message.trim()) return;
    setMessages((m) => [...m, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/command', { message });
      let reply = '';
      if (data.intent === 'purchase_request') {
        reply = data.result.message;
        if (data.result.suggested_suppliers?.length) {
          reply += `\n\nSuggested suppliers: ${data.result.suggested_suppliers.map(s => s.name).join(', ')}`;
        }
      } else if (data.intent === 'stock_query') {
        reply = data.result.map(r => `${r.name}: ${r.current_qty} (reorder at ${r.reorder_level})`).join('\n') || 'No products found yet.';
      } else {
        reply = data.result;
      }
      setMessages((m) => [...m, { role: 'ai', text: reply }]);
    } catch (err) {
      const msg = err.response?.data?.error || 'Connection error — check the backend is running.';
      setMessages((m) => [...m, { role: 'ai', text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <div className="mb-3">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Sparkles size={20} className="text-cyan" /> AI Business Brain
        </h1>
        <p className="text-mute text-sm font-mono">Speak naturally — it handles the paperwork</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 pb-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan to-amber flex items-center justify-center shrink-0">
                <Bot size={14} className="text-base" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line ${
              m.role === 'user' ? 'bg-cyan text-base font-medium' : 'bg-panel border border-line'
            }`}>
              {m.text}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-panel border border-line flex items-center justify-center shrink-0">
                <User size={14} className="text-mute" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan to-amber flex items-center justify-center shrink-0">
              <Bot size={14} className="text-base" />
            </div>
            <div className="bg-panel border border-line rounded-2xl px-3.5 py-2.5 text-sm text-mute font-mono">
              thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="text-xs font-mono px-3 py-1.5 rounded-full bg-panel border border-line text-mute hover:border-cyan hover:text-cyan transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Type a command or question…"
          className="flex-1 bg-panel border border-line rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-cyan transition-colors"
        />
        <button type="submit" disabled={loading} className="bg-cyan text-base rounded-xl px-4 flex items-center justify-center hover:shadow-glow transition-shadow disabled:opacity-60">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
