'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, ChevronDown, Loader2, AlertCircle, CheckCircle2, IndianRupee } from 'lucide-react';
import { db } from '@/lib/db';
import { Shell, PageHeader, Card, Button, EmptyState, ScoreGauge } from '@/components/ui';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export default function DiagnosticsPage() {
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { db.from('products').select('id, name').then(({ data }) => setProducts(data || [])); }, []);

  async function diagnose() {
    setLoading(true);
    const res = await fetch('/api/diagnose', { method: 'POST', body: JSON.stringify({ productId: selected }) });
    setResult(await res.json());
    setLoading(false);
  }

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <PageHeader
          eyebrow="Why Not Selling"
          title="Why isn't this selling?"
          description="Find out what's wrong and how to fix it."
          icon={Stethoscope}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 sm:items-end">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-stone-700">Product</span>
              <div className="relative">
                <select
                  className="input appearance-none pr-9 w-full"
                  value={selected}
                  onChange={e => { setSelected(e.target.value); setResult(null); }}
                >
                  <option value="">Pick a product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
            </label>
            <Button onClick={diagnose} disabled={!selected || loading}>
              <span className="inline-flex items-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Checking…' : 'Check now'}
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
                <Stethoscope size={26} className="text-indigo-400" />
              </motion.div>
              <p className="text-sm text-stone-500">Checking your listing…</p>
            </motion.div>
          )}

          {!loading && !result && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState
                icon={Stethoscope}
                title="Nothing to show yet"
                description="Pick a product above and tap Check now."
              />
            </motion.div>
          )}

          {!loading && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <Card className="lg:col-span-2">
                <p className="text-sm leading-relaxed text-stone-600">{result.summary}</p>

                <h3 className="font-display font-semibold mt-6 mb-3 flex items-center gap-2 text-stone-900">
                  <AlertCircle size={16} className="text-amber-500" />
                  What's wrong
                </h3>
                <motion.ul variants={container} initial="hidden" animate="show" className="space-y-2">
                  {result.rootCauses.map((c: string, i: number) => (
                    <motion.li key={i} variants={item} className="flex items-start gap-2.5 text-sm text-stone-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      {c}
                    </motion.li>
                  ))}
                </motion.ul>

                <h3 className="font-display font-semibold mt-6 mb-3 flex items-center gap-2 text-stone-900">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  What to do
                </h3>
                <motion.ul variants={container} initial="hidden" animate="show" className="flex flex-col gap-2">
                  {result.actions.map((a: string, i: number) => (
                    <motion.li
                      key={i}
                      variants={item}
                      className="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50/80 px-4 py-3 text-sm text-stone-700 transition-colors hover:border-indigo-100 hover:bg-indigo-50/50"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-600">
                        {i + 1}
                      </span>
                      {a}
                    </motion.li>
                  ))}
                </motion.ul>
              </Card>

              <Card>
                <div className="flex flex-col items-center justify-center gap-1 text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Listing quality</p>
                  <div className="my-3">
                    <ScoreGauge score={result.listingScore} size={96} />
                  </div>
                  <div className="mt-5 w-full border-t border-stone-100 pt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Best price</p>
                    <p className="mt-1.5 inline-flex items-center justify-center gap-0.5 font-mono text-xl font-semibold text-indigo-600">
                      <IndianRupee size={16} />
                      {result.pricing.recommendedPrice ?? '—'}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Shell>
  );
}