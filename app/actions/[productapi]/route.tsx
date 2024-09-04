import { NextApiRequest, NextApiResponse } from 'next';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  isFlashSale: boolean;
  ratings: number;
  image?: string;
  createdAt: string;
}

// Simulated in-memory database
const products: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    description: 'Description of Product 1',
    price: 29.99,
    oldPrice: 39.99,
    isFlashSale: true,
    ratings: 4.5,
    image: 'https://via.placeholder.com/150',
    createdAt: new Date().toISOString(),
  },
  // Add more products as needed
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(products);
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    const index = products.findIndex(p => p.id === id);
    if (index > -1) {
      products.splice(index, 1);
      res.status(204).end(); // No content to return
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } else if (req.method === 'PUT') {
    const updatedProduct = req.body as Product;
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index > -1) {
      products[index] = updatedProduct;
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
