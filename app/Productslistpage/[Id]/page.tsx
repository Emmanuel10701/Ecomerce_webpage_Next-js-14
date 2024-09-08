'use client'; // Ensure this is a Client Component

import React from 'react';
import { FaCartPlus, FaCartArrowDown, FaArrowLeft, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useCart } from '../../../context/page'; // Adjust the path if needed
import StarRating from '../../../components/starRating/page'; // Import the StarRating component
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useRouter } from 'next/navigation'; // Updated import
import mockData from '@/public/mockdata.json'; // Adjust the import path as needed

interface Product {
  id: number;
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
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string; // Ensure this is always a string
  };
}

const getProductById = (id: number): Product | undefined => {
  return mockData.find((product: Product) => product.id === id);
};

const getRelatedProducts = (category: string, excludeId: number): Product[] => {
  return mockData
    .filter((product: Product) => product.category === category && product.id !== excludeId)
    .slice(0, 4);
};

const ProductPage = ({ params }: { params: { id: string } }) => {
  const productId = parseInt(params.id, 10);
  const product = getProductById(productId);

  if (!product) {
    notFound(); // Show 404 page
    return null;
  }

  const relatedProducts = product.category ? getRelatedProducts(product.category, productId) : [];
  const { state, dispatch } = useCart();
  const [isInCart, setIsInCart] = React.useState<boolean>(false);
  const [isReadMore, setIsReadMore] = React.useState<boolean>(false);
  const router = useRouter();

  React.useEffect(() => {
    const itemInCart = state.items.some((item: { id: number }) => item.id === productId);
    setIsInCart(itemInCart);
  }, [state.items, productId]);

  const handleAddToCart = () => {
    if (isInCart) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: { id: productId } });
      setIsInCart(false);
    } else {
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
  };

  const handleCardClick = (id: number) => {
    router.push(`/Productslistpage/${id}`);
  };

  const handleSocialLink = (url: string) => {
    router.push(url);
  };

  const discountPercentage = 10; // Example discount percentage
  const descriptionSnippet = product.description?.split(' ').slice(0, 10).join(' ') + '...';
  const fullDescription = product.description || '';

  return (
    <div className="container mx-auto p-4 mt-14 mx-4">
      <div className="absolute top-4 left-4">
        <button onClick={() => router.back()} className="flex items-center text-blue-600 bg-slate-300 rounded-full px-2 py-1">
          <FaArrowLeft size={18} />
          <span className="ml-2 text-sm">Back</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-2/4 flex flex-col items-start">
          <div className="relative w-full flex flex-col justify-center mb-4">
            <Image
              src={product.imageUrl || '/placeholder.jpg'}
              alt={product.title}
              width={600} // Increased width
              height={600} // Increased height
              layout="responsive"
              className="w-full h-auto rounded-xl"
            />
            {product.rating && (
              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-xl">
                -{discountPercentage}%
              </div>
            )}
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Related Products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct: Product) => (
                  <div key={relatedProduct.id} className="flex flex-col items-center">
                    <div
                      onClick={() => handleCardClick(relatedProduct.id)}
                      className="border p-2 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 ease-in-out"
                    >
                      <Image
                        src={relatedProduct.imageUrl || '/placeholder.jpg'}
                        alt={relatedProduct.title}
                        width={120} // Adjusted width
                        height={120} // Adjusted height
                        layout="responsive"
                        className="w-full h-auto"
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                      />
                      <h3 className="text-xs font-semibold mt-2">{relatedProduct.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-2/4 md:pl-4">
          <h1 className="text-xl font-bold mb-4">{product.title}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <p className="text-sm mb-4 md:hidden">
                {isReadMore ? fullDescription : descriptionSnippet}
                {product.description && !isReadMore && (
                  <button
                    onClick={() => setIsReadMore(true)}
                    className="text-blue-600 underline ml-1"
                  >
                    Read More
                  </button>
                )}
              </p>
              <p className="hidden md:block text-sm mb-4">
                At our company, we prioritize quality and customer satisfaction. We strive to provide top-notch products that meet your needs and exceed your expectations. Our commitment to excellence ensures that every product is carefully crafted and rigorously tested. We value your trust and aim to deliver exceptional value with every purchase.
              </p>
            </div>
            <div className="col-span-1">
              <div className='text-green-600 text-lg mb-2'>Price: ${product.price.toFixed(2)}</div>
              {product.oldPrice && <div className='text-slate-400 text-center font-bold line-through text-sm'>Old Price: ${product.oldPrice.toFixed(2)}</div>}
              <div className="flex items-center mb-4">
                {product.rating && (
                  <div className="relative">
                    <StarRating rating={product.rating} />
                  </div>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                className={`w-full py-2 mt-2 flex items-center justify-center text-sm text-white rounded-lg ${isInCart ? 'bg-green-700' : 'bg-blue-500'}`}
              >
                {isInCart ? (
                  <>
                    <FaCartArrowDown size={20} className="text-white mr-2" />
                    <span>In Cart</span>
                  </>
                ) : (
                  <>
                    <FaCartPlus size={20} className="text-white mr-2" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              <div className="flex gap-4 mt-4">
                <button onClick={() => handleSocialLink('https://facebook.com')} className="text-blue-600">
                  <FaFacebook size={24} />
                </button>
                <button onClick={() => handleSocialLink('https://twitter.com')} className="text-blue-400">
                  <FaTwitter size={24} />
                </button>
                <button onClick={() => handleSocialLink('https://instagram.com')} className="text-pink-600">
                  <FaInstagram size={24} />
                </button>
                <button onClick={() => handleSocialLink('https://linkedin.com')} className="text-blue-700">
                  <FaLinkedin size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
