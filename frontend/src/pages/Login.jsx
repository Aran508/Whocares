import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan to-amber flex items-center justify-center shadow-glow mb-4 pulse-ring">
            <Zap size={28} className="text-base" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-bold">ACIP</h1>
          <p className="text-mute text-sm font-mono mt-1">Power on your company's brain</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-panel border border-line rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-mono text-mute mb-1.5 uppercase tracking-wide">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-base border border-line rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan transition-colors"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-mute mb-1.5 uppercase tracking-wide">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-base border border-line rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-bad text-xs font-mono">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-cyan text-base font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 hover:shadow-glow transition-shadow disabled:opacity-60"
          >
            {loading ? 'Connecting…' : 'Power On'} <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-sm text-mute mt-5">
          New company?{' '}
          <Link to="/register" className="text-cyan font-medium">Register here</Link>
        </p>
      </div>
    </div>
  );
}
