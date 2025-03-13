export interface Game {
    id: number;
    title: string;
    subtitle?: string;
    new?: boolean;
    img: string;
    bannerDescription: string;
    status: string;
    price: string;
    banner: string;
  }
  
export interface DiscoverGame {
    id: number;
    title: string;
    tag: string;
    img: string;
    price: number;
    discount?: number;
  }
  
export interface RAWGGame {
    id: number;
    name: string;
    background_image: string;
    description_raw?: string;
    results?: RAWGGame[];
  }