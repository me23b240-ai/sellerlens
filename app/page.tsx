'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Gauge, Zap, TrendingUp, ArrowUpRight, Sparkles, Stethoscope } from 'lucide-react';
import { db } from '@/lib/db';
import { Shell, PageHeader, Card, ScoreGauge, MetricCard, Badge, EmptyState, Button } from '@/components/ui';

interface Product { id: string; name: string; price: number; status: string; listing_score: number }

const AVATAR_THEMES = [
  'from-indigo-500 to-violet-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-sky-500 to-blue-500',
];

function themeFor(name: string) {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_THEMES[hash % AVATAR_THEMES.length];
}

function useCountUp(target: number, active: boolean) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const duration = 700;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, active]);

  return display;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function TopographicLayer() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <motion.svg
        className="absolute -left-1/4 top-0 h-full w-[150%] opacity-[0.035]"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        animate={{ x: [0, -40, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
      >
        {[120, 220, 320, 420, 520, 620, 720].map((y, i) => (
          <path
            key={y}
            d={`M -100 ${y} Q 200 ${y - 60} 400 ${y} T 900 ${y} T 1400 ${y} T 1900 ${y}`}
            fill="none"
            stroke={i % 2 === 0 ? '#4338ca' : '#78716c'}
            strokeWidth="1.5"
          />
        ))}
      </motion.svg>
    </div>
  );
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    db.from('products').select('*').then(({ data }) => {
      setProducts(data || []);
      setLoaded(true);
    });
  }, []);

  const productCount = useCountUp(products.length, loaded);
  const scoreValue = useCountUp(avgScore(products), loaded);
  const liveCount = useCountUp(products.filter(p => p.status === 'live').length, loaded);
  const salesValue = useCountUp(products.length > 0 ? 12 : 0, loaded);

  return (
    <div className="relative min-h-screen bg-stone-50">
      <TopographicLayer />

      <div className="relative">
        <Shell>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <PageHeader
              eyebrow="Home"
              title={
                <span className="inline-flex items-center gap-2">
                  Welcome back
                  <motion.span
                    className="inline-block origin-[70%_70%]"
                    animate={{ rotate: [0, 16, -8, 16, -4, 0] }}
                    transition={{ duration: 1.4, delay: 0.4, ease: 'easeInOut' }}
                  >
                    👋
                  </motion.span>
                </span>
              }
              description="Here's how your products are doing today"
            />
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate={loaded ? 'show' : 'hidden'}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div variants={item} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
              <MetricCard label="Products" value={productCount} icon={Package} />
            </motion.div>
            <motion.div variants={item} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
              <MetricCard label="Listing Quality" value={scoreValue} suffix="/100" icon={Gauge} />
            </motion.div>
            <motion.div variants={item} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
              <MetricCard label="Selling Now" value={liveCount} icon={Zap} />
            </motion.div>
            <motion.div variants={item} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
              <MetricCard label="Sales" value={salesValue} suffix="%" accent icon={TrendingUp} />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="mt-6 border-amber-200/70 bg-gradient-to-r from-amber-50 via-amber-50 to-orange-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300/60 opacity-75" />
                    <TrendingUp size={17} className="relative" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">Navratri season approaching</p>
                    <p className="mt-0.5 text-sm text-stone-500">Increase festive inventory by 25% to catch demand early.</p>
                  </div>
                </div>
                <Link
                  href="/pricing"
                  className="group inline-flex shrink-0 items-center gap-1 self-start text-sm font-medium text-amber-700 transition-colors hover:text-amber-800 sm:self-center"
                >
                  View insights
                  <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </Card>
          </motion.div>

          <div className="mt-10 mb-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <h2 className="font-display text-lg font-semibold text-stone-900">My products</h2>
              <AnimatePresence>
                {products.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-sm text-stone-400"
                  >
                    {products.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <Link href="/products/new" className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700">
              + Add product
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {products.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState
                  icon={Package}
                  title="No products yet"
                  description="Add your first product to get started"
                  action={<Link href="/products/new"><Button>+ Add product</Button></Link>}
                />
              </motion.div>
            ) : (
              <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="p-0 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-100 text-left text-xs font-medium uppercase tracking-wide text-stone-400">
                        <th className="px-5 py-3 font-medium">Product</th>
                        <th className="px-5 py-3 font-medium">Score</th>
                        <th className="px-5 py-3 font-medium">Price</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <motion.tbody variants={container} initial="hidden" animate="show" className="divide-y divide-stone-100">
                      {products.map(p => (
                        <motion.tr key={p.id} variants={item} className="group transition-colors hover:bg-stone-50/70">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${themeFor(p.name)} text-xs font-semibold text-white shadow-sm`}>
                                {p.name.charAt(0).toUpperCase()}
                              </span>
                              <span className="font-medium text-stone-800">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <ScoreGauge score={p.listing_score} size={36} />
                          </td>
                          <td className="px-5 py-4 font-mono text-stone-700">₹{p.price.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-4">
                            <Badge>{p.status}</Badge>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1 opacity-0 transition-all duration-200 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0">
                              <Link href={`/optimizer?id=${p.id}`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50">
                                <Sparkles size={12} />
                                Fix Listing
                              </Link>
                              <Link href={`/diagnostics?id=${p.id}`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-700">
                                <Stethoscope size={12} />
                                Why Not Selling?
                              </Link>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Shell>
      </div>
    </div>
  );
}

function avgScore(products: Product[]) {
  if (!products.length) return 0;
  return Math.round(products.reduce((sum, p) => sum + p.listing_score, 0) / products.length);
}