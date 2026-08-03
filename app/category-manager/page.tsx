'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LayoutGrid, TrendingUp } from 'lucide-react';
import { db } from '@/lib/db';
import { Shell, PageHeader, Card, ThreadDivider, ScoreGauge, Badge } from '@/components/ui';

export default function CategoryManagerPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      db.from('category_trends').select('*').eq('category', "Women's Ethnic Wear"),
      db.from('products').select('*').eq('category', "Women's Ethnic Wear"),
    ]).then(([trendsRes, productsRes]) => {
      setTrends(trendsRes.data || []);
      setProducts(productsRes.data || []);
      setLoaded(true);
    });
  }, []);

  const scored = [...products].sort((a, b) => a.listing_score - b.listing_score);
  const seasonal = trends.find(t => t.season);

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <PageHeader
          eyebrow="Category Overview"
          title="Women's Ethnic Wear"
          description="How products in this category are doing overall."
          icon={LayoutGrid}
        />
      </motion.div>

      {seasonal && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="mb-6 border-amber-200/70 bg-gradient-to-r from-amber-50 via-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <TrendingUp size={17} />
              </span>
              <p className="text-sm text-stone-700">
                <span className="font-semibold text-stone-900">{seasonal.season} is coming up.</span> Stock up 25% more for this season.
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <Card>
          <p className="text-sm font-medium text-stone-600 mb-4">What people are searching for</p>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
                <XAxis dataKey="trend_name" tick={{ fontSize: 12, fill: '#78716c' }} axisLine={{ stroke: '#E7E5E4' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} unit="%" axisLine={false} tickLine={false} />
                <Bar dataKey="trend_percentage" fill="#4338CA" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-sm text-stone-400">Nothing to show yet.</p>
          )}
        </Card>
      </motion.div>

      <ThreadDivider label="Products that need attention" />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        {scored.length === 0 ? (
          <p className="py-12 text-center text-sm text-stone-400">No products in this category yet.</p>
        ) : (
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-xs font-medium uppercase tracking-wide text-stone-400">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {scored.map(p => (
                  <tr key={p.id} className="transition-colors hover:bg-stone-50/70">
                    <td className="px-5 py-4 font-medium text-stone-800">{p.name}</td>
                    <td className="px-5 py-4"><ScoreGauge score={p.listing_score} size={36} /></td>
                    <td className="px-5 py-4">
                      {p.listing_score < 50 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Needs work
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Doing fine
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </motion.div>
    </Shell>
  );
}