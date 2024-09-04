"use client";
import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from 'react-modal';
import { FaEdit, FaTrash, FaEye, FaPlus } from 'react-icons/fa';
import Pagination from '@/components/paginationP/page';
import Sidebar from '@/components/sidebar/page'; // Import Sidebar
import StarRating from '@/components/star/page';

// Define the Product type
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

// Props for AddEditProductModal component
interface AddEditProductModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSave: (product: Partial<Product>) => void;
  initialValues?: Partial<Product>;
  modalType: 'add' | 'edit';
}

// AddEditProductModal component
const AddEditProductModal: React.FC<AddEditProductModalProps> = ({ isOpen, onRequestClose, onSave, initialValues, modalType }) => {
  const [formValues, setFormValues] = useState<Partial<Product>>(initialValues || {});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleStarRatingChange = (value: number) => {
    setFormValues(prev => ({ ...prev, starRating: value }));
  };

  const handleSubmit = () => {
    onSave(formValues);
    toast.success(modalType === 'add' ? 'Product added successfully!' : 'Product updated successfully!');
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={`${modalType} Product`}
      className="modal"
      overlayClassName="overlay"
    >
      <h2 className="text-2xl mb-4">{modalType === 'add' ? 'Add Product' : 'Edit Product'}</h2>
      <label className="block mb-2">Product Name</label>
      <input
        type="text"
        name="name"
        value={formValues.name || ''}
        onChange={handleInputChange}
        className="border p-2 w-full rounded-md mb-4"
        placeholder="Product Name"
      />
      <label className="block mb-2">Description</label>
      <textarea
        name="description"
        value={formValues.description || ''}
        onChange={handleInputChange}
        className="border p-2 w-full rounded-md mb-4"
        placeholder="Product Description"
      />
      <label className="block mb-2">Price</label>
      <input
        type="number"
        name="price"
        value={formValues.price || ''}
        onChange={handleInputChange}
        className="border p-2 w-full rounded-md mb-4"
        placeholder="Price"
        step="0.01"
      />
      <label className="block mb-2">Old Price</label>
      <input
        type="number"
        name="oldPrice"
        value={formValues.oldPrice || ''}
        onChange={handleInputChange}
        className="border p-2 w-full rounded-md mb-4"
        placeholder="Old Price"
        step="0.01"
      />
      <label className="block mb-2">Star Rating</label>
      <select
        name="starRating"
        value={formValues.starRating || ''}
        onChange={e => handleStarRatingChange(Number(e.target.value))}
        className="border p-2 w-full rounded-md mb-4"
      >
        {[...Array(5).keys()].map(i => (
          <option key={i + 1} value={i + 1}>{i + 1} Star</option>
        ))}
        <option key={4.5} value={4.5}>4.5 Stars</option>
      </select>
      <label className="block mb-2">Category</label>
      <input
        type="text"
        name="category"
        value={formValues.category || ''}
        onChange={handleInputChange}
        className="border p-2 w-full rounded-md mb-4"
        placeholder="Category"
      />
      <label className="block mb-2">Quantity</label>
      <input
        type="number"
        name="quantity"
        value={formValues.quantity || ''}
        onChange={handleInputChange}
        className="border p-2 w-full rounded-md mb-4"
        placeholder="Quantity"
      />
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
        >
          {modalType === 'add' ? 'Add Product' : 'Save Changes'}
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
};

// Props for ViewProductModal component
interface ViewProductModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  product: Product;
}

// ViewProductModal component
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
    <img src={product.image} alt={product.name} className="w-full h-auto mb-4" />
    <button
      onClick={onRequestClose}
      className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
    >
      Close
    </button>
  </Modal>
);

// Props for DeleteProductModal component
interface DeleteProductModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onDelete: () => void;
  product: Product;
}

// DeleteProductModal component
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

// Main ListProducts component
const ListProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'delete' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/data2.json'); // Update with your API endpoint
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch products.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const handleAddProduct = (product: Partial<Product>) => {
    axios.post('/api/products', product)
      .then(() => {
        fetchProducts();
        toast.success('Product added successfully!');
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to add product.');
      });
  };

  const handleEditProduct = (product: Partial<Product>) => {
    if (selectedProduct) {
      axios.put(`/api/products/${selectedProduct.id}`, product)
        .then(() => {
          fetchProducts();
          toast.success('Product updated successfully!');
        })
        .catch((error) => {
          console.error(error);
          toast.error('Failed to update product.');
        });
    }
  };

  const handleDeleteProduct = () => {
    if (selectedProduct) {
      axios.delete(`/api/products/${selectedProduct.id}`)
        .then(() => {
          fetchProducts();
          toast.success('Product deleted successfully!');
        })
        .catch((error) => {
          console.error(error);
          toast.error('Failed to delete product.');
        });
    }
  };

  const handleOpenModal = (type: 'add' | 'edit' | 'view' | 'delete', product?: Product) => {
    setModalType(type);
    setSelectedProduct(product || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex">
        <div className={`flex-1 p-4 md:ml-64 transition-all ${isSidebarOpen ? 'ml-64' : ''}`}>
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => handleOpenModal('add')}
              className="bg-blue-500 text-white py-1.5 px-3 rounded-full hover:bg-blue-600 transition duration-300"
            >
              Add Product
            </button>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="border p-2 rounded-md w-full max-w-xs"
            />
          </div>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-300 p-2">Image</th>
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Description</th>
                <th className="border border-gray-300 p-2">Price</th>
                <th className="border border-gray-300 p-2">Quantity</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4">No products found</td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td className="border border-gray-300 p-2">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover" />
                    </td>
                    <td className="border border-gray-300 p-2">{product.name}</td>
                    <td className="border border-gray-300 p-2">{product.description}</td>
                    <td className="border border-gray-300 p-2">${product.price.toFixed(2)}</td>
                    <td className="border border-gray-300 p-2">{product.quantity}</td>
                    <td className="border border-gray-300 p-2">
                      <button
                        onClick={() => handleOpenModal('view', product)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleOpenModal('edit', product)}
                        className="text-green-500 hover:text-green-700 ml-2"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleOpenModal('delete', product)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <FaTrash />
                      </button>
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
              itemsPerPage={10} 
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>

      <ToastContainer />

      {modalType === 'add' && (
        <AddEditProductModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          onSave={handleAddProduct}
          modalType="add"
        />
      )}
      {modalType === 'edit' && selectedProduct && (
        <AddEditProductModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          onSave={handleEditProduct}
          initialValues={selectedProduct}
          modalType="edit"
        />
      )}
      {modalType === 'view' && selectedProduct && (
        <ViewProductModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          product={selectedProduct}
        />
      )}
      {modalType === 'delete' && selectedProduct && (
        <DeleteProductModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          onDelete={handleDeleteProduct}
          product={selectedProduct}
        />
      )}
    </>
  );
};

export default ListProducts;
