"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import Pagination from '@/components/paginationP/page'; // Ensure this is correctly set up with pageSize prop
import Sidebar from '@/components/sidebar/page'; // Import Sidebar
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaSync } from 'react-icons/fa';
import StarRating from '@/components/starRating/page'; // Adjust the import path as needed
import CircularProgress from '@mui/material/CircularProgress';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  oldPrice?: number;
  starRating: number;
  category: string;
}

interface DeleteProductModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onDelete: () => void;
  product: Product;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({ isOpen, onRequestClose, onDelete, product }) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentLabel="Delete Product"
    className="modal"
    overlayClassName="overlay"
  >
    <h2 className="text-2xl mb-4">Delete Product</h2>
    <p>Are you sure you want to delete <strong>{product.name}</strong>?</p>
    <div className="flex justify-end mt-4">
      <button
        onClick={onDelete}
        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 outline-none focus:outline-black transition duration-300"
      >
        Delete
      </button>
      <button
        onClick={onRequestClose}
        className="bg-gray-500 text-white py-2 px-4 rounded ml-2 hover:bg-gray-600 outline-none focus:outline-black transition duration-300"
      >
        Cancel
      </button>
    </div>
  </Modal>
);

interface ViewProductModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  product: Product;
}

const ViewProductModal: React.FC<ViewProductModalProps> = ({ isOpen, onRequestClose, product }) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentLabel="View Product"
    className="modal"
    overlayClassName="overlay"
  >
    <h2 className="text-2xl mb-4">View Product</h2>
    <p><strong>Name:</strong> {product.name}</p>
    <p><strong>Description:</strong> {product.description}</p>
    <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
    <p><strong>Quantity:</strong> {product.quantity}</p>
    <img src={product.image} alt={product.name} className="w-full h-auto mb-4 rounded-lg" />
    <button
      onClick={onRequestClose}
      className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 outline-none focus:outline-black transition duration-300"
    >
      Close
    </button>
  </Modal>
);

const ListProducts: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAccessDeniedModalOpen, setIsAccessDeniedModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const pageSize = 10;
  const DEFAULT_IMAGE = '/path/to/default-image.jpg'; // Replace with the path to your default image

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/actions/products');
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductById = async (id: string) => {
    try {
      const response = await axios.get(`/actions/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch product.');
      return null;
    }
  };

  const handleDeleteProduct = async () => {
    if (selectedProduct) {
      try {
        await axios.delete(`/actions/products/${selectedProduct.id}`);
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete product.');
      } finally {
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleOpenModal = async (type: 'view' | 'delete', productId?: string) => {
    if (type === 'view' && (session?.user as { role?: string })?.role !== 'ADMIN') {
      setIsAccessDeniedModalOpen(true);
      return;
    }

    if (productId) {
      const product = await fetchProductById(productId);
      setSelectedProduct(product);
    }

    if (type === 'view') {
      setIsViewModalOpen(true);
    } else {
      setIsDeleteModalOpen(true);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProducts().finally(() => setIsRefreshing(false));
  };

  const handleCloseModals = () => {
    setIsDeleteModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    setFilteredProducts(filtered);
  }, [searchTerm, products, selectedCategory]);

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} className='md:hidden' />
      <div className={`flex transition-all duration-300 ${isSidebarOpen ? 'ml-[25%]' : 'ml-[2%]'} px-4 md:px-8 py-4`}>
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            {isAdmin && (
              <button
                onClick={() => router.push('/createproduct')}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 outline-none focus:outline-black transition duration-300"
              >
                Add Product
              </button>
            )}
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="border p-2 rounded-md w-full max-w-xs mb-2"
            />
            <button
              onClick={handleRefresh}
              className="bg-blue-500 text-white py-1.5 px-3 rounded-full hover:bg-blue-600 transition duration-300 flex items-center"
            >
              <FaSync className="mr-2" />
              Refresh
            </button>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="border p-2 rounded-md w-full max-w-xs"
            >
              <option value="All">All Categories</option>
              <option value="Accessories">Accessories</option>
              <option value="Groceries">Groceries</option>
              <option value="Fashions">Fashions</option>
              <option value="Home Appliances">Home Appliances</option>
              <option value="Kids">Kids</option>
            </select>

          </div>
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <CircularProgress />
            </div>
          ) : (
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-300 p-2">Image</th>
                  <th className="border border-gray-300 p-2">Name</th>
                  <th className="border border-gray-300 p-2">Price</th>
                  <th className="border border-gray-300 p-2">Quantity</th>
                  <th className="border border-gray-300 p-2">Rating</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4">No products found</td>
                  </tr>
                ) : (
                  filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(product => (
                    <tr key={product.id}>
                      <td className="border border-gray-300 p-2">
                        <img src={product.image || DEFAULT_IMAGE} alt={product.name} className="w-14 h-14 object-cover rounded-lg" />
                      </td>
                      <td className="border border-gray-300 p-2">{product.name}</td>
                      <td className="border border-gray-300 p-2">${product.price.toFixed(2)}</td>
                      <td className="border border-gray-300 p-2">{product.quantity}</td>
                      <td className="border border-gray-300 p-2">
                        <StarRating rating={product.starRating} />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <button
                          onClick={() => handleOpenModal('view', product.id)}
                          className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 outline-none focus:outline-black transition duration-300"
                        >
                          View
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenModal('delete', product.id)}
                            className="bg-red-500 text-white py-1 px-2 rounded ml-2 hover:bg-red-600 outline-none focus:outline-black transition duration-300"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredProducts.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <ToastContainer />

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onRequestClose={handleCloseModals}
        onDelete={handleDeleteProduct}
        product={selectedProduct || {
          id: '',
          name: '',
          description: '',
          price: 0,
          quantity: 0,
          image: DEFAULT_IMAGE,
          starRating: 0,
          category: ''
        }}
      />
      <ViewProductModal
        isOpen={isViewModalOpen}
        onRequestClose={handleCloseModals}
        product={selectedProduct || {
          id: '',
          name: '',
          description: '',
          price: 0,
          quantity: 0,
          image: DEFAULT_IMAGE,
          starRating: 0,
          category: ''
        }}
      />

      {isAccessDeniedModalOpen && (
        <Modal
          isOpen={isAccessDeniedModalOpen}
          onRequestClose={() => setIsAccessDeniedModalOpen(false)}
          contentLabel="Access Denied"
          className="modal"
          overlayClassName="overlay"
        >
          <h2 className="text-2xl mb-4">Access Denied</h2>
          <p>You do not have permission to view this product.</p>
          <button
            onClick={() => setIsAccessDeniedModalOpen(false)}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 outline-none focus:outline-black transition duration-300 mt-4"
          >
            Close
          </button>
        </Modal>
      )}
    </>
  );
};

export default ListProducts;
