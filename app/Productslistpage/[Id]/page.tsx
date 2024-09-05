// app/products/[id]/page.tsx

import { notFound } from 'next/navigation';
import Image from 'next/image';
import mockData from '@/public/mockdata.json'; // Adjust the import path as needed

// Define the Product interface
interface Product {
  id: number;
  title: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  description?: string;
  rating?: number;
}

// Fetch product by ID
const getProductById = (id: number): Product | undefined => {
  return mockData.find((product: Product) => product.id === id);
};

// Component to fetch product data and handle 404
const ProductPage = ({ params }: { params: { id: string } }) => {
  const productId = parseInt(params.id, 10);
  const product = getProductById(productId);

  if (!product) {
    notFound(); // Show 404 page
    return null;
  }

  return (
    <div className="product-details">
      <h1>{product.title}</h1>
      <Image
        src={product.imageUrl || '/placeholder.jpg'}
        alt={product.title}
        width={500}
        height={500}
        layout="responsive"
      />
      <p>{product.description}</p>
      <div>Price: {product.price}</div>
      {product.oldPrice && <div>Old Price: {product.oldPrice}</div>}
      {product.rating && <div>Rating: {product.rating}</div>}
    </div>
  );
};

// Generate static params if needed for pre-rendering
export async function generateStaticParams() {
  const products: Product[] = mockData; // Mock data is used here
  return products.map(product => ({
    id: product.id.toString(),
  }));
}

export default ProductPage;
