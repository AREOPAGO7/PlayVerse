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
  export interface NewGame {
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

  interface Screenshot {
    id: number;
    image: string;
}
export interface GameDetails {
    id: number;
    name: string;
    background_image: string;
    description_raw: string;
    released: string;
    rating: number;
    metacritic: number;
    genres: Array<{ name: string }>;
    platforms: Array<{ platform: { name: string } }>;
    screenshots: Screenshot[];
    developers: Array<{ name: string }>;
    publishers: Array<{ name: string }>;
    esrb_rating: { name: string };
    tags: Array<{ name: string }>;
    ratings: Array<{ title: string; percent: number }>;
    added_by_status: {
        playing: number;
        owned: number;
        beaten: number;
    };
}