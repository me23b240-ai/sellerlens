import { NextRequest, NextResponse } from 'next/server';
import { askAI } from '@/lib/ai';
import { scoreListing } from '@/lib/scoring';
import { dbAdmin } from '@/lib/db-admin';
import type { ListingInput, ListingOutput } from '@/types';

export async function POST(req: NextRequest) {
  const body: ListingInput = await req.json();
  const beforeScore = scoreListing(body.currentTitle, body.description, body.attributes, body.category);

  const ai = await askAI<ListingOutput>(`
You are helping a small shop owner in a small Indian town write a better product listing.
Use simple, everyday English. Short sentences. No fancy or business words. Write the way a helpful shopkeeper would describe the product to a customer standing in front of them.

Category: ${body.category}
Current title: ${body.currentTitle}
Current description: ${body.description}
Attributes: ${JSON.stringify(body.attributes)}

Return ONLY JSON: { "title": "6-12 simple words with the category and material in it", "description": "40-70 words, simple everyday language, describe the product like you're talking to a customer", "keywords": ["5-8 simple search words people would actually type"], "tags": ["3-5 simple tags"] }
  `);

  const afterScore = scoreListing(ai.title, ai.description, body.attributes, body.category);

  let product = null;
  if (body.productId) {
    const { data } = await dbAdmin
      .from('products')
      .update({ listing_score: afterScore, status: 'optimized' })
      .eq('id', body.productId)
      .select()
      .single();
    product = data;

    await dbAdmin.from('ai_recommendations').insert({
      product_id: body.productId,
      type: 'listing',
      input: body,
      output: { ...ai, beforeScore, afterScore },
    });
  }

  return NextResponse.json({
    before: { ...body, score: beforeScore },
    after: { ...ai, score: afterScore },
    product,
  });
}