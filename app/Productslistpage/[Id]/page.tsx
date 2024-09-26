"use client";
import React, { useState, useEffect } from 'react';
import { FaCartPlus, FaCartArrowDown, FaArrowLeft, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import StarRating from '../../../components/star/page';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../context/page';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  description?: string;
  ratings?: number;
  category?: string;
}

const ProductPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const { id } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isReadMore, setIsReadMore] = useState<boolean>(false);
  const { state, dispatch } = useCart();
  const router = useRouter();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/actions/products/${id}`, { method: 'GET' });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data: Product = await response.json();
        setProduct(data);

        // Fetch related products based on category
        const relatedResponse = await fetch(`/actions/products?category=${data.category}`, { method: 'GET' });
        const relatedData: Product[] = await relatedResponse.json();
        setRelatedProducts(relatedData.slice(0, 4)); // Limit to 4 items
      } catch (err: any) {
        setError(`Failed to load product: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const isInCart = state.items.some(item => item.id === id);

  const handleAddToCart = () => {
    if (isInCart) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
    } else if (product) {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl || '/placeholder.jpg', // Fallback image URL
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-t-blue-600 border-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!product) return null;

  const discountPercentage = product.oldPrice ? ((product.oldPrice - product.price) / product.oldPrice * 100).toFixed(0) : '';
  const descriptionSnippet = product.description?.split(' ').slice(0, 10).join(' ') + '...';
  const fullDescription = product.description || '';

  return (
    <div className="container mx-auto p-4 mt-14 relative">
      <div className="absolute top-4 left-4">
        <button onClick={() => router.back()} className="flex items-center text-blue-600 bg-slate-300 rounded-full px-2 py-1">
          <FaArrowLeft size={18} />
          <span className="ml-2 text-sm">Back</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-2/4 flex flex-col items-center">
          <div className="relative w-full flex justify-center mb-4">
            <Image
              src={product.imageUrl || '/placeholder.jpg'}
              alt={`Image of ${product.name}`}
              width={600}
              height={600}
              layout="responsive"
              className="rounded-xl"
            />
            {product.oldPrice && (
              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-xl">
                -{discountPercentage}%
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/4 flex flex-col p-4">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center mb-4">
            <span className="text-xl font-semibold mr-2">${product.price.toFixed(2)}</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-500 line-through">${product.oldPrice.toFixed(2)}</span>
            )}
          </div>
          <div className="flex space-x-4 mt-8">
        <Link href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600">
          <FaFacebook size={24} />
        </Link>
        <Link href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="text-blue-400">
          <FaTwitter size={24} />
        </Link>
        <Link href={`https://instagram.com/share?url=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="text-pink-600">
          <FaInstagram size={24} />
        </Link>
        <Link href={`https://linkedin.com/shareArticle?url=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="text-blue-700">
          <FaLinkedin size={24} />
        </Link>
      </div>
          {product.ratings && (
            <div className="mb-4">
              <StarRating rating={product.ratings} />
            </div>
          )}
          <p className="mb-4">
            {isReadMore ? fullDescription : descriptionSnippet}
            {product.description && (
              <button
                onClick={() => setIsReadMore(!isReadMore)}
                className={`text-blue-600 hover:underline ${isReadMore ? 'hidden md:inline' : 'inline'}`}
              >
                {isReadMore ? 'Read less' : 'Read more'}
              </button>
            )}
          </p>
          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center py-2 px-4 rounded-lg text-white transition-colors ${isInCart ? 'bg-red-600' : 'bg-green-600'}`}
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

    

      {/* Related Products Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Related Products</h2>
        <div className="flex space-x-4 overflow-x-auto">
          {relatedProducts.map((relatedProduct) => (
            <div key={relatedProduct.id} className="w-1/4 min-w-[150px] flex flex-col items-center">
              <Link href={`/Productslistpage/${relatedProduct.id}`}>
                <Image
                  src={relatedProduct.imageUrl || '/placeholder.jpg'}
                  alt={`Image of ${relatedProduct.name}`}
                  width={150}
                  height={150}
                  className="rounded-lg mb-2"
                />
                <h3 className="text-sm font-bold text-indigo-600">{relatedProduct.name}</h3>
                <span className="text-sm">${relatedProduct.price.toFixed(2)}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
