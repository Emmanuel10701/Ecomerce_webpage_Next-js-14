"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaTrash } from 'react-icons/fa';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, TablePagination, Button } from '@mui/material';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/spinner/page';
import Sidebar from '@/components/sidebar/page';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmationModal from '@/components/modal/page';
import AddEmployeeModal from '@/components/modal2/page'; // Import if you have an AddEmployeeModal component

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  image: string;
  dateJoined: string;
}

const UserTable: React.FC = () => {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/workers.json')
      .then(response => response.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setLoading(false);
      });
  }, []);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUser = (userId: number) => {
    router.push(`/workers/${userId}`);
    setIsSidebarOpen(false);
  };

  const handleOpenModal = (user: User) => {
    setUserToDelete(user);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
      toast.success('User deleted successfully!');
      handleCloseModal();
    }
  };

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleAddUser = (newUser: User) => {
    setUsers(prevUsers => [...prevUsers, newUser]);
    toast.success('User added successfully!');
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 bg-gray-100 flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center w-2/3 min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="mb-6">You need to log in or register to access this page.</p>
          <button 
            onClick={() => router.push("/login")} 
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
          >
            Go to Login Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen -hidden">
       <Sidebar className={`md:w-[25%] ${isSidebarOpen ? 'block' : 'hidden'}`} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className={`flex-1 p-4 ${isSidebarOpen ? 'ml-[25%]' : 'ml-0'} bg-gray-100 overflow-y-auto`}> {/* Make sure the main content is scrollable */}
          <div className="mb-4 flex justify-between items-center">
          <TextField
            variant="outlined"
            placeholder="Search users..."
            size="small"
            fullWidth
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <FaSearch className="text-gray-300 mr-2" />
              ),
            }}
          />
          <Button
            onClick={handleOpenAddModal}
            className="text-sm text-white ml-8 bg-slate-800 rounded-md px-2 py-1"
          >
            Add
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <TableContainer component="div" style={{ boxShadow: 'none', border: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ borderBottom: 'none' }} className="hidden md:table-cell text-slate-500 text-lg font-bold">Image</TableCell>
                    <TableCell style={{ borderBottom: 'none' }} className='text-slate-500 text-lg font-bold'>Name</TableCell>
                    <TableCell style={{ borderBottom: 'none' }}className='text-slate-500 text-lg font-bold'>Email</TableCell>
                    <TableCell style={{ borderBottom: 'none' }}className='text-slate-500 text-lg font-bold'>Role</TableCell>
                    <TableCell style={{ borderBottom: 'none' }}className='text-slate-500 text-lg font-bold'>Date Joined</TableCell>
                    <TableCell style={{ borderBottom: 'none' }} className="hidden md:table-cell text-slate-500 text-lg font-bold">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(user => (
                    <TableRow key={user.id}>
                      <TableCell style={{ borderBottom: 'none' }} className="hidden md:table-cell">
                        <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full" />
                      </TableCell>
                      <TableCell style={{ borderBottom: 'none' }} className='text-slate-500 text-md font-semibold'>{user.name}</TableCell>
                      <TableCell style={{ borderBottom: 'none' }}className='text-slate-500 text-md font-semibold'>user.email}</TableCell>
                      <TableCell style={{ borderBottom: 'none' }}className='text-slate-500 text-md font-semibold'>{user.role}</TableCell>
                      <TableCell style={{ borderBottom: 'none' }}className='text-slate-500 text-md font-semibold'>{new Date(user.dateJoined).toLocaleDateString()}</TableCell>
                      <TableCell style={{ borderBottom: 'none' }} className="hidden md:table-cell text-center text-slate-500 text-md font-semibold">
                        <FaTrash 
                          className="text-red-500 cursor-pointer" 
                          onClick={() => handleOpenModal(user)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <div className="flex justify-center mt-4 mb-24"> {/* Increased margin-bottom here */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                style={{ borderTop: 'none' }} // Remove top border from pagination
              />
            </div>
          </>
        )}

        <ToastContainer />
        {userToDelete && (
          <ConfirmationModal
            open={openModal}
            onClose={handleCloseModal}
            onConfirm={handleConfirmDelete}
            user={userToDelete}
          />
        )}
        <AddEmployeeModal
          open={openAddModal}
          onClose={handleCloseAddModal}
          onAdd={handleAddUser}
        />
      </main>
    </div>
  );
};

export default UserTable;
