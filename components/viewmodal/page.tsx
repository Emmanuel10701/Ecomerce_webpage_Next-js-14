import React, { ChangeEvent } from 'react';
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

interface AddEditProductModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSave: (product: Partial<Product>) => void;
  initialValues?: Partial<Product>;
  modalType: 'add' | 'edit';
}

const AddEditProductModal: React.FC<AddEditProductModalProps> = ({ isOpen, onRequestClose, onSave, initialValues, modalType }) => {
  const [formValues, setFormValues] = React.useState<Partial<Product>>(initialValues || {});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleStarRatingChange = (value: number) => {
    setFormValues(prev => ({ ...prev, starRating: value }));
  };

  const handleSubmit = () => {
    if (modalType === 'add') {
      toast.success('Product added successfully!');
    } else {
      toast.success('Product updated successfully!');
    }
    onSave(formValues);
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

      <label className="block mb-2">Flash Sale</label>
      <select
        name="isFlashSale"
        value={formValues.isFlashSale ? 'true' : 'false'}
        onChange={e => setFormValues(prev => ({ ...prev, isFlashSale: e.target.value === 'true' }))}
        className="border p-2 w-full rounded-md mb-4"
      >
        <option value="false">No</option>
        <option value="true">Yes</option>
      </select>

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

      <label className="block mb-2">Quantity Available</label>
      <input
        type="number"
        name="quantityAvailable"
        value={formValues.quantityAvailable || ''}
        onChange={handleInputChange}
        className="border p-2 w-full rounded-md mb-4"
        placeholder="Quantity Available"
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

export default AddEditProductModal;
