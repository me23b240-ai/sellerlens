'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, Loader2, ArrowDown, ArrowUp, Check } from 'lucide-react';
import { Shell, PageHeader, Card, Button, EmptyState, EASE_OUT } from '@/components/ui';

export default function PricingPage() {
  const [category, setCategory] = useState("Women's Ethnic Wear");
  const [price, setPrice] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    setLoading(true);
    const res = await fetch('/api/pricing', { method: 'POST', body: JSON.stringify({ category, currentPrice: Number(price) }) });
    setResult(await res.json());
    setLoading(false);
  }

  const hasMarketData = result?.avgPrice != null && result?.recommendedPrice != null;
  const positionPct = hasMarketData
    ? Math.min(100, Math.max(0, ((result.currentPrice - result.avgPrice * 0.5) / (result.avgPrice * 1.0)) * 100))
    : 50;
  const diff = hasMarketData ? result.currentPrice - result.avgPrice : 0;

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <PageHeader
          eyebrow="Check My Price"
          title="Is your price right?"
          description="Compare your price with other sellers."
          icon={IndianRupee}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 sm:items-end">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-stone-700">Category</span>
              <select className="input" value={category} onChange={e => { setCategory(e.target.value); setResult(null); }}>
                <option>Women's Ethnic Wear</option>
                <option>Men's Casual Wear</option>
                <option>Footwear</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-stone-700">Your price (₹)</span>
              <input type="number" className="input" value={price} onChange={e => { setPrice(e.target.value); setResult(null); }} />
            </label>
            <Button onClick={check} disabled={loading || !price}>
              <span className="inline-flex items-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Checking…' : 'Check price'}
              </span>
            </Button>
          </div>
        </Card>
      </motion.div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-200 bg-white/60 py-20"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}>
                <IndianRupee size={26} className="text-indigo-400" />
              </motion.div>
              <p className="text-sm text-stone-500">Checking prices…</p>
            </motion.div>
          )}

          {!loading && !result && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState
                icon={IndianRupee}
                title="Nothing to show yet"
                description="Pick a category and enter your price to see how you compare."
              />
            </motion.div>
          )}

          {!loading && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Card>
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <Stat label="Your price" value={result.currentPrice != null ? `₹${result.currentPrice.toLocaleString('en-IN')}` : '—'} />
                    <Stat label="Average price" value={result.avgPrice != null ? `₹${result.avgPrice.toLocaleString('en-IN')}` : 'No data'} />
                    <Stat label="Best price" value={result.recommendedPrice != null ? `₹${result.recommendedPrice.toLocaleString('en-IN')}` : 'No data'} highlight />
                  </div>

                  {hasMarketData ? (
                    <div>
                      <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                        <span>Lower</span>
                        <span>Higher</span>
                      </div>
                      <div className="relative h-2 rounded-full bg-stone-100">
                        <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-stone-300" />
                        <motion.div
                          initial={{ left: '50%' }}
                          animate={{ left: `${positionPct}%` }}
                          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.2 }}
                          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-indigo-600 shadow-md"
                        />
                      </div>
                      <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
                        {diff > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-600"><ArrowUp size={12} />₹{Math.abs(diff).toLocaleString('en-IN')} higher than others</span>
                        ) : diff < 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600"><ArrowDown size={12} />₹{Math.abs(diff).toLocaleString('en-IN')} lower than others</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-stone-500"><Check size={12} />Same as others</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-stone-500 bg-stone-50 rounded-xl p-4">
                      We don't have enough information for this category yet.
                    </p>
                  )}

                  <p className="text-sm leading-relaxed text-stone-600 bg-indigo-50/70 rounded-xl p-4">{result.reason}</p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Shell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-stone-500">{label}</p>
      <p className={`font-mono text-lg font-semibold mt-1 ${highlight ? 'text-indigo-600' : 'text-stone-900'}`}>{value}</p>
    </div>
  );
}