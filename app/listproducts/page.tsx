"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StarRating from '@/components/starRating/page'; // Adjust the import path as needed
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress from Material UI

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  ratings?: number;
  image?: string;
}

const DEFAULT_IMAGE = '/path/to/default-image.jpg'; // Replace with the path to your default image

const ListProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/actions/products'); // Adjust this path to match your API route
      setProducts(response.data);
    } catch (error: any) {
      console.error('Error fetching products:', error.response?.data || error.message || error);
      setError('Failed to fetch products. Please try again.');
      toast.error('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {loading ? (
        <div className="flex items-center justify-center w-full h-screen">
          <CircularProgress size={60} />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center w-full">
          <p className="text-red-600 text-xl">{error}</p>
        </div>
      ) : products.length > 0 ? (
        <div className="w-full max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">Product List</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-gray-100 rounded-lg shadow-sm overflow-hidden">
                <img
                  src={product.image || DEFAULT_IMAGE}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
                  <p className="text-gray-600 mt-1">{product.description}</p>
                  <div className="flex items-center mt-2">
                    <p className="text-xl font-bold text-blue-700">${product.price.toFixed(2)}</p>
                    {product.oldPrice && (
                      <p className="text-sm text-gray-500 ml-4 line-through">${product.oldPrice.toFixed(2)}</p>
                    )}
                  </div>
                  {product.ratings !== undefined && (
                    <div className="mt-2">
                      <StarRating rating={product.ratings} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <p className="text-gray-700 text-xl">No products available</p>
        </div>
      )}
      <ToastContainer />
    </section>
  );
};

export default ListProducts;
