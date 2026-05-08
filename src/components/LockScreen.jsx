import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Loader2, Zap, Star } from 'lucide-react';
import StarField from './StarField';
import { ACCESS_CODES } from '../config';

const MONTHLY_URL  = import.meta.env.VITE_LS_MONTHLY_URL  || '#';
const LIFETIME_URL = import.meta.env.VITE_LS_LIFETIME_URL || '#';
const SUPABASE_READY = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function LockScreen({ onUnlock }) {
  const [code, setCode]             = useState('');
  const [shake, setShake]           = useState(false);
  const [loading, setLoading]       = useState(false);
  const [showRocket, setShowRocket] = useState(false);
  const inputRef = useRef(null);

  const triggerShake = (msg) => {
    setShake(true);
    toast.error(msg, { icon: '🚫' });
    setTimeout(() => setShake(false), 600);
  };

  const handleUnlock = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    try {
      if (!SUPABASE_READY) {
        // Fallback: check hardcoded codes until Supabase is configured
        if (!ACCESS_CODES.includes(trimmed)) {
          triggerShake('Invalid access code');
          return;
        }
      } else {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('access_codes')
          .select('status, expires_at, plan_type')
          .eq('code', trimmed)
          .single();

        if (error || !data) {
          triggerShake('Invalid access code');
          return;
        }

        if (data.status !== 'active') {
          triggerShake(
            data.status === 'expired'
              ? 'Your subscription has expired — please renew to continue'
              : 'This access code is no longer valid'
          );
          return;
        }

        if (data.plan_type === 'monthly' && data.expires_at) {
          if (new Date(data.expires_at) < new Date()) {
            await supabase
              .from('access_codes')
              .update({ status: 'expired' })
              .eq('code', trimmed);
            triggerShake('Your subscription has expired — please renew to continue');
            return;
          }
        }
      }

      setShowRocket(true);
      localStorage.setItem('st_access', 'true');
      setTimeout(() => onUnlock(), 900);

    } catch {
      toast.error('Connection error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--space-black)' }}
    >
      <StarField />

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F5C842, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #22C55E, transparent)' }} />

      <motion.div
        className="relative z-10 w-full max-w-lg mx-4 flex flex-col gap-5"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Main card */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'var(--space-navy)',
            border: '1px solid var(--space-border)',
            boxShadow: '0 0 60px rgba(245,200,66,0.07), 0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          {/* Logo */}
          <motion.div
            className="mb-5 flex justify-center"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src="/Space_Trade_Logo.png"
              alt="Space Trades"
              style={{ maxWidth: 160, filter: 'drop-shadow(0 0 16px rgba(245,200,66,0.4))' }}
            />
          </motion.div>

          <h1 className="font-display font-black text-gold-primary tracking-widest text-xl uppercase mb-1">
            Space Trades
          </h1>
          <p className="font-body font-medium text-base mb-6" style={{ color: 'var(--star-white)' }}>
            Your Compounding Mission Control
          </p>

          {/* Code input */}
          <motion.div
            animate={shake ? { x: [-8, 8, -5, 5, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-3"
          >
            <input
              ref={inputRef}
              type="text"
              className="input-gold text-center tracking-widest uppercase text-sm"
              placeholder="ENTER ACCESS CODE"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              autoFocus
              disabled={loading || showRocket}
            />
          </motion.div>

          <button
            className="btn-gold w-full"
            onClick={handleUnlock}
            disabled={loading || showRocket}
          >
            {showRocket ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ y: [-2, -30], opacity: [1, 0] }}
                  transition={{ duration: 0.7 }}
                >🚀</motion.span>
                LAUNCHING...
              </span>
            ) : loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" /> VERIFYING...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                🔓 UNLOCK ACCESS
              </span>
            )}
          </button>

          <div className="mt-6 pt-5 border-t border-space-border">
            <p className="text-sm font-body font-medium" style={{ color: 'var(--muted-text)' }}>
              Already have a code? Enter it above.
            </p>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Monthly */}
          <a
            href={MONTHLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl p-5 transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--space-navy)',
              border: '1px solid rgba(34,197,94,0.35)',
              boxShadow: '0 0 20px rgba(34,197,94,0.06)',
              textDecoration: 'none',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <Zap size={15} style={{ color: '#22C55E' }} />
              </div>
              <span className="font-display font-black text-xs tracking-widest uppercase" style={{ color: '#22C55E' }}>
                Monthly
              </span>
            </div>
            <div className="mb-3">
              <span className="font-display font-black text-3xl text-primary">$15</span>
              <span className="font-body text-sm ml-1" style={{ color: 'var(--muted-text)' }}>/month</span>
            </div>
            <ul className="flex flex-col gap-1.5 mb-4">
              {['Full tool access', 'Cancel anytime', 'Access code emailed instantly'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm font-body font-medium" style={{ color: 'var(--star-white)' }}>
                  <span style={{ color: '#22C55E' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <div
              className="w-full py-2 rounded-xl text-center font-display font-bold text-sm tracking-wider"
              style={{ background: '#22C55E', color: '#000' }}
            >
              Get Monthly Access
            </div>
          </a>

          {/* Lifetime */}
          <a
            href={LIFETIME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl p-5 transition-all hover:scale-[1.02] relative overflow-hidden"
            style={{
              background: 'var(--space-navy)',
              border: '1px solid rgba(245,166,35,0.45)',
              boxShadow: '0 0 24px rgba(245,166,35,0.10)',
              textDecoration: 'none',
            }}
          >
            {/* Best value badge */}
            <div
              className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-display font-black tracking-widest uppercase"
              style={{ background: 'rgba(245,166,35,0.2)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.4)' }}
            >
              Best Value
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)' }}>
                <Star size={15} style={{ color: '#F5A623' }} />
              </div>
              <span className="font-display font-black text-xs tracking-widest uppercase" style={{ color: '#F5A623' }}>
                Lifetime
              </span>
            </div>
            <div className="mb-3">
              <span className="font-display font-black text-3xl text-primary">$197</span>
              <span className="font-body text-sm ml-1" style={{ color: 'var(--muted-text)' }}>one-time</span>
            </div>
            <ul className="flex flex-col gap-1.5 mb-4">
              {['Full tool access forever', 'All future updates', 'Access code emailed instantly'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm font-body font-medium" style={{ color: 'var(--star-white)' }}>
                  <span style={{ color: '#F5A623' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <div
              className="w-full py-2 rounded-xl text-center font-display font-bold text-sm tracking-wider"
              style={{ background: '#F5A623', color: '#000' }}
            >
              Get Lifetime Access
            </div>
          </a>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs font-body" style={{ color: '#71717A' }}>
          For educational purposes only · Not financial advice · Trading crypto involves significant risk of loss
        </p>
      </motion.div>
    </div>
  );
}
