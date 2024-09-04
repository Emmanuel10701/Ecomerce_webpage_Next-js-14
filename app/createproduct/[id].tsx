"use client";

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Define types for categories and keywords
type Category = 'Electronics' | 'Clothing' | 'Groceries' | 'Home & Kitchen';
type Keyword = 'Expensive' | 'On Sale' | 'New Arrival';

interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  description: string;
  image: string;
  keywords: Keyword[];
}

// Predefined product data
const allProducts: Product[] = [
  { id: 1, name: 'Smartphone', category: 'Electronics', price: 499, description: 'Latest model smartphone', image: 'https://via.placeholder.com/800x400?text=Smartphone', keywords: ['Expensive'] },
  { id: 2, name: 'T-Shirt', category: 'Clothing', price: 19, description: 'Comfortable cotton t-shirt', image: 'https://via.placeholder.com/800x400?text=T-Shirt', keywords: ['On Sale'] },
  { id: 3, name: 'Blender', category: 'Home & Kitchen', price: 89, description: 'High-speed blender for smoothies', image: 'https://via.placeholder.com/800x400?text=Blender', keywords: ['New Arrival'] },
  { id: 4, name: 'Groceries Bundle', category: 'Groceries', price: 25, description: 'Weekly groceries bundle', image: 'https://via.placeholder.com/800x400?text=Groceries+Bundle', keywords: [] },
];

const ProductDetail = () => {
  const router = useRouter();
  const { id } = router.query; // Extract the ID from the route parameters
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const productId = parseInt(id as string, 10);
      const foundProduct = allProducts.find(product => product.id === productId);
      
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        setError('Product not found');
      }
      
      setLoading(false);
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className="max-w-screen-lg mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-auto mb-4 rounded-lg shadow-md object-cover"
      />
      <p className="text-lg mb-4">{product.description}</p>
      <p className="text-xl font-bold mb-4">${product.price}</p>
      <button
        onClick={() => alert('Add to Cart functionality not implemented')}
        className="bg-blue-500 text-white px-6 py-3 rounded shadow-md hover:bg-blue-600 transition"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductDetail;
