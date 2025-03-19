export interface FirestoreGame {
  id: string;
  name: string;
  price: number | string;
  discount?: number | string;
}

export interface TransformedGame {
  id: number | string;
  title: string;
  tag: string;
  img: string;
  price: number;
  discountedPrice: number;
  discount: number | null;
}

export interface RAWGGameResult {
  id: number;
  name: string;
  background_image: string;
  // Add other RAWG API properties as needed
}

export interface RAWGSearchResponse {
  results: RAWGGameResult[];
}