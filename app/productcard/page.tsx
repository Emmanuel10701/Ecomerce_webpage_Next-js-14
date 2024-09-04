// Product.tsx
import React from 'react';
// types.ts
export interface ProductProps {
    id: number;
    name: string;
    price: number;
    description?: string; // Optional prop
  }
  

const Product: React.FC<ProductProps> = ({ id, name, price, description }) => {
  return (
    <div className="product">
      <h2>{name}</h2>
      <p>ID: {id}</p>
      <p>Price: ${price}</p>
      {description && <p>Description: {description}</p>}
    </div>
  );
};

export default Product;
