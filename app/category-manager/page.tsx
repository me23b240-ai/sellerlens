'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { db } from '@/lib/db';
import { scoreListing } from '@/lib/scoring';
import { Shell, Card, ThreadDivider, ScoreGauge } from '@/components/ui';

export default function CategoryManagerPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    db.from('category_trends').select('*').eq('category', "Women's Ethnic Wear").then(({ data }) => setTrends(data || []));
    db.from('products').select('*').eq('category', "Women's Ethnic Wear").then(({ data }) => setProducts(data || []));
  }, []);

  const scored = [...products].sort((a, b) => a.listing_score - b.listing_score);
  const seasonal = trends.find(t => t.season);

  return (
    <Shell>
      <h1 className="font-display text-2xl font-bold">Category Overview</h1>
      <p className="text-stone-500 mt-1">Women's Ethnic Wear — seller health across the category.</p>
      <ThreadDivider />

      {seasonal && (
        <Card className="bg-amber-50 border-amber-200 mb-6">
          <p className="text-sm">{seasonal.season} season approaching. Increase festive inventory by 25%.</p>
        </Card>
      )}

      <Card>
        <p className="text-sm font-medium text-stone-600 mb-4">Trending searches</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
            <XAxis dataKey="trend_name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit="%" />
            <Bar dataKey="trend_percentage" fill="#4338CA" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <h2 className="font-display font-semibold text-lg mt-8 mb-3">At-risk sellers</h2>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-left">
            <tr><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Score</th><th className="px-4 py-3 font-medium">Issue</th></tr>
          </thead>
          <tbody>
            {scored.map(p => (
              <tr key={p.id} className="border-t border-stone-100">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3"><ScoreGauge score={p.listing_score} size={36} /></td>
                <td className="px-4 py-3 text-stone-500">{p.listing_score < 50 ? 'Low listing quality' : 'Healthy'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}