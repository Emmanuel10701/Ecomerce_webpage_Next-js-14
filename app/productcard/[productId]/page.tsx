'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchProductById, fetchRelatedProducts } from '../../../libs/api'; // Adjust import path accordingly

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  description?: string;
  reviews?: { rating: number; comment: string }[];
  category?: string;
}

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id === 'string') { // Check if id is a string
      const loadProduct = async () => {
        setLoading(true);
        try {
          const productId = parseInt(id, 10); // Convert id to a number
          const fetchedProduct = await fetchProductById(productId);

          if (!fetchedProduct) {
            setError('Product not found.');
            setLoading(false);
            return;
          }

          setProduct(fetchedProduct);

          // Fetch related products if category exists
          if (fetchedProduct.category) {
            const related = await fetchRelatedProducts(fetchedProduct.category);
            setRelatedProducts(related);
          }
        } catch (error) {
          console.error('Failed to fetch product details:', error);
          setError('Failed to load product details.');
        } finally {
          setLoading(false);
        }
      };

      loadProduct();
    } else {
      setError('Invalid product ID.');
      setLoading(false);
    }
  }, [id]);

  const handleNavigate = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{product.title}</h1>
      <img src={product.image} alt={product.title} className="w-full h-auto my-4" />
      <p className="text-lg font-semibold">${product.price}</p>
      <p className="my-4">{product.description || 'No description available.'}</p>

      <h2 className="text-xl font-semibold">Reviews</h2>
      {product.reviews && product.reviews.length > 0 ? (
        <ul>
          {product.reviews.map((review, index) => (
            <li key={index} className="my-2">
              <p className="font-semibold">Rating: {review.rating} ★</p>
              <p>{review.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No reviews available.</p>
      )}

      <h2 className="text-xl font-semibold mt-6">Related Products</h2>
      <div className="flex flex-wrap gap-4">
        {relatedProducts.map(relatedProduct => (
          <div key={relatedProduct.id} className="border p-4 rounded">
            <img src={relatedProduct.image} alt={relatedProduct.title} className="w-full h-auto mb-2" />
            <h3 className="text-lg font-semibold">{relatedProduct.title}</h3>
            <p>${relatedProduct.price}</p>
            <span
              onClick={() => handleNavigate(relatedProduct.id)}
              className="mt-2 cursor-pointer bg-blue-500 text-white px-4 py-2 rounded"
            >
              View Details
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetailPage;
