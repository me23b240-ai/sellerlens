import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db-admin';
import { recommendPrice } from '@/lib/scoring';

export async function POST(req: NextRequest) {
  const { category, currentPrice } = await req.json();

  const { data } = await db
    .from('marketplace_data')
    .select('price')
    .eq('category', category);

  const prices = (data || []).map(d => d.price);
  const result = recommendPrice(prices, currentPrice);

  return NextResponse.json({ currentPrice, ...result });
}