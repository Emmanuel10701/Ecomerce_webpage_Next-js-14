"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import { Autocomplete, TextField, CircularProgress, Snackbar, Alert, Button } from '@mui/material';
import Sidebar from '@/components/sidebarSetting/page';
import { PencilIcon, XMarkIcon, Bars3Icon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ open, onClose, title, children }) => (
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

const Settings: React.FC = () => {
  const router = useRouter();
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState<string>('');
  const [employees, setEmployees] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleAddAdminClick = () => setModalOpen('addAdmin');
  const handleAddEmployeeClick = () => setModalOpen('addEmployee');
  const handleViewAdminsClick = () => setModalOpen('viewAdmins');
  const closeModal = () => setModalOpen('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesResponse, usersResponse, adminsResponse] = await Promise.all([
          axios.get('/api/employees'),
          axios.get('/api/register'),
          axios.get('/api/admins')
        ]);

        setEmployees(employeesResponse.data);
        setUsers(usersResponse.data);
        setAdmins(adminsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const saveChanges = async () => {
    setLoading(true);
    const formData = new FormData();
    if (profileImage) formData.append('profileImage', profileImage);
    if (logo) formData.append('logo', logo);
    formData.append('siteName', siteName);
    formData.append('siteUrl', siteUrl);

    try {
      await axios.post('/api/settings', formData);
      setSnackbarMessage('Changes saved');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Error saving changes:', error);
      setSnackbarMessage('Error saving changes');
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleAddAdmin = async () => {
    if (selectedUser) {
      setLoading(true);
      try {
        await axios.post('/api/admins', { name: selectedUser.name, userId: selectedUser.id });
        setSnackbarMessage('Admin added successfully');
        setSnackbarSeverity('success');
      } catch (err: any) {
        console.error('Failed to add admin:', err.response?.data || err.message);
        setSnackbarMessage('Failed to add admin');
        setSnackbarSeverity('error');
      } finally {
        setLoading(false);
        closeModal();
        setSnackbarOpen(true);
      }
    }
  };

  const handleAddEmployee = async () => {
    if (selectedUser) {
      setLoading(true);
      try {
        await axios.post('/api/employees', { name: selectedUser.name, userId: selectedUser.id });
        setSnackbarMessage('Employee added successfully');
        setSnackbarSeverity('success');
      } catch (error) {
        console.error('Error adding employee:', error);
        setSnackbarMessage('Failed to add employee');
        setSnackbarSeverity('error');
      } finally {
        setLoading(false);
        closeModal();
        setSnackbarOpen(true);
      }
    }
  };

  const handleRemoveEmployee = async (userId: string) => {
    setLoading(true);
    try {
      await fetch(`/api/employees/${userId}`, { method: 'DELETE' });
      setSnackbarMessage('Employee removed successfully');
      setSnackbarSeverity('success');
    } catch (err) {
      console.error(err);
      setSnackbarMessage('Failed to remove employee');
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    setLoading(true);
    try {
      await fetch(`/api/admins/${adminId}`, { method: 'DELETE' });
      setSnackbarMessage('Admin removed successfully');
      setSnackbarSeverity('success');
    } catch (err) {
      console.error(err);
      setSnackbarMessage('Failed to remove admin');
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        onAddAdminClick={handleAddAdminClick}
        onAddEmployeeClick={handleAddEmployeeClick}
        onViewAdminsClick={handleViewAdminsClick}
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        isAdmin={true}
      />

      <div className={`flex-1 p-6 ${sidebarOpen ? 'ml-0' : 'ml-0'} bg-gray-100 relative`}>
        <button
          onClick={toggleSidebar}
          className="sm:hidden fixed top-4 left-4 p-2 bg-slate-200 text-black rounded-full shadow-lg z-50"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        <button
          onClick={() => router.back()}
          className="mb-6 text-white hover:bg-blue-600 bg-blue-800 py-2 px-4 rounded-full flex items-center"
        >
          <ArrowBack className="mr-2" /> Back
        </button>
        <h1 className="text-3xl font-bold text-center mt-4 mb-6">Dashboard Settings</h1>
        <div className="grid gap-6">
          <div className="flex items-center justify-center relative">
            <Image
              src={profileImage ? URL.createObjectURL(profileImage) : "/images/default.png"}
              alt="Profile Image"
              width={100}
              height={100}
              className="w-24 h-24 rounded-full border-2 border-blue-500 object-cover"
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

          <div className="flex-col md:flex-row items-center">
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
              className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded flex items-center"
              disabled={loading}
            >
              {loading && <CircularProgress size={20} className="mr-2" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <Modal open={modalOpen === 'addAdmin'} onClose={closeModal} title="Add Admin">
        <div>
          <h3 className="text-lg font-semibold mb-4">Select User</h3>
          <Autocomplete
            options={Array.isArray(users) ? users : []}
            getOptionLabel={(option) => `${option.name || 'Unknown'} (${option.email || 'No email'})`}
            value={selectedUser}
            onChange={(event, value) => setSelectedUser(value)}
            renderInput={(params) => <TextField {...params} label="Search User" variant="outlined" fullWidth />}
            renderOption={(props, option) => (
              <li {...props} style={{ fontWeight: selectedUser?.id === option.id ? 'bold' : 'normal' }}>
                {option.name || 'Unknown'} ({option.email || 'No email'})
                {admins.some(admin => admin.id === option.id) && (
                  <CheckCircleIcon className="w-5 h-5 text-yellow-500 ml-2" />
                )}
              </li>
            )}
          />
          {selectedUser && (
            <div className="mt-4">
              <p>Selected User: {selectedUser.name || 'Unknown'}</p>
              {!admins.some(admin => admin.id === selectedUser.id) ? (
                <button
                  onClick={handleAddAdmin}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
                  disabled={loading}
                >
                  {loading && <CircularProgress size={20} className="mr-2" />}
                  Add Admin
                </button>
              ) : (
                <button
                  onClick={() => handleRemoveAdmin(selectedUser.id)}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center"
                  disabled={loading}
                >
                  {loading && <CircularProgress size={20} className="mr-2" />}
                  Remove Admin
                </button>
              )}
            </div>
          )}
        </div>
      </Modal>

      <Modal open={modalOpen === 'addEmployee'} onClose={closeModal} title="Add Employee">
        <div>
          <h3 className="text-lg font-semibold mb-4">Select User</h3>
          <Autocomplete
            options={Array.isArray(users) ? users : []}
            getOptionLabel={(option) => `${option.name || 'Unknown'} (${option.email || 'No email'})`}
            value={selectedUser}
            onChange={(event, value) => setSelectedUser(value)}
            renderInput={(params) => <TextField {...params} label="Search User" variant="outlined" fullWidth />}
            renderOption={(props, option) => (
              <li {...props} style={{ fontWeight: selectedUser?.id === option.id ? 'bold' : 'normal' }}>
                {option.name || 'Unknown'} ({option.email || 'No email'})
                {employees.some(emp => emp.id === option.id) && (
                  <CheckCircleIcon className="w-5 h-5 text-green-500 ml-2" />
                )}
              </li>
            )}
          />
          {selectedUser && (
            <div className="mt-4">
              <p>Selected User: {selectedUser.name || 'Unknown'} ({selectedUser.email || 'No email'})</p>
              {employees.some(emp => emp.id === selectedUser.id) ? (
                <button
                  onClick={() => handleRemoveEmployee(selectedUser.id)}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center"
                  disabled={loading}
                >
                  {loading && <CircularProgress size={20} className="mr-2 text-white" />}
                  Remove Employee
                </button>
              ) : (
                <button
                  onClick={handleAddEmployee}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex items-center"
                  disabled={loading}
                >
                  {loading && <CircularProgress size={20} className="mr-2 text-white" />}
                  Add Employee
                </button>
              )}
            </div>
          )}
        </div>
      </Modal>

      <Modal open={modalOpen === 'viewAdmins'} onClose={closeModal} title="View Admins">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-center text-purple-600">Admin List</h3>
          {admins.length === 0 ? (
            <p className='text-slate-600 text-center'>No admins available.</p>
          ) : (
            <ul>
              {admins.map(admin => (
                <li key={admin.id} className="flex justify-between text-slate-600 font-bold items-center mb-2">
                  <span>{admin.name || 'Unknown'} ({admin.email || 'No email'})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      <Modal open={showAccessDenied} onClose={() => setShowAccessDenied(false)} title="Access Denied">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Access Denied</h2>
          <p className="mb-4">You are not permitted to perform this operation.</p>
          <Button
            onClick={() => setShowAccessDenied(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            OK
          </Button>
        </div>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Settings;
