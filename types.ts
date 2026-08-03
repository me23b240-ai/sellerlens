export interface ListingInput {
    productId?: string;
    productName: string;
    category: string;
    currentTitle: string;
    description: string;
    price: number;
    attributes: Record<string, string>;
  }
  
  export interface ListingOutput {
    title: string;
    description: string;
    keywords: string[];
    tags: string[];
  }