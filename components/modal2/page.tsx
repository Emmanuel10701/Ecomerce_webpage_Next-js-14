"use client";

import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton } from '@mui/material';
import { FaRegImage } from 'react-icons/fa'; // Modern image icon
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PencilIcon } from '@heroicons/react/24/outline'; // Modern icon for settings

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (user: User & { id: number }) => void;
}

interface User {
  name: string;
  email: string;
  role: 'Admin' | 'User';
  image: string;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ open, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Admin' | 'User'>('User');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploaded, setImageUploaded] = useState<boolean>(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';

    // Display errors using react-toastify
    Object.values(newErrors).forEach(error => {
      toast.error(error);
    });

    return Object.keys(newErrors).length === 0; // No errors
  };

  const handleAdd = () => {
    if (!validateForm()) return; // Stop if validation fails

    const newUser: User & { id: number } = {
      id: Date.now(),
      name,
      email,
      role,
      image: imageFile ? URL.createObjectURL(imageFile) : image,
    };

    onAdd(newUser);
    onClose();
    toast.success('Employee added successfully!');
  };

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/avif', 'image/webp'];
      if (validTypes.includes(file.type)) {
        setImageFile(file);
        setImage(URL.createObjectURL(file));
        setImageUploaded(true);
      } else {
        toast.error('Please select a valid image file (JPEG, PNG, JPG, AVIF, WEBP).');
      }
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <div className="mb-4 flex flex-col items-center">
            {!imageUploaded && (
              <>
                <input
                  accept="image/jpeg, image/png, image/jpg, image/avif, image/webp"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload" className="cursor-pointer relative">
                  <IconButton component="span" className="bg-blue-500 text-white p-2 rounded-full">
                    <PencilIcon className="w-6 h-6" />
                  </IconButton>
                  <span className="absolute bottom-0 right-0 text-white bg-blue-600 p-2 rounded-full">
                    <FaRegImage className="w-6 h-6" />
                  </span>
                </label>
              </>
            )}
            {image && (
              <img src={image} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-full border-2 border-blue-500" />
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="name">
              Name
            </label>
            <TextField
              id="name"
              fullWidth
              value={name}
              onChange={handleChange(setName)}
              variant="outlined"
              margin="normal"
              label="Name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
              Email
            </label>
            <TextField
              id="email"
              type="email"
              fullWidth
              value={email}
              onChange={handleChange(setEmail)}
              variant="outlined"
              margin="normal"
              label="Email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="role">
              Role
            </label>
            <TextField
              id="role"
              select
              fullWidth
              value={role}
              onChange={(e) => setRole(e.target.value as 'Admin' | 'User')}
              variant="outlined"
              margin="normal"
              SelectProps={{ native: true }}
              label="Role"
            >
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </TextField>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAdd} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </>
  );
};

export default AddEmployeeModal;
