
// src/types/index.ts
import type { PortableTextBlock } from '@portabletext/react';

export interface SanityFlavour {
  _id: string;
  name: string;
  imageUrl: string;
  price?: number;
}

export interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string };
  mrp?: number;
  discountedPrice?: number;
  images?: string[];
  weight?: string;
  packageType?: string;
  composition?: string;
  description?: PortableTextBlock[];
  ingredients?: PortableTextBlock[];
  allergenAlert?: PortableTextBlock[];
  availableFlavours?: SanityFlavour[];
  bestFor?: PortableTextBlock[];
  tags?: string[];
  filterOptions?: {
    title: string;
    category: string;
  }[];
  numberOfChocolates?: number;
  isOutOfStock?: boolean;
}

export interface StructuredFilter {
  _id: string;
  title: string;
  icon?: string | null;
  options: {
    _id: string;
    title: string;
  }[];
}

export type OrderItem = {
  name: string;
  quantity: number;
  slug?: { current: string };
  flavours?: { name: string, price: number }[];
  mrp?: number;
  finalProductPrice?: number;
  finalSubtotal?: number;
  coverImage?: string;
  numberOfChocolates?: number;
};

export interface WishlistItem {
  _id: string;
  name: string;
  slug: { current: string };
  coverImage?: string;
  subtitle: string;
  discountedPrice?: number;
  isOutOfStock?: boolean;
}

export interface Order {
  id: string;
  customOrderId: string;
  uid: string;
  date: string;
  items: OrderItem[];
  status: 'Order Requested' | 'In Progress' | 'Order Delivered' | 'Order Cancelled';
  total: number;
  totalDiscount?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  cancelledBy?: 'user' | 'admin';
  rating?: number;
  feedback?: string;
  cancellationReason?: string;
}

export type ActiveView = 
  | 'home' 
  | 'search' 
  | 'cart' 
  | 'account' 
  | 'about' 
  | 'faq' 
  | 'order-confirmed' 
  | 'product-detail' 
  | 'admin'
  | 'admin-analytics';

