"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import Pagination from '@/components/paginationP/page'; // Ensure this is correctly set up with pageSize prop
import Sidebar from '@/components/sidebar/page'; // Import Sidebar
import { useSession } from 'next-auth/react';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress

interface Product {
  id: number;
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
        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300"
      >
        Delete
      </button>
      <button
        onClick={onRequestClose}
        className="bg-gray-500 text-white py-2 px-4 rounded ml-2 hover:bg-gray-600 transition duration-300"
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
    <p><strong>Rating:</strong> {product.starRating}</p>
    <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover mb-4" />
    <button
      onClick={onRequestClose}
      className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
    >
      Close
    </button>
  </Modal>
);

const ListProducts: React.FC = () => {
  const { data: session } = useSession(); // Fetch session data
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAccessDeniedModalOpen, setIsAccessDeniedModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true); // Loading state

  const pageSize = 10; // Define the page size here

  const fetchProducts = async () => {
    setLoading(true); // Set loading to true when fetching data
    try {
      const response = await axios.get('/actions/products'); // Update with your API endpoint
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch products.');
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
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

  const handleDeleteProduct = () => {
    if (selectedProduct) {
      axios.delete(`/actions/products/${selectedProduct.id}`)
        .then(() => {
          fetchProducts();
          toast.success('Product deleted successfully!');
        })
        .catch((error) => {
          console.error(error);
          toast.error('Failed to delete product.');
        });
    }
    setIsDeleteModalOpen(false);
  };

  const handleOpenModal = (type: 'view' | 'delete', product?: Product) => {
    if (type === 'view' && (session?.user as { role?: string })?.role !== 'ADMIN') {
      setIsAccessDeniedModalOpen(true);
      return;
    }
    setSelectedProduct(product || null);
    if (type === 'view') {
      setIsViewModalOpen(true);
    } else {
      setIsDeleteModalOpen(true);
    }
  };

  const handleCloseModals = () => {
    setIsDeleteModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedProduct(null);
  };

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} className='md:hidden' />
      <div className={`flex transition-all duration-300 ${isSidebarOpen ? 'ml-[25%]' : 'ml-[2%]'} px-4 md:px-8 py-4`}>
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => console.log('Add Product')} // Replace with your add product handler
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
            >
              Add Product
            </button>
            <div className="flex flex-col items-center w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="border p-2 rounded-md w-full max-w-md"
              />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="border p-2 rounded-md mt-4 w-full max-w-md"
              >
                <option value="All">All Categories</option>
                {/* Add more categories here */}
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Clothing">Clothing</option>
                {/* Update this list based on your actual categories */}
              </select>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <CircularProgress />
            </div>
          ) : (
            <>
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
                          <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
                        </td>
                        <td className="border border-gray-300 p-2">{product.name}</td>
                        <td className="border border-gray-300 p-2">${product.price.toFixed(2)}</td>
                        <td className="border border-gray-300 p-2">{product.quantity}</td>
                        <td className="border border-gray-300 p-2">{product.starRating}</td>
                        <td className="border border-gray-300 p-2">
                          <button
                            onClick={() => handleOpenModal('view', product)}
                            className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 transition duration-300"
                          >
                            View
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenModal('delete', product)}
                              className="bg-red-500 text-white py-1 px-2 rounded ml-2 hover:bg-red-600 transition duration-300"
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
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredProducts.length}
                  pageSize={pageSize} // Pass the pageSize here
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <ToastContainer />

      {selectedProduct && isDeleteModalOpen && (
        <DeleteProductModal
          isOpen={isDeleteModalOpen}
          onRequestClose={handleCloseModals}
          onDelete={handleDeleteProduct}
          product={selectedProduct}
        />
      )}
      {selectedProduct && isViewModalOpen && (
        <ViewProductModal
          isOpen={isViewModalOpen}
          onRequestClose={handleCloseModals}
          product={selectedProduct}
        />
      )}

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
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300 mt-4"
          >
            Close
          </button>
        </Modal>
      )}
    </>
  );
};

export default ListProducts;
