import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ACCESS_CODES } from '../config';
import StarField from './StarField';

export default function LockScreen({ onUnlock }) {
  const [code, setCode] = useState('');
  const [shake, setShake] = useState(false);
  const [showRocket, setShowRocket] = useState(false);
  const inputRef = useRef(null);

  const handleUnlock = () => {
    const trimmed = code.trim().toUpperCase();
    if (ACCESS_CODES.includes(trimmed)) {
      setShowRocket(true);
      localStorage.setItem('st_access', 'true');
      setTimeout(() => onUnlock(), 900);
    } else {
      setShake(true);
      toast.error('Invalid access code', { icon: '🚫' });
      setTimeout(() => setShake(false), 600);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleUnlock();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden page-bg" style={{ backgroundColor: 'var(--space-black)' }}>
      <StarField />

      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F5C842, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />

      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="glass rounded-2xl p-10 text-center"
          style={{ boxShadow: '0 0 60px rgba(245,200,66,0.07), 0 25px 50px rgba(0,0,0,0.5)' }}>

          {/* Logo */}
          <motion.div
            className="mb-6 flex justify-center"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src="/Space_Trade_Logo.png"
              alt="Space Trades"
              style={{ maxWidth: 180, filter: 'drop-shadow(0 0 16px rgba(245,200,66,0.4))' }}
            />
          </motion.div>

          {/* Title */}
          <div className="mb-1">
            <h1 className="font-display font-bold text-gold-primary tracking-widest text-lg uppercase">
              Space Trades
            </h1>
          </div>
          <p className="font-body font-medium text-base mb-8 tracking-wide" style={{ color: '#D4D4D8' }}>
            Your Compounding Mission Control
          </p>

          {/* Input */}
          <motion.div
            animate={shake ? { x: [-8, 8, -5, 5, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4"
          >
            <input
              ref={inputRef}
              type="text"
              className="input-gold text-center tracking-widest uppercase text-sm"
              placeholder="ENTER ACCESS CODE"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </motion.div>

          {/* Unlock button */}
          <div className="relative">
            <button
              className="btn-gold w-full relative overflow-hidden"
              onClick={handleUnlock}
              disabled={showRocket}
            >
              {showRocket ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ y: [-2, -30], opacity: [1, 0] }}
                    transition={{ duration: 0.7 }}
                    className="text-base"
                  >
                    🚀
                  </motion.span>
                  LAUNCHING...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🔓 UNLOCK ACCESS
                </span>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-space-border">
            <p className="text-sm font-body font-medium leading-relaxed" style={{ color: '#D4D4D8' }}>
              For educational purposes only. Not financial advice.
              <br />
              Trading crypto involves significant risk of loss.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
