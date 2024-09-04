import React from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

// Define the Product type inline
interface Product {
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  isFlashSale?: boolean;
  starRating?: number;
  category?: string;
  quantityAvailable?: number;
}

interface DeleteProductModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onDelete: () => void;
  product: Product;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({ isOpen, onRequestClose, onDelete, product }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Delete Product"
      className="modal"
      overlayClassName="overlay"
    >
      <h2 className="text-2xl mb-4">Delete Product</h2>
      <p>Are you sure you want to delete {product.name}?</p>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => {
            onDelete();
            toast.success('Product deleted successfully!');
            onRequestClose();
          }}
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
};

export default DeleteProductModal;
