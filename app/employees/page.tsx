"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import moment from 'moment';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '@/components/spinner/page';
import Sidebar from '@/components/sidebar/page';
import { FaSync, FaEnvelope, FaFilePdf, FaEllipsisV } from 'react-icons/fa';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: string;
}

const PAGE_SIZE = 10;

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: session, status } = useSession();

  const handleLogin = () => {
    router.push("/login");
  };

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }
    
    if (!session) {
      return;
    }
    
    setLoading(false);
  }, [session, status]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/employees');
      setUsers(response.data);
      setTotalPages(Math.ceil(response.data.length / PAGE_SIZE));
      setFilteredUsers(response.data.slice(0, PAGE_SIZE));
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUsers();
    }
  }, [session]);

  const handleEmailAll = () => {
    setIsEmailModalOpen(true);
    setDropdownOpen(false);
  };

  const sendEmailContent = async () => {
    try {
      await axios.post('/api/send-email', {
        emails: filteredUsers.map(user => user.email).join(','),
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
            widths: ['*', '*', '*', '*'],
            body: [
              ['Name', 'Email', 'Date Joined', 'Role'],
              ...filteredUsers.map(user => [
                user.name,
                user.email,
                moment(user.createdAt).format('YYYY-MM-DD'),
                user.role,
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
    setDropdownOpen(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers().finally(() => setIsRefreshing(false));
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setFilteredUsers(filtered.slice(0, PAGE_SIZE));
    setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = page * PAGE_SIZE;
    setFilteredUsers(users.slice(startIndex, endIndex));
    setCurrentPage(page);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="mb-6">You need to log in to access this page.</p>
          <button 
            onClick={handleLogin} 
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
          >
            Go to Login Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="bg-white flex transition-all duration-300 min-h-screen p-4 md:p-8">
        <div className="w-full flex-1">
          <div className="mb-4 flex flex-col md:flex-row items-center justify-between">
            <h1 className="text-2xl text-purple-400 mt-6 font-bold">Employees List</h1>
            <div className="relative flex items-center space-x-4">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by name"
                className="p-2 border border-gray-300 focus:outline-none focus:bg-slate-100 rounded-md"
              />
              {/* Small device dropdown */}
              <div className="md:hidden" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition duration-300"
                >
                  <FaEllipsisV />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-48">
                    <button
                      onClick={handleRefresh}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 transition duration-300 flex items-center"
                    >
                      <FaSync className="mr-2 text-blue-500" />
                      Refresh
                    </button>
                    <button
                      onClick={handleEmailAll}
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
              {/* Desktop buttons */}
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={handleRefresh}
                  className="bg-purple-300 text-white px-4 py-2 rounded hover:bg-purple-400 transition duration-300"
                >
                  <FaSync className="inline-block mr-2" />
                  Refresh
                </button>
                <button
                  onClick={handleEmailAll}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                >
                  <FaEnvelope className="inline-block mr-2" />
                  Email All
                </button>
                <button
                  onClick={exportToPDF}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                >
                  <FaFilePdf className="inline-block mr-2" />
                  Export as PDF
                </button>
              </div>
            </div>
          </div>

          {/* Display Users List or Loading */}
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="bg-white shadow-md rounded-lg p-4 border border-gray-300">
                    <h2 className="text-xl font-semibold text-gray-700">{user.name}</h2>
                    <p className="text-gray-500">{user.email}</p>
                    <p className="text-gray-400 text-sm">Joined: {moment(user.createdAt).format('YYYY-MM-DD')}</p>
                    <p className="text-gray-500">Role: {user.role}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-l"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-r"
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
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div ref={modalRef} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Send Email</h2>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Subject"
              className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:bg-slate-100"
            />
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Message"
              className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:bg-slate-100"
              rows={5}
            ></textarea>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={sendEmailContent}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
};

export default UsersPage;
