"use client";
import React, { useState, useEffect } from 'react';
import { FaCartPlus, FaCartArrowDown, FaArrowLeft, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import StarRating from '../../../components/star/page';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../context/page'; // Adjust the path if needed

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  description?: string;
  ratings?: number;
  category?: string;
}

const ProductPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const id = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCart, setIsInCart] = useState<string | null>(null);
  const [isReadMore, setIsReadMore] = useState<boolean>(false);
  const { state, dispatch } = useCart();
  const router = useRouter();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareUrl = encodeURIComponent(currentUrl);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/actions/products/${id}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data: Product = await response.json();
        setProduct(data);
      } catch (error: any) {
        setError(`Failed to load product: ${error.message}`);
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
      setIsInCart(false);
    } else {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          id,
          name,
          price,
          quantity: 1, // Assuming quantity is 1 for cart items
          imageUrl,
        },
      });
      setIsInCart(true);
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
        <p>{error}</p>
      </div>
    );
  }

  if (!product) return null;

  const discountPercentage = product.oldPrice
    ? ((product.oldPrice - product.price) / product.oldPrice * 100).toFixed(0)
    : '';
  const descriptionSnippet = product.description
    ? product.description.split(' ').slice(0, 10).join(' ') + '...'
    : '';
  const fullDescription = product.description || '';

  return (
    <div className="container mx-auto p-4 mt-14 relative">
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
        <div className="w-full md:w-2/4 flex flex-col items-center">
          <div className="relative w-full flex justify-center mb-4">
            <Image
              src={product.image || '/placeholder.jpg'}
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

        {/* Product Information */}
        <div className="w-full md:w-2/4 flex flex-col p-4">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center mb-4">
            <span className="text-xl font-semibold mr-2">${product.price.toFixed(2)}</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-500 line-through">${product.oldPrice.toFixed(2)}</span>
            )}
          </div>
          {product.ratings && (
            <div className="mb-4">
              <StarRating rating={product.ratings} />
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
        <a href={`https://facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600">
          <FaFacebook size={24} />
        </a>
        <a href={`https://twitter.com/intent/tweet?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-400">
          <FaTwitter size={24} />
        </a>
        <a href={`https://instagram.com/share?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="text-pink-600">
          <FaInstagram size={24} />
        </a>
        <a href={`https://linkedin.com/shareArticle?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-700">
          <FaLinkedin size={24} />
        </a>
      </div>
    </div>
  );
};

export default ProductPage;
