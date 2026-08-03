'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PackagePlus, Loader2 } from 'lucide-react';
import { db } from '@/lib/db';
import { Shell, PageHeader, Card, Button } from '@/components/ui';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ category: "Women's Ethnic Wear", title: '', description: '', price: '', fabric: '' });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await db.from('products').insert({
      name: form.title,
      category: form.category,
      original_title: form.title,
      description: form.description,
      price: Number(form.price),
      attributes: { fabric: form.fabric },
      listing_score: 0,
      status: 'draft',
    });

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push('/');
  }

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <PageHeader
          eyebrow="Add Product"
          title="Add product"
          description="Fill in the basics. You can improve it later."
          icon={PackagePlus}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-md"
      >
        <Card>
          <div className="flex flex-col gap-4">
            <Field label="Title">
              <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Category">
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option>Women's Ethnic Wear</option>
                <option>Men's Casual Wear</option>
                <option>Footwear</option>
              </select>
            </Field>
            <Field label="Description">
              <textarea className="input h-20 resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Price (₹)">
              <input type="number" className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </Field>
            <Field label="Fabric">
              <input className="input" value={form.fabric} onChange={e => setForm({ ...form, fabric: e.target.value })} />
            </Field>
            <Button onClick={save} disabled={saving} className="mt-1">
              <span className="inline-flex items-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Saving…' : 'Add product'}
              </span>
            </Button>
          </div>
        </Card>
      </motion.div>
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