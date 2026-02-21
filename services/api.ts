import { Product } from '@/types/product';

const API_BASE_URL = 'https://fakestoreapi.com';

export const apiService = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  async getProductById(id: number): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/category/${category}`);
      if (!response.ok) throw new Error('Failed to fetch products by category');
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};
