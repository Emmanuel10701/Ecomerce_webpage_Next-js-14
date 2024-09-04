"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/spinner/page';
import Sidebar from '@/components/sidebar/page'; // Ensure the correct path

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  image: string;
  dateJoined: string;
  classname: string;
}

const defaultImage = '/assets/f.webp'; // Path to default image

const UserTable: React.FC = () => {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true); // Track loading state for users
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Manage sidebar state
  const router = useRouter();

  useEffect(() => {
    fetch('/users.json') // Adjust if you are fetching from a different endpoint
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
    router.push(`/user/${userId}`); // Ensure this matches the dynamic route in your app
    setIsSidebarOpen(false); // Close the sidebar when navigating
  };

  if (status === 'loading' || loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
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

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  return (
    <div className="flex flex-col md:ml-64 min-h-screen md:flex-row">
      <Sidebar className="md:w-[25%]" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} /> {/* Pass sidebar state as props */}
      
      <main className="flex-1 p-4 bg-gray-100">
        <div className="mb-4 flex justify-center">
          <div className="w-full max-w-md">
            <TextField
              variant="outlined"
              placeholder="Search users..."
              size="small"
              fullWidth
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <FaSearch className="text-gray-400" />
                ),
              }}
            />
          </div>
        </div>

        <TableContainer component="div" className="border-none shadow-none">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="hidden md:table-cell text-xl text-slate-500">Image</TableCell>
                <TableCell className="text-xl text-slate-500">Name</TableCell>
                <TableCell className="text-xl text-slate-500">Email</TableCell>
                <TableCell className="text-xl text-slate-500">Role</TableCell>
                <TableCell className="text-xl text-slate-500">Date Joined</TableCell>
                <TableCell className="hidden md:table-cell text-xl text-slate-500">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(user => (
                <TableRow key={user.id}>
                  <TableCell className="hidden md:table-cell">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => (e.currentTarget.src = defaultImage)} // Default image on error
                    />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{new Date(user.dateJoined).toLocaleDateString()}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <button
                      onClick={() => handleViewUser(user.id)}
                      className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 transition"
                    >
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleChangePage(null, 0)}
              className={`p-2 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center ${page === 0 ? 'bg-blue-500' : ''}`}
              disabled={page === 0}
            >
              &laquo;
            </button>
            {totalPages > 1 && (
              <>
                {page > 0 && (
                  <button
                    onClick={() => handleChangePage(null, page - 1)}
                    className="p-2 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center"
                  >
                    {page}
                  </button>
                )}
                {[page, page + 1].map((p) => (
                  p < totalPages && (
                    <button
                      key={p}
                      onClick={() => handleChangePage(null, p)}
                      className={`p-2 w-10 h-10 rounded-full ${page === p ? 'bg-blue-500' : 'bg-black'} text-white flex items-center justify-center`}
                    >
                      {p + 1}
                    </button>
                  )
                ))}
                {page < totalPages - 1 && (
                  <button
                    onClick={() => handleChangePage(null, page + 1)}
                    className="p-2 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center"
                  >
                    {page + 2}
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => handleChangePage(null, totalPages - 1)}
              className={`p-2 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center ${page === totalPages - 1 ? 'bg-blue-500' : ''}`}
              disabled={page === totalPages - 1}
            >
              &raquo;
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserTable;
