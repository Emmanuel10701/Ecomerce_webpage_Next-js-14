// libs/api.ts

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  description?: string;
  category?: string; // Include category if you need it for related products
}

interface FetchProductsResponse {
  products: Product[];
  total: number; // Total number of products (useful for pagination)
}

// Fetch products with pagination
export async function fetchProducts(page: number, limit: number): Promise<FetchProductsResponse> {
  const apiUrl = `https://fakestoreapi.com/products?limit=${limit}&page=${page}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const products = await response.json();
    // Assuming the response contains the total number of products
    // If the total count isn't available, it could be an issue of the API itself
    const total = parseInt(response.headers.get('X-Total-Count') || '0', 10);
    
    return {
      products,
      total,
    };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

// Fetch a single product by its ID
export async function fetchProductById(id: number): Promise<Product> {
  const apiUrl = `https://fakestoreapi.com/products/${id}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const product = await response.json();
    return product;
  } catch (error) {
    console.error(`Failed to fetch product with ID ${id}:`, error);
    throw error;
  }
}

// Fetch related products based on category
export async function fetchRelatedProducts(category: string): Promise<Product[]> {
  const apiUrl = `https://fakestoreapi.com/products/category/${category}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const products = await response.json();
    return products;
  } catch (error) {
    console.error(`Failed to fetch related products for category ${category}:`, error);
    throw error;
  }
}
