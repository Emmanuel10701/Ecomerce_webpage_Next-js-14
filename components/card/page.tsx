'use client'; // Add this line to make sure this is a Client Component

import React from 'react';
import { FaCartPlus, FaCartArrowDown } from 'react-icons/fa';
import { useCart } from '../../context/page'; // Adjust the path if needed
import StarRating from '../star/page'; // Import the StarRating component
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Updated import

interface CardProps {
  id: number; // Changed from string to number
  title: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  description?: string;
  rating?: number;
}

const Card: React.FC<CardProps> = ({
  id,
  title,
  price,
  oldPrice,
  imageUrl = 'https://via.placeholder.com/150', // Default image
  description = 'No description available.',
  rating = 0,
}) => {
  const { state, dispatch } = useCart();
  const [isInCart, setIsInCart] = React.useState<boolean>(false);
  const router = useRouter(); // Use the new useRouter hook from next/navigation

  React.useEffect(() => {
    const itemInCart = state.items.some(item => item.id === id);
    setIsInCart(itemInCart);
  }, [state.items, id]);

  const handleAddToCart = () => {
    if (isInCart) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
      setIsInCart(false);
    } else {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          id,
          name: title,
          price,
          quantity: 1,
          imageUrl,
        },
      });
      setIsInCart(true);
    }
  };

  // Calculate discount percentage
  const discountPercentage = oldPrice ? ((oldPrice - price) / oldPrice * 100).toFixed(0) : '';

  // Handle card click to navigate
  const handleCardClick = () => {
    router.push(`/Productslistpage/${id}`);
  };

  return (
    <div 
      className="relative border p-2 rounded-lg overflow-hidden shadow-md w-[100%] bg-white hover:shadow-lg transition-shadow duration-300 ease-in-out cursor-pointer"
    >
      <div>
        <Image 
          src={imageUrl} 
          onClick={handleCardClick}
          alt={title} 
          width={150} 
          height={150} 
          className="w-full h-32 object-cover" 
          onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} 
        />
        {oldPrice && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-xl">
            -{discountPercentage}%
          </div>
        )}
      </div>
      <div className="p-1">
        <h3 className="text-sm font-bold text-green-700 mb-2">{title}</h3>
        <p className="text-xs text-gray-500 mb-2">{description}</p>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm mr-2 font-semibold text-blue-600">{`ksh${price.toFixed(2)}`}</div>
          {oldPrice && (
            <div className="text-sm font-medium text-gray-500 line-through ml-2">{`ksh${oldPrice.toFixed(2)}`}</div>
          )}
        </div>
        {rating !== undefined && (
          <div className="mt-2">
            <StarRating rating={rating} />
          </div>
        )}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2 mt-2 flex items-center justify-center text-sm text-white rounded-lg ${isInCart ? 'bg-green-700' : 'bg-blue-500'}`}
        >
          {isInCart ? (
            <>
              <FaCartArrowDown size={20} className="mr-2" />
              <span>In Cart</span>
            </>
          ) : (
            <>
              <FaCartPlus size={20} className="mr-2" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Card;
