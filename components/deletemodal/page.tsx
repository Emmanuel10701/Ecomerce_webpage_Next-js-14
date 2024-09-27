import React from 'react';
import Modal from 'react-modal';

interface Product {
  id: string;
  name: string;
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

export default DeleteProductModal;
