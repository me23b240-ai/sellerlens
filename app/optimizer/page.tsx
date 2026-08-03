'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, Check } from 'lucide-react';
import { db } from '@/lib/db';
import { Shell, PageHeader, Card, ScoreGauge, Button, EmptyState } from '@/components/ui';

export default function OptimizerPage() {
  return (
    <Suspense fallback={null}>
      <OptimizerContent />
    </Suspense>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const chip = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

function OptimizerContent() {
  const router = useRouter();
  const productId = useSearchParams().get('id');

  const [form, setForm] = useState({ productName: '', category: "Women's Ethnic Wear", currentTitle: '', description: '', price: '', attributes: '{"fabric":"cotton"}' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    db.from('products').select('*').eq('id', productId).single().then(({ data }) => {
      if (!data) return;
      setForm({
        productName: data.name || '',
        category: data.category || "Women's Ethnic Wear",
        currentTitle: data.original_title || '',
        description: data.description || '',
        price: String(data.price ?? ''),
        attributes: JSON.stringify(data.attributes || {}),
      });
    });
  }, [productId]);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        body: JSON.stringify({ ...form, productId, price: Number(form.price), attributes: JSON.parse(form.attributes || '{}') }),
      });
      const raw = await res.text();
      if (!raw) throw new Error('Something went wrong. Please try again.');
      const data = JSON.parse(raw);
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setResult(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function accept() {
    if (!productId || !result) return;
    setAccepting(true);
    await db.from('products').update({
      name: result.after.title,
      original_title: result.after.title,
      description: result.after.description,
      listing_score: result.after.score,
      status: 'optimized',
    }).eq('id', productId);
    router.push('/');
  }

  const scoreDelta = result ? result.after.score - result.before.score : 0;

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <PageHeader
          eyebrow="Fix My Listing"
          title="Get more people to find your product"
          description="We rewrite your title and description so more buyers find you."
          icon={Sparkles}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card>
            <div className="flex flex-col gap-4">
              <Field label="Product name">
                <input className="input" value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} />
              </Field>
              <Field label="Category">
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option>Women's Ethnic Wear</option>
                  <option>Men's Casual Wear</option>
                  <option>Footwear</option>
                </select>
              </Field>
              <Field label="Current title">
                <input className="input" value={form.currentTitle} onChange={e => setForm({ ...form, currentTitle: e.target.value })} />
              </Field>
              <Field label="Description">
                <textarea className="input h-24 resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </Field>
              <Field label="Price (₹)">
                <input type="number" className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </Field>
              <Button onClick={generate} disabled={loading} className="mt-1">
                <span className="inline-flex items-center gap-2">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {loading ? 'Rewriting…' : 'Rewrite now'}
                </span>
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-200 bg-white/60 py-20"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles size={26} className="text-indigo-400" />
                </motion.div>
                <p className="text-sm text-stone-500">Rewriting…</p>
              </motion.div>
            )}

            {!loading && !result && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState
                  icon={Sparkles}
                  title="Nothing here yet"
                  description="Fill in your product details above, then tap Rewrite now."
                />
              </motion.div>
            )}

            {!loading && result && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <Card>
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-center gap-4 rounded-xl bg-stone-50/80 py-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <p className="text-xs font-medium text-stone-400">Before</p>
                        <ScoreGauge score={result.before.score} />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <ArrowRight size={16} className="text-stone-300" />
                        {scoreDelta !== 0 && (
                          <motion.span
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className={`text-[11px] font-semibold ${scoreDelta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                          >
                            {scoreDelta > 0 ? '+' : ''}{scoreDelta}
                          </motion.span>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <p className="text-xs font-medium text-stone-400">After</p>
                        <ScoreGauge score={result.after.score} />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-1.5">New title</p>
                      <p className="font-medium text-stone-900">{result.after.title}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-1.5">New description</p>
                      <p className="text-sm leading-relaxed text-stone-600">{result.after.description}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-2">Search words</p>
                      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-wrap gap-2">
                        {result.after.keywords.map((k: string) => (
                          <motion.span
                            key={k}
                            variants={chip}
                            className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full"
                          >
                            {k}
                          </motion.span>
                        ))}
                      </motion.div>
                    </div>

                    <Button variant="secondary" onClick={accept} disabled={accepting || !productId}>
                      <span className="inline-flex items-center gap-2">
                        {accepting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        {accepting ? 'Saving…' : 'Use this'}
                      </span>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-stone-700">{label}</span>
      {children}
    </label>
  );
}