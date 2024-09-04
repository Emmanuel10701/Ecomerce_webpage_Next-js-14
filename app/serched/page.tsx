// src/pages/search.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Define the types for the product and query
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string; // Include if your API provides an image field
}


const SearchPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Get the search term from query parameters
    const searchQuery = new URLSearchParams(window.location.search).get('query');
    if (searchQuery) {
      setSearchTerm(searchQuery);
      // Fetch the products and filter based on search term
      const fetchProducts = async () => {
        try {
          const response = await fetch('https://fakestoreapi.com/products');
          const data: Product[] = await response.json();
          const filtered = data.filter(product =>
            product.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setProducts(filtered);
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      };

      fetchProducts();
    }
  }, [searchTerm]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Results for: "{searchTerm}"</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.id} className="border p-4 rounded-lg shadow">
              <img src={product.image} alt={product.title} className="w-full h-40 object-cover mb-4" />
              <h2 className="text-xl font-semibold">{product.title}</h2>
              <p>{product.description}</p>
              <p className="text-lg font-bold">${product.price}</p>
            </div>
          ))
        ) : (
          <p>No products found</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
