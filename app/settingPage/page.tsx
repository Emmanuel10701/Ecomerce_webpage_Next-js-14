"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { ArrowBack, Person } from '@mui/icons-material';
import { PencilIcon, XMarkIcon, Bars3Icon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { Autocomplete, TextField } from '@mui/material';

// Sidebar Component
const Sidebar: React.FC<{ onAddAdminClick: () => void; onViewAdminsClick: () => void; onAddEmployeeClick: () => void; isOpen: boolean; toggleSidebar: () => void; isAdmin: boolean }> = ({ onAddAdminClick, onViewAdminsClick, onAddEmployeeClick, isOpen, toggleSidebar, isAdmin }) => {
  return (
    <div className={`w-1/4 bg-gray-800 text-white h-screen ${isOpen ? 'block' : 'hidden'} sm:block`}>
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <button onClick={toggleSidebar} className="text-white sm:hidden">
          <Bars3Icon className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4">
        <button
          onClick={onAddAdminClick}
          className="mb-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded flex items-center w-full text-sm"
        >
          <Person className="mr-2 w-4 h-4" />
          Add Admin
        </button>
        {isAdmin && (
          <button
            onClick={onAddEmployeeClick}
            className="mb-3 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded flex items-center w-full text-sm"
          >
            <UserIcon className="mr-2 w-4 h-4" />
            Add Employee
          </button>
        )}
        <button
          onClick={onViewAdminsClick}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded flex items-center w-full text-sm"
        >
          <UsersIcon className="mr-2 w-4 h-4" />
          View All Admins
        </button>
      </div>
    </div>
  );
};

// Modal Component
const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ open, onClose, title, children }) => {
  return (
    <div className={`fixed inset-0 flex items-center justify-center ${open ? 'block' : 'hidden'} bg-gray-900 bg-opacity-50`} onClick={onClose}>
      <div className="bg-white w-full max-w-md mx-auto p-4 rounded-lg shadow-lg relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
};

// Main Settings Page Component
const Settings: React.FC = () => {
  const router = useRouter();
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Handle sidebar toggle
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle modals
  const handleAddAdminClick = () => setModalOpen('addAdmin');
  const handleAddEmployeeClick = () => setModalOpen('addEmployee');
  const handleViewAdminsClick = () => setModalOpen('viewAdmins');
  const closeModal = () => setModalOpen('');

  // Fetch data from API
  useEffect(() => {
    // Fetch employees
    axios.get('/api/employees')
      .then(response => setEmployees(response.data))
      .catch(error => console.error(error));

    // Fetch users
    axios.get('/api/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error(error));

    // Fetch admins
    axios.get('/api/admins')
      .then(response => setAdmins(response.data))
      .catch(error => console.error(error));
  }, []);

  // Save changes
  const saveChanges = () => {
    const formData = new FormData();
    if (profileImage) formData.append('profileImage', profileImage);
    if (logo) formData.append('logo', logo);
    formData.append('siteName', siteName);
    formData.append('siteUrl', siteUrl);

    axios.post('/api/settings', formData)
      .then(response => alert('Changes saved'))
      .catch(error => console.error('Error saving changes:', error));
  };

  const handleAddAdmin = () => {
    if (selectedEmployee) {
      axios.post('/api/add-admin', { employeeId: selectedEmployee.id })
        .then(() => alert('Admin added successfully'))
        .catch(err => console.error(err));
    }
    closeModal();
  };

  const handleAddEmployee = () => {
    if (selectedUser) {
      axios.post('/api/add-employee', { userId: selectedUser.id })
        .then(() => alert('Employee added successfully'))
        .catch(err => console.error(err));
    }
    closeModal();
  };

  const handleRemoveAdmin = (adminId: number) => {
    axios.post('/api/remove-admin', { adminId })
      .then(() => alert('Admin removed successfully'))
      .catch(err => console.error(err));
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        onAddAdminClick={handleAddAdminClick}
        onAddEmployeeClick={handleAddEmployeeClick}
        onViewAdminsClick={handleViewAdminsClick}
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        isAdmin={true} // Set this based on the logged-in user's role
      />

      {/* Main Content */}
      <div className={`flex-1 p-6 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all`}>
        <button
          onClick={() => router.back()}
          className="mb-6 text-white hover:bg-blue-600 bg-blue-800 py-2 px-4 rounded-full flex items-center"
        >
          <ArrowBack className="mr-2" /> Back
        </button>
        <h1 className="text-3xl font-bold text-center mt-4 mb-6">Dashboard Settings</h1>
        <div className="grid gap-6">
          {/* Profile Image */}
          <div className=' '>
            <h2 className="text-xl font-semibold mb-4">Profile Image</h2>
            <div className="relative flex items-center">
              <Image
                src={profileImage ? URL.createObjectURL(profileImage) : "/images/default.png"}
                alt="Profile Image"
                width={150}
                height={150}
                className="rounded-full border-4 border-blue-500 object-cover"
              />
              <label htmlFor="profileImageUpload" className="absolute bottom-0 right-0 p-1 bg-blue-500 rounded-full cursor-pointer">
                <PencilIcon className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  id="profileImageUpload"
                  onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Site Settings */}
          <div className='flex-col md:flex-row  items-center'>
            <h2 className="text-xl font-semibold mb-4">Site Settings</h2>
            <input
              type="text"
              placeholder="Site Name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="mb-4 p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="text"
              placeholder="Site URL"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="mb-4 p-2 border border-gray-300 rounded w-full"
            />
            <div className="mb-4">
              <label htmlFor="logoUpload" className="block mb-2 text-gray-700">Upload a new logo</label>
              <input
                type="file"
                accept="image/*"
                id="logoUpload"
                onChange={(e) => setLogo(e.target.files?.[0] || null)}
                className="block"
              />
            </div>
            <button
              onClick={saveChanges}
              className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal open={modalOpen === 'addAdmin'} onClose={closeModal} title="Add Admin">
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Employee</h3>
          <Autocomplete
            options={employees}
            getOptionLabel={(option) => option.name}
            onChange={(event, value) => setSelectedEmployee(value)}
            renderInput={(params) => <TextField {...params} label="Search Employee" variant="outlined" fullWidth />}
          />
          {selectedEmployee && (
            <div className="mt-4">
              <p>Selected Employee: {selectedEmployee.name}</p>
              <button
                onClick={handleAddAdmin}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Add as Admin
              </button>
            </div>
          )}
        </div>
      </Modal>

      <Modal open={modalOpen === 'addEmployee'} onClose={closeModal} title="Add Employee">
        <div>
          <h3 className="text-lg font-semibold mb-4">Select User</h3>
          <Autocomplete
            options={users}
            getOptionLabel={(option) => option.name}
            onChange={(event, value) => setSelectedUser(value)}
            renderInput={(params) => <TextField {...params} label="Search User" variant="outlined" fullWidth />}
          />
          {selectedUser && (
            <div className="mt-4">
              <p>Selected User: {selectedUser.name}</p>
              <button
                onClick={handleAddEmployee}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
              >
                Add as Employee
              </button>
            </div>
          )}
        </div>
      </Modal>

      <Modal open={modalOpen === 'viewAdmins'} onClose={closeModal} title="All Admins">
        <div>
          <h3 className="text-lg font-semibold mb-4">Admins</h3>
          {/* Render the list of admins */}
          {admins.map(admin => (
            <div key={admin.id} className="flex items-center justify-between p-2 border-b border-gray-300">
              <span>{admin.name}</span>
              <button
                onClick={() => handleRemoveAdmin(admin.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
