
export interface HeroImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  page: string; // Which page this hero image is for
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  order: number;
  albums: Album[];
}

export interface Album {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  categoryId: string;
  order: number;
  images: Image[];
}

export interface Image {
  id: string;
  url: string;
  alt?: string;
  albumId: string;
  order: number;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}
