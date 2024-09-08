'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import moment from 'moment';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '@/components/spinner/page';
import Sidebar from '@/components/sidebar/page';
import { FaSync, FaEnvelope, FaFilePdf, FaEllipsisV, FaTrash } from 'react-icons/fa';
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

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Authentication
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

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
      setTotalPages(Math.ceil(response.data.length / PAGE_SIZE));
      setFilteredEmployees(response.data.slice(0, PAGE_SIZE));
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchEmployees();
    }
  }, [session]);

  // Handle email modal and actions
  const handleEmailAll = () => {
    setIsEmailModalOpen(true);
    setDropdownOpen(false);
  };

  const sendEmailContent = async () => {
    try {
      await axios.post('/api/send-email', {
        emails: filteredEmployees.map(user => user.email).join(','),
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
        { text: 'Employees Report', style: 'header' },
        {
          text: 'This report includes detailed information about all employees.',
          style: 'intro',
        },
        {
          text: 'Employees Information:',
          style: 'subheader',
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'],
            body: [
              ['Name', 'Email', 'Date Joined', 'Role'],
              ...filteredEmployees.map(user => [
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
    pdfMake.createPdf(docDefinition).download('employees_report.pdf');
    setDropdownOpen(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEmployees().finally(() => setIsRefreshing(false));
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    const filtered = employees.filter(user =>
      user.name.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setFilteredEmployees(filtered.slice(0, PAGE_SIZE));
    setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = page * PAGE_SIZE;
    setFilteredEmployees(employees.slice(startIndex, endIndex));
    setCurrentPage(page);
  };

  // Remove employee
  const handleRemoveEmployee = async (userId: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/employees/${userId}`);
      toast.success('Employee removed successfully');
      // Refresh the list after removal
      fetchEmployees();
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove employee');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="mb-6">You need to log in or register to access this page.</p>
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
      <div className={`flex transition-all duration-300 ${isSidebarOpen ? 'ml-[25%]' : 'ml-[2%]'} px-4 md:px-8 py-4`}>
        <div className="flex-1">
          <div className="mb-4 flex flex-col md:flex-row items-center justify-between">
            <h1 className="text-2xl text-purple-400 mt-6 font-bold">Employees List</h1>
            <div className="relative flex items-center space-x-4 md:space-x-4">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by name"
                className="p-2 border border-gray-300 focus:outline-1 bg-slate-100 rounded-md"
              />
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
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={handleRefresh}
                  className="bg-blue-500 text-white py-1.5 px-3 rounded-full hover:bg-blue-600 transition duration-300 flex items-center"
                >
                  <FaSync className="mr-2" />
                  Refresh
                </button>
                <button
                  onClick={handleEmailAll}
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
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <table className="w-full border-collapse border border-gray-300 bg-white rounded-md shadow-md">
                <thead className="bg-gray-200 text-gray-600">
                  <tr>
                    <th className="border-b border-gray-300 p-3 text-left text-sm font-semibold">Name</th>
                    <th className="border-b border-gray-300 p-3 text-left text-sm font-semibold">Email</th>
                    <th className="border-b border-gray-300 p-3 text-left text-sm font-semibold">Date Joined</th>
                    <th className="border-b border-gray-300 p-3 text-left text-sm font-semibold">Role</th>
                    <th className="border-b border-gray-300 p-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">No Employees found</td>
                    </tr>
                  ) : (
                    filteredEmployees.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`hover:bg-gray-50 ${
                          index % 2 === 0 ? 'bg-purple-100' : 'bg-blue-100'
                        }`}
                      >
                        <td className="border-b border-gray-300 p-3 text-sm">{user.name}</td>
                        <td className="border-b border-gray-300 p-3 text-sm">{user.email}</td>
                        <td className="border-b border-gray-300 p-3 text-sm">{moment(user.createdAt).fromNow()}</td>
                        <td className="border-b border-gray-300 p-3 text-sm">{user.role}</td>
                        <td className="border-b border-gray-300 p-3 text-sm">
                          <button
                            onClick={() => handleRemoveEmployee(user.id)}
                            className="bg-red-500 text-white py-1 px-2 rounded-full hover:bg-red-600 transition duration-300 flex items-center"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-300 text-gray-600 py-1 px-3 rounded-md hover:bg-gray-400 transition duration-300"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-gray-300 text-gray-600 py-1 px-3 rounded-md hover:bg-gray-400 transition duration-300"
                >
                  Next
                </button>
              </div>
            </>
          )}
          {isEmailModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50" ref={modalRef}>
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <h2 className="text-xl font-bold mb-4">Send Email to Employees</h2>
                <label className="block mb-2">
                  <span className="text-gray-700">Subject:</span>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </label>
                <label className="block mb-4">
                  <span className="text-gray-700">Body:</span>
                  <textarea
                    value={emailBody}
                    onChange={e => setEmailBody(e.target.value)}
                    rows={5}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
          <ToastContainer />
        </div>
      </div>
    </>
  );
};

export default EmployeesPage;
