"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaSearch, FaSync, FaFilePdf, FaEllipsisV, FaEnvelope } from 'react-icons/fa';
import LoadingSpinner from '@/components/spinner/page'; // Import Loading Spinner
import Sidebar from '@/components/sidebar/page'; // Import Sidebar
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces'; // Import TDocumentDefinitions
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  image: string;
  dateJoined: string;
}

const PAGE_SIZE = 5; // Number of items per page

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown menu
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for dropdown
  const modalRef = useRef<HTMLDivElement>(null); // Ref for modal

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users?page=${page}&limit=${rowsPerPage}`);
      setUsers(response.data.users); // Adjust based on the response structure
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch users.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const handleChangePage = (newPage: number) => {
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
              ['Image', 'Name', 'Email', 'Role', 'Date Joined'],
              ...filteredUsers.map(user => [
                { image: user.image, width: 50, height: 50 },
                user.name,
                user.email,
                user.role,
                moment(user.dateJoined).format('YYYY-MM-DD'),
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
          color: '#00796b', // Teal color
          margin: [0, 0, 0, 10],
        },
        intro: {
          fontSize: 12,
          margin: [0, 0, 0, 20],
          color: '#555', // Dark gray
        },
        subheader: {
          fontSize: 18,
          bold: true,
          color: '#004d40', // Darker teal color
          margin: [0, 20, 0, 10],
        },
      },
      pageMargins: [40, 60, 40, 60], // Custom margins for better layout
      defaultStyle: {
        font: 'Roboto', // Ensure this is available or use a standard font
      },
    };

    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    pdfMake.createPdf(docDefinition).download('users_report.pdf');
    setDropdownOpen(false);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsEmailModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`flex ${isSidebarOpen ? 'ml-[25%]' : 'ml-0'} transition-all`}>
        <div className="flex-1 p-4">
          <div className="mb-4 flex flex-col md:flex-row items-center justify-between">
            <h1 className="text-2xl text-purple-400 font-bold">Users List</h1>
            <div className="relative flex items-center space-x-4">
              {/* Dropdown for small screens */}
              <div className="md:hidden" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition duration-300 flex items-center"
                >
                  <FaEllipsisV />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-48">
                    <button
                      onClick={fetchUsers}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 transition duration-300 flex items-center"
                    >
                      <FaSync className="mr-2 text-blue-500" />
                      Refresh
                    </button>
                    <button
                      onClick={() => setIsEmailModalOpen(true)}
                      className="w-full text-left px-4 py-2 hover:bg-green-50 transition duration-300 flex items-center"
                    >
                      <FaEnvelope className="mr-2 text-green-500" />
                      Email All
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 transition duration-300 flex items-center"
                    >
                      <FaFilePdf className="mr-2 text-red-500" />
                      Export as PDF
                    </button>
                  </div>
                )}
              </div>
              {/* Buttons for larger screens */}
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={fetchUsers}
                  className="bg-blue-500 text-white py-1.5 px-3 rounded-full hover:bg-blue-600 transition duration-300 flex items-center"
                >
                  <FaSync className="mr-2" />
                  Refresh
                </button>
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="bg-green-500 text-white py-1.5 px-3 rounded-full hover:bg-green-600 transition duration-300 flex items-center"
                >
                  <FaEnvelope className="mr-2" />
                  Email All
                </button>
                <button
                  onClick={exportToPDF}
                  className="bg-red-500 text-white py-1.5 px-3 rounded-full hover:bg-red-600 transition duration-300 flex items-center"
                >
                  <FaFilePdf className="mr-2" />
                  Export as PDF
                </button>
              </div>
            </div>
            <div className="relative flex items-center mt-4 md:mt-0">
              <input
                type="text"
                placeholder="Search..."
                className="border border-gray-300 rounded-md py-2 px-3 w-full md:w-2/5 lg:w-1/5"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="text-gray-500 absolute right-2 top-2" />
            </div>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">Image</th>
                    <th className="border border-gray-300 p-2">Name</th>
                    <th className="border border-gray-300 p-2">Email</th>
                    <th className="border border-gray-300 p-2">Role</th>
                    <th className="border border-gray-300 p-2">Date Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-4">No users found</td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td className="border border-gray-300 p-2">
                          <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full" />
                        </td>
                        <td className="border border-gray-300 p-2">{user.name}</td>
                        <td className="border border-gray-300 p-2">{user.email}</td>
                        <td className="border border-gray-300 p-2">{user.role}</td>
                        <td className="border border-gray-300 p-2">{moment(user.dateJoined).format('YYYY-MM-DD')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handleChangePage(page - 1)}
                  disabled={page === 0}
                  className="bg-gray-300 text-gray-700 py-1 px-3 rounded-full hover:bg-gray-400 transition duration-300"
                >
                  Previous
                </button>
                <span className="text-lg">Page {page + 1}</span>
                <button
                  onClick={() => handleChangePage(page + 1)}
                  disabled={filteredUsers.length < rowsPerPage}
                  className="bg-gray-300 text-gray-700 py-1 px-3 rounded-full hover:bg-gray-400 transition duration-300"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50" ref={modalRef}>
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Send Email to Users</h2>
            <label className="block mb-2">
              <span className="text-gray-700">Subject:</span>
              <input
                type="text"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              />
            </label>
            <label className="block mb-4">
              <span className="text-gray-700">Body:</span>
              <input
                type="text"
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              />
            </label>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="bg-gray-500 text-white py-1 px-3 rounded-full hover:bg-gray-600 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={sendEmailContent}
                className="bg-blue-500 text-white py-1 px-3 rounded-full hover:bg-blue-600 transition duration-300"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default UserTable;
