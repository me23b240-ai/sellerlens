import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { askAI } from '@/lib/ai';
import { scoreListing, recommendPrice } from '@/lib/scoring';

export async function POST(req: NextRequest) {
  const { productId } = await req.json();

  const { data: product } = await db.from('products').select('*').eq('id', productId).single();
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const listingScore = scoreListing(product.original_title, product.description, product.attributes, product.category);

  const { data: marketData } = await db.from('marketplace_data').select('price').eq('category', product.category);
  const pricing = recommendPrice((marketData || []).map(d => d.price), product.price);

  const { data: trends } = await db.from('category_trends').select('*').eq('category', product.category).limit(3);

  const diagnosis = await askAI<{ summary: string; rootCauses: string[]; actions: string[] }>(`
You are explaining to a small shop owner why their product isn't selling well. They may not know business or marketing words.
Use simple, everyday English. Short sentences. Explain things the way you'd explain them to a friend, not a report.

Product: ${product.original_title}
Listing quality score: ${listingScore}/100
Current price: ₹${product.price} | Market average: ₹${pricing.avgPrice} | Recommended: ₹${pricing.recommendedPrice}
Category trends: ${JSON.stringify(trends)}

Return ONLY JSON: { "summary": "2-3 short, simple sentences explaining the main problem", "rootCauses": ["2-4 simple reasons, each one short sentence"], "actions": ["3-4 things to do, each starting with High/Medium/Low, written as a simple instruction, like 'High: Add 3-4 clear photos of the product'"] }
  `);

  return NextResponse.json({ listingScore, pricing, ...diagnosis });
}