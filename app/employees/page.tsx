"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react'; // Add useRef here
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSearch, FaSync, FaEnvelope, FaFilePdf, FaEllipsisV, FaTrash } from 'react-icons/fa';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, TablePagination, Button } from '@mui/material';
import LoadingSpinner from '@/components/spinner/page';
import Sidebar from '@/components/sidebar/page';
import ConfirmationModal from '@/components/modal/page';
import AddEmployeeModal from '@/components/modal2/page'; // Import if you have an AddEmployeeModal component
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';


// Define User type
interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  image: string;
  dateJoined: string;
}

const PAGE_SIZE = 10; // Number of items per page

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handlePageChange = useCallback((event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmailAll = () => {
    setIsEmailModalOpen(true);
    if (dropdownRef.current) {
      dropdownRef.current.classList.remove('open');
    }
  };

  const sendEmailContent = async () => {
    try {
      await axios.post('/api/send-email', {
        emails: users.map(user => user.email).join(','),
        subject: emailSubject,
        body: emailBody,
      });
      toast.success('Email sent successfully!');
      setIsEmailModalOpen(false);
      setEmailSubject('');
      setEmailBody('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send email.');
    }
  };

  const exportToPDF = () => {
    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Users Report', style: 'header' },
        {
          text: 'This report includes detailed information about all users.',
          style: 'intro',
        },
        {
          text: 'Users Information:',
          style: 'subheader',
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'],
            body: [
              ['Name', 'Email', 'Role', 'Date Joined', 'Image'],
              ...users.map(user => [
                user.name,
                user.email,
                user.role,
                moment(user.dateJoined).format('YYYY-MM-DD'),
                { image: user.image, width: 50, height: 50 }
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
        },
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          color: '#00796b',
          margin: [0, 0, 0, 10],
        },
        intro: {
          fontSize: 12,
          margin: [0, 0, 0, 20],
          color: '#555',
        },
        subheader: {
          fontSize: 18,
          bold: true,
          color: '#004d40',
          margin: [0, 20, 0, 10],
        },
      },
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: 'Roboto',
      },
    };
  
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    pdfMake.createPdf(docDefinition).download('users_report.pdf');
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

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className={`flex-1 p-4 ${isSidebarOpen ? 'ml-[25%]' : 'ml-0'} bg-gray-100 flex items-center justify-center`}>
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`flex-1 p-4 ${isSidebarOpen ? 'ml-[25%]' : 'ml-0'} bg-gray-100`}>
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
        <TableContainer component="div" style={{ boxShadow: 'none', border: 'none' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ borderBottom: 'none' }} className="hidden md:table-cell text-slate-500 text-lg font-bold">Image</TableCell>
                <TableCell style={{ borderBottom: 'none' }} className='text-slate-500 text-lg font-bold'>Name</TableCell>
                <TableCell style={{ borderBottom: 'none' }} className='text-slate-500 text-lg font-bold'>Email</TableCell>
                <TableCell style={{ borderBottom: 'none' }} className='text-slate-500 text-lg font-bold'>Role</TableCell>
                <TableCell style={{ borderBottom: 'none' }} className='text-slate-500 text-lg font-bold'>Date Joined</TableCell>
                <TableCell style={{ borderBottom: 'none' }} className='text-slate-500 text-lg font-bold'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="hidden md:table-cell">
                    <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{moment(user.dateJoined).format('YYYY-MM-DD')}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleOpenModal(user)} className="text-red-500"><FaTrash /></Button>
                    <Button onClick={handleEmailAll} className="text-blue-500 ml-2"><FaEnvelope /></Button>
                    <Button onClick={exportToPDF} className="text-green-500 ml-2"><FaFilePdf /></Button>
                    <Button className="text-gray-500 ml-2" ref={dropdownRef}><FaEllipsisV /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[PAGE_SIZE]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <ToastContainer />
        <ConfirmationModal
          open={openModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          message={`Are you sure you want to delete user ${userToDelete?.name}?`}
        />
        <AddEmployeeModal
          open={openAddModal}
          onClose={handleCloseAddModal}
          onAdd={handleAddUser}
        />
        <div ref={modalRef}>
          {isEmailModalOpen && (
            <div className="modal">
              <h2 className="text-lg font-bold mb-2">Send Email</h2>
              <TextField
                label="Subject"
                fullWidth
                margin="normal"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
              <TextField
                label="Body"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <Button onClick={sendEmailContent} className="mr-2" variant="contained" color="primary">Send</Button>
                <Button onClick={() => setIsEmailModalOpen(false)} variant="outlined" color="secondary">Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default React.memo(UserTable);
