// src/types/product.types.ts

export interface Product {
  id:          string;
  name:        string;
  description: string;
  price:       number;
  stock:       number;
  images:      string[];
  categoryId:  string;
  rating:      number;
  createdAt:   string;
  updatedAt:   string;
}

export interface CreateProductDto {
  name:        string;
  description: string;
  price:       number;
  stock:       number;
  images:      string[];
  categoryId:  string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface Category {
  id:    string;
  name:  string;
  icon:  string;
}

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'Tout',             icon: 'grid-outline'         },
  { id: '1',   name: 'Gazon Artificiel', icon: 'leaf-outline'         },
  { id: '2',   name: 'Gazon Naturel',    icon: 'rose-outline'         },
  { id: '3',   name: 'Plantes',          icon: 'flower-outline'       },
  { id: '4',   name: 'Vases & Pots',     icon: 'color-palette-outline'},
  { id: '5',   name: 'Décoration',       icon: 'construct-outline'    },
];