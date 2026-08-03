const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Women's Ethnic Wear": ['cotton', 'ethnic', 'festive', 'kurta', 'printed', 'straight fit'],
  "Men's Casual Wear": ['cotton', 'casual', 'regular fit', 'shirt', 'denim', 'oversized'],
  "Footwear": ['sneakers', 'casual', 'comfortable', 'running', 'loafers', 'sole'],
};

export function scoreListing(title: string, description: string, attributes: Record<string, string>, category: string) {
  const titleWords = title.trim().split(/\s+/).filter(Boolean).length;
  const titleScore = titleWords >= 6 && titleWords <= 12 ? 30 : titleWords >= 3 ? 15 : 5;

  const keywords = CATEGORY_KEYWORDS[category] || [];
  const matched = keywords.filter(k => title.toLowerCase().includes(k)).length;
  const keywordScore = Math.min(30, matched * 8);

  const descWords = description.trim().split(/\s+/).filter(Boolean).length;
  const descScore = Math.min(25, Math.round((descWords / 40) * 25));

  const attrScore = Math.min(15, Object.keys(attributes || {}).length * 5);

  return titleScore + keywordScore + descScore + attrScore; // 0-100
}

export function recommendPrice(prices: number[], currentPrice: number) {
  if (prices.length === 0) {
    return {
      avgPrice: null,
      recommendedPrice: null,
      reason: 'Not enough market data in this category yet to make a recommendation.',
    };
  }

  const sorted = [...prices].sort((a, b) => a - b);
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const p25 = sorted[Math.floor(sorted.length * 0.25)];
  const p60 = sorted[Math.floor(sorted.length * 0.6)];

  return {
    avgPrice: Math.round(avg),
    recommendedPrice: Math.round((p25 + p60) / 2),
    reason: `Products between ₹${Math.round(p25)}-${Math.round(p60)} in this category have better competitiveness.`,
  };
}