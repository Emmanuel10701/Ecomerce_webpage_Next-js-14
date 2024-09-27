import React from 'react';
import Modal from 'react-modal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

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

export default ViewProductModal;
