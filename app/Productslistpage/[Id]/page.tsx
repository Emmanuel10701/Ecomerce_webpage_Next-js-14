'use client'; // Ensure this is a Client Component

import React, { useState, useEffect } from 'react';
import { FaCartPlus, FaCartArrowDown, FaArrowLeft, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useCart } from '../../../context/page'; // Adjust the path if needed
import StarRating from '../../../components/star/page'; // Import the StarRating component
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Updated import
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress

interface Product {
  id: string; // ID as a string
  title: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  description?: string;
  rating?: number;
  category?: string;
}

interface CartAction {
  type: 'ADD_TO_CART' | 'REMOVE_FROM_CART';
  payload: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  };
}

const ProductPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const productId = params.id; // Use string directly
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInCart, setIsInCart] = useState<boolean>(false);
  const [isReadMore, setIsReadMore] = useState<boolean>(false);
  const { state, dispatch } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/actions/products/${productId}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data: Product = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const itemInCart = state.items.some(item => item.id === productId);
    setIsInCart(itemInCart);
  }, [state.items, productId]);

  const handleAddToCart = () => {
    if (isInCart) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: { id: productId } });
      setIsInCart(false);
    } else {
      if (product) {
        dispatch({
          type: 'ADD_TO_CART',
          payload: {
            id: productId,
            name: product.title,
            price: product.price,
            quantity: 1,
            imageUrl: product.imageUrl || '/default-image.jpg', // Provide a fallback
          } as CartAction['payload'], // Explicitly cast to CartAction['payload']
        });
        setIsInCart(true);
      }
    }
  };

  const handleCardClick = () => {
    router.push(`/Productslistpage/${productId}`);
  };

  const handleSocialLink = (url: string) => {
    router.push(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <CircularProgress size={60} color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{error}</p>
      </div>
    );
  }

  if (!product) {
    return null; // Fallback in case product is still null
  }

  const discountPercentage = product.oldPrice ? ((product.oldPrice - product.price) / product.oldPrice * 100).toFixed(0) : '';
  const descriptionSnippet = product.description?.split(' ').slice(0, 10).join(' ') + '...';
  const fullDescription = product.description || '';

  return (
    <div className="container mx-auto p-4 mt-14 mx-4">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 bg-slate-300 rounded-full px-2 py-1"
        >
          <FaArrowLeft size={18} />
          <span className="ml-2 text-sm">Back</span>
        </button>
      </div>

      {/* Product Details */}
      <div className="flex flex-col md:flex-row">
        {/* Product Image */}
        <div className="w-full md:w-2/4 flex flex-col items-start">
          <div className="relative w-full flex flex-col justify-center mb-4">
            <Image
              src={product.imageUrl || '/placeholder.jpg'}
              alt={product.title}
              width={600}
              height={600}
              layout="responsive"
              className="w-full h-auto rounded-xl"
            />
            {product.rating && (
              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-xl">
                -{discountPercentage}%
              </div>
            )}
          </div>

          {/* Related Products */}
          {/* Fetch related products or display static related products if needed */}
        </div>

        {/* Product Information */}
        <div className="w-full md:w-2/4 flex flex-col p-4">
          <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
          <div className="flex items-center mb-4">
            <span className="text-xl font-semibold mr-2">${product.price.toFixed(2)}</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-500 line-through">${product.oldPrice.toFixed(2)}</span>
            )}
          </div>
          {product.rating && (
            <div className="mb-4">
              <StarRating rating={product.rating} />
            </div>
          )}
          <p className="mb-4">
            {isReadMore ? fullDescription : descriptionSnippet}
            {product.description && descriptionSnippet !== fullDescription && (
              <button
                onClick={() => setIsReadMore(!isReadMore)}
                className="text-blue-600 hover:underline"
              >
                {isReadMore ? 'Read less' : 'Read more'}
              </button>
            )}
          </p>
          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center py-2 px-4 rounded-lg text-white transition-colors ${
              isInCart ? 'bg-red-600' : 'bg-green-600'
            }`}
          >
            {isInCart ? (
              <>
                <FaCartArrowDown size={16} className="mr-2" />
                Remove from Cart
              </>
            ) : (
              <>
                <FaCartPlus size={16} className="mr-2" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="flex space-x-4 mt-8">
        <a href={`https://facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="text-blue-600">
          <FaFacebook size={24} />
        </a>
        <a href={`https://twitter.com/intent/tweet?url=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="text-blue-400">
          <FaTwitter size={24} />
        </a>
        <a href={`https://instagram.com/share?url=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="text-pink-600">
          <FaInstagram size={24} />
        </a>
        <a href={`https://linkedin.com/shareArticle?url=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="text-blue-700">
          <FaLinkedin size={24} />
        </a>
      </div>
    </div>
  );
};

export default ProductPage;
