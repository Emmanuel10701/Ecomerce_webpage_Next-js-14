'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/page'; // Adjust this path to your actual context path
import Image from 'next/image';

// Helper function to format prices
const formatPrice = (price: number): string => {
  const priceStr = price.toFixed(2).toString();
  const [integerPart, decimalPart] = priceStr.split('.');

  // Add comma as thousands separator
  const integerPartWithCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${integerPartWithCommas}.${decimalPart}`;
};

const CartPage: React.FC = () => {
  const router = useRouter();
  const { state, dispatch } = useCart();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleProceedToCheckout = () => {
    setIsLoading(true);
    // Simulate a delay to show loading indicator
    setTimeout(() => {
      router.push('/checkout'); // Navigate to checkout page
    }, 1000); // Adjust delay as needed
  };

  return (
    <div className="cart p-4 max-w-screen-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-500 text-center">Shopping Cart</h1>
      {state.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-none p-4 my-[10%]">
          <p className="text-center text-slate-500 text-md mb-4">Your cart is empty</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            onClick={() => router.push('/Productslistpage')} // Navigate to products page
          >
            Go to Products
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="w-full max-w-4xl mx-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs md:text-md font-bold text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-2 py-2 text-left text-xs md:text-md font-bold text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-2 py-2 text-left text-xs md:text-md font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-2 py-2 text-left text-xs md:text-md font-bold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-2 py-2 text-left text-xs md:text-md font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.items.map(item => (
                  <tr key={item.id}>
                    <td className="px-2 py-2 text-center">
                      <Image
                        src={item.imageUrl || '/images/placeholder.jpg'} // Default image if no imageUrl
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg mx-auto"
                        onError={(e) => (e.currentTarget.src = '/images/placeholder.jpg')} // Handle image errors
                      />
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <input
                        type="number"
                        value={item.quantity}
                        min="1"
                        onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value, 10))}
                        className="p-1 text-xl font-bold text-center text-slate-500 w-16 rounded"
                      />
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-500 font-semibold">${formatPrice(item.price)}</td>
                    <td className="px-2 py-2 text-md text-green-600 font-bold">${formatPrice(item.price * item.quantity)}</td>
                    <td className="px-2 py-2 text-sm font-medium">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {state.items.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
          <button
            className="mt-4 sm:mt-0 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
            onClick={handleProceedToCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-dotFlashing"></div>
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-dotFlashing delay-200"></div>
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-dotFlashing delay-400"></div>
              </div>
            ) : (
              'Proceed to Checkout'
            )}
            {isLoading && ' Proceeding...'}
          </button>
          <h2 className="text-lg sm:text-xl text-slate-500 font-extrabold mt-4 sm:mt-0">Total: ${formatPrice(total)}</h2>
        </div>
      )}
    </div>
  );
};

export default CartPage;
