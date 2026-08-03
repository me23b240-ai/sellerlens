'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Sparkles, IndianRupee, Stethoscope, LogOut, ChevronDown } from 'lucide-react';
import { db } from '@/lib/db';

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/optimizer', label: 'Optimizer', icon: Sparkles },
  { href: '/pricing', label: 'Pricing', icon: IndianRupee },
  { href: '/diagnostics', label: 'Diagnostics', icon: Stethoscope },
];

function BackgroundTexture() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-stone-50" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.045] mix-blend-multiply">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 0%, transparent 0%, rgba(68,64,60,0.03) 100%)' }}
      />
    </div>
  );
}

function ProfileMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    db.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function signOut() {
    await db.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const initial = email ? email.charAt(0).toUpperCase() : 'R';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-stone-100"
      >
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-amber-400 text-white text-xs font-semibold flex items-center justify-center">
          {initial}
        </div>
        <ChevronDown size={13} className={`text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg"
          >
            {email && (
              <div className="border-b border-stone-100 px-3.5 py-3">
                <p className="text-xs text-stone-400">Signed in as</p>
                <p className="truncate text-sm font-medium text-stone-800">{email}</p>
              </div>
            )}
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = nav.find(n => n.href === pathname);

  return (
    <div className="relative flex min-h-screen">
      <BackgroundTexture />

      <aside className="w-60 border-r border-stone-200 bg-white/90 backdrop-blur-sm px-4 py-6">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-600 to-amber-500" />
          <span className="font-display font-bold text-lg">SellerLens</span>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'text-indigo-700 bg-indigo-50 font-medium' : 'text-stone-600 hover:bg-stone-50'}`}>
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-indigo-600" />}
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-stone-200 bg-white/90 backdrop-blur-sm px-8 flex items-center justify-between shrink-0">
          <span className="text-sm text-stone-400">
            SellerLens <span className="mx-1">/</span> <span className="text-stone-700 font-medium">{current?.label ?? 'Dashboard'}</span>
          </span>
          <ProfileMenu />
        </header>
        <main className="flex-1 px-8 py-8 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

// ...rest of the file (EmptyState, Card, Button, Badge, MetricCard, CountUp, PageHeader, ScoreGauge) stays exactly as before, unchanged

export function EmptyState({ icon: Icon, title, description, action }: { icon: any; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl bg-white/40">
      <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
        <Icon size={22} className="text-indigo-500" />
      </div>
      <p className="font-medium text-stone-700">{title}</p>
      <p className="text-sm text-stone-500 mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Cursor-following spotlight glow. IMPORTANT: children are always wrapped in an inner
// "relative" div for the glow to layer correctly, which means layout classes (flex/grid)
// passed to Card's own className do nothing useful for arranging multiple children.
// If you need a row/grid of items inside a Card, wrap them in your own div first.
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  function handleMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={`group relative overflow-hidden bg-white border border-stone-200 rounded-2xl p-5 transition-shadow hover:shadow-lg hover:shadow-indigo-100 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(400px circle at ${pos.x}% ${pos.y}%, rgba(67,56,202,0.06), transparent 60%)` }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) {
  const styles = variant === 'primary'
    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
    : 'bg-stone-100 text-stone-700 hover:bg-stone-200';
  return (
    <motion.button
      {...(props as any)}
      whileTap={{ scale: 0.97 }}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium bg-stone-100 text-stone-600 px-2 py-1 rounded-full capitalize">{children}</span>;
}

export function MetricCard({ label, value, suffix = '', accent, icon: Icon }: { label: string; value: number; suffix?: string; accent?: boolean; icon?: any }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-stone-500">{label}</p>
          <p className={`font-mono text-xl font-semibold mt-1 ${accent ? 'text-emerald-600' : 'text-stone-900'}`}>
            <CountUp value={value} suffix={suffix} />
          </p>
        </div>
        {Icon && <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0"><Icon size={15} className="text-indigo-600" /></div>}
      </div>
    </Card>
  );
}

export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 600, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{display}{suffix}</>;
}

export function PageHeader({ eyebrow, title, description, icon: Icon }: { eyebrow: string; title: React.ReactNode; description: string; icon?: any }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase mb-2">{eyebrow}</p>
      <h1 className="font-display text-3xl font-bold text-stone-900 flex items-center gap-3">
        {Icon && <Icon size={26} className="text-indigo-600" />}
        {title}
      </h1>
      <p className="text-stone-500 mt-2">{description}</p>
      <div className="h-[3px] w-14 rounded-full bg-gradient-to-r from-amber-400 to-indigo-600 mt-4" />
    </div>
  );
}

export function ScoreGauge({ score, size = 56 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);
  useEffect(() => { const t = setTimeout(() => setProgress(score), 50); return () => clearTimeout(t); }, [score]);
  const offset = circumference - (progress / 100) * circumference;
  const color = score >= 75 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E7E5E4" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute font-mono font-semibold text-xs" style={{ color }}>{score}</span>
    </div>
  );
}

export function ThreadDivider({ label }: { label?: string }) {
  return (
    <div className="my-8 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-stone-200 via-stone-200 to-transparent" />
      {label && <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-stone-400">{label}</span>}
      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-amber-400" />
      <div className="h-px flex-1 bg-gradient-to-l from-stone-200 via-stone-200 to-transparent" />
    </div>
  );
}