
import { HeroImage, Category, Album, Image } from '@/types';

// Mock Hero Images
export const heroImages: HeroImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc',
    alt: 'Wedding couple on beach',
    order: 1,
    page: 'home',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
    alt: 'Wedding decorations',
    order: 2,
    page: 'home',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1464699827955-33e33e88a628',
    alt: 'Wedding rings',
    order: 3,
    page: 'home',
  },
];

// Mock Categories
export const categories: Category[] = [
  {
    id: '1',
    name: 'Wedding',
    slug: 'wedding',
    description: 'Beautiful moments from the wedding ceremony',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74',
    order: 1,
    albums: [],
  },
  {
    id: '2',
    name: 'Pre-wedding',
    slug: 'pre-wedding',
    description: 'Engagement and pre-wedding shoots',
    thumbnailUrl: 'https://images.unsplash.com/photo-1525328437458-0c4d4db7cab4',
    order: 2,
    albums: [],
  },
  {
    id: '3',
    name: 'Haldi',
    slug: 'haldi',
    description: 'Traditional Haldi ceremony',
    thumbnailUrl: 'https://images.unsplash.com/photo-1630653447777-98d86be6c567',
    order: 3,
    albums: [],
  },
  {
    id: '4',
    name: 'Mehndi',
    slug: 'mehndi',
    description: 'Beautiful Mehndi ceremony',
    thumbnailUrl: 'https://images.unsplash.com/photo-1594480464691-4a46e27fcc47',
    order: 4,
    albums: [],
  },
  {
    id: '5',
    name: 'Portraits',
    slug: 'portraits',
    description: 'Stunning portrait shots',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde',
    order: 5,
    albums: [],
  },
];

// Mock Albums
export const albums: Album[] = [
  {
    id: '1',
    name: 'Wedding Ceremony',
    slug: 'wedding-ceremony',
    description: 'The beautiful wedding ceremony',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74',
    categoryId: '1',
    order: 1,
    images: [],
  },
  {
    id: '2',
    name: 'Wedding Reception',
    slug: 'wedding-reception',
    description: 'Fun moments from the reception',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
    categoryId: '1',
    order: 2,
    images: [],
  },
  {
    id: '3',
    name: 'Engagement Shoot',
    slug: 'engagement-shoot',
    description: 'Pre-wedding engagement photoshoot',
    thumbnailUrl: 'https://images.unsplash.com/photo-1525328437458-0c4d4db7cab4',
    categoryId: '2',
    order: 1,
    images: [],
  },
  {
    id: '4',
    name: 'Haldi Ceremony',
    slug: 'haldi-ceremony',
    description: 'Joyful Haldi ceremony',
    thumbnailUrl: 'https://images.unsplash.com/photo-1630653447777-98d86be6c567',
    categoryId: '3',
    order: 1,
    images: [],
  },
  {
    id: '5',
    name: 'Mehndi Night',
    slug: 'mehndi-night',
    description: 'Beautiful Mehndi celebrations',
    thumbnailUrl: 'https://images.unsplash.com/photo-1594480464691-4a46e27fcc47',
    categoryId: '4',
    order: 1,
    images: [],
  },
];

// Mock Images
export const images: Image[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74',
    alt: 'Wedding ceremony image 1',
    albumId: '1',
    order: 1,
    thumbnailUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=200',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc',
    alt: 'Wedding ceremony image 2',
    albumId: '1',
    order: 2,
    thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
    alt: 'Wedding reception image 1',
    albumId: '2',
    order: 1,
    thumbnailUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1525328437458-0c4d4db7cab4',
    alt: 'Engagement shoot image 1',
    albumId: '3',
    order: 1,
    thumbnailUrl: 'https://images.unsplash.com/photo-1525328437458-0c4d4db7cab4?w=200',
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1630653447777-98d86be6c567',
    alt: 'Haldi ceremony image 1',
    albumId: '4',
    order: 1,
    thumbnailUrl: 'https://images.unsplash.com/photo-1630653447777-98d86be6c567?w=200',
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1594480464691-4a46e27fcc47',
    alt: 'Mehndi night image 1',
    albumId: '5',
    order: 1,
    thumbnailUrl: 'https://images.unsplash.com/photo-1594480464691-4a46e27fcc47?w=200',
  },
];

// Combine data for easier access
export const getInitialData = () => {
  // Deep copy to avoid mutations
  const categoriesWithAlbums = JSON.parse(JSON.stringify(categories));
  const albumsWithImages = JSON.parse(JSON.stringify(albums));
  
  // Add images to albums
  albumsWithImages.forEach(album => {
    album.images = images.filter(image => image.albumId === album.id);
  });
  
  // Add albums to categories
  categoriesWithAlbums.forEach(category => {
    category.albums = albumsWithImages.filter(album => album.categoryId === category.id);
  });
  
  return {
    heroImages,
    categories: categoriesWithAlbums,
    albums: albumsWithImages,
    images
  };
};
