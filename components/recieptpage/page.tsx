
"use client"
import React from 'react';
interface ReceiptProps {
  purchaseDetails: {
    items: { id: string; name: string; price: number; quantity: number }[];
    total: number;
    paymentMethod: string;
  };
}

const Receipt: React.FC<ReceiptProps> = ({ purchaseDetails }) => {
  const { items, total, paymentMethod } = purchaseDetails;

  return (
    <div className="receipt p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Receipt</h2>
      <p>Date: {new Date().toLocaleDateString()}</p>
      <h3 className="text-xl font-semibold mt-4">Items Purchased:</h3>
      <ul className="list-disc pl-5">
        {items.map((item) => (
          <li key={item.id} className="py-1">
            {item.name} - ${item.price.toFixed(2)} x {item.quantity}
          </li>
        ))}
      </ul>
      <p className="mt-4 font-semibold">Total Amount: ${total.toFixed(2)}</p>
      <p>Payment Method: {paymentMethod}</p>
    </div>
  );
};

export default Receipt;
