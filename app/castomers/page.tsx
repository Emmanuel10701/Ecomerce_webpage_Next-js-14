'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '@/components/spinner/page';
import Sidebar from '@/components/sidebar/page';
import { FaSync, FaEnvelope, FaFilePdf, FaEllipsisV, FaTrash } from 'react-icons/fa';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import moment from 'moment';

interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  userId: string;
  role: string;
}

const PAGE_SIZE = 10;

const CustomerPage: React.FC = () => {
  const [castomers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
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

  // Fetch castomers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/castomers');
      setCustomers(response.data);
      setTotalPages(Math.ceil(response.data.length / PAGE_SIZE));
      setFilteredCustomers(response.data.slice(0, PAGE_SIZE));
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch castomers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCustomers();
    }
  }, [session]);

  // Check if the user is an admin
  const isAdmin = session?.user?.role === 'admin';

  // Handle email modal and actions
  const handleEmailAll = () => {
    if (isAdmin) {
      setIsEmailModalOpen(true);
      setDropdownOpen(false);
    } else {
      toast.error('You do not have permission to send emails.');
    }
  };

  const sendEmailContent = async () => {
    try {
      await axios.post('/api/send-email', {
        emails: filteredCustomers.map(customer => customer.email).join(','),
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
        { text: 'Customers Report', style: 'header' },
        {
          text: 'This report includes detailed information about all castomers.',
          style: 'intro',
        },
        {
          text: 'Customers Information:',
          style: 'subheader',
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
            body: [
              ['Name', 'Email', 'Phone Number', 'Address', 'User ID', 'Role'],
              ...filteredCustomers.map(customer => [
                customer.name,
                customer.email,
                customer.phoneNumber,
                customer.address,
                customer.userId,
                customer.role,
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
    pdfMake.createPdf(docDefinition).download('castomers_report.pdf');
    setDropdownOpen(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCustomers().finally(() => setIsRefreshing(false));
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    const filtered = castomers.filter(customer =>
      customer.name.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setFilteredCustomers(filtered.slice(0, PAGE_SIZE));
    setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
    setCurrentPage(1);
  };

  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = page * PAGE_SIZE;
    setFilteredCustomers(castomers.slice(startIndex, endIndex));
    setCurrentPage(page);
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await axios.delete(`/api/customers/${id}`);
      toast.success('Customer deleted successfully!');
      // Refresh customer list or remove customer from state
      fetchCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
      toast.error('Failed to delete customer.');
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
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} className='md:hidden' />
      <div className={`flex transition-all duration-300 ${isSidebarOpen ? 'ml-[25%]' : 'ml-[2%]'} px-4 md:px-8 py-4`}>
        <div className="flex-1">
          <div className="mb-4 flex flex-col md:flex-row items-center justify-between">
            <h1 className="text-2xl text-purple-400 mt-6 font-bold">Customers List</h1>
            <div className="relative flex items-center space-x-4 md:space-x-4">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by name"
                className="p-2 border border-gray-300 focus:outline-1 focus:bg-slate-100 rounded-md"
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
                    {isAdmin && (
                      <button
                        onClick={handleEmailAll}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 transition duration-300 flex items-center"
                      >
                        <FaEnvelope className="mr-2 text-green-500" />
                        Email All
                      </button>
                    )}
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
                  className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700 transition duration-300 flex items-center"
                >
                  <FaSync className="mr-2" />
                  Refresh
                </button>
                  <button
                    onClick={handleEmailAll}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-300 flex items-center"
                  >
                    <FaEnvelope className="mr-2" />
                    Email All
                  </button>
                <button
                  onClick={exportToPDF}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-300 flex items-center"
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
            <div>
              <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-md">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-sm">Name</th>
                    <th className="py-2 px-4 border-b text-sm">Email</th>
                    <th className="py-2 px-4 border-b text-sm">Phone Number</th>
                    <th className="py-2 px-4 border-b text-sm">Address</th>
                    <th className="py-2 px-4 border-b text-sm">User ID</th>
                    <th className="py-2 px-4 border-b text-sm">Role</th>
                    {isAdmin && <th className="py-2 px-4 border-b text-sm">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer, index) => (
                    <tr
                      key={customer.id}
                      onClick={() => handleRowClick(customer)}
                      className={`cursor-pointer hover:bg-white ${index % 2 === 0 ? 'bg-green-100' : 'bg-slate-100'}`}
                    >
                      <td className="py-2 px-4 border-b text-sm">{customer.name}</td>
                      <td className="py-2 px-4 border-b text-sm">{customer.email}</td>
                      <td className="py-2 px-4 border-b text-sm">{customer.phoneNumber}</td>
                      <td className="py-2 px-4 border-b text-sm">{customer.address}</td>
                      <td className="py-2 px-4 border-b text-sm">{customer.userId}</td>
                      <td className="py-2 px-4 border-b text-sm">{customer.role}</td>
                      {isAdmin && (
                        <td className="py-2 px-4 border-b text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomer(customer.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

     {/* Customer Details Modal */}
{isDetailModalOpen && selectedCustomer && (
  <div
    ref={modalRef}
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
      <h2 className="text-xl font-bold mb-4">Customer Details</h2>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Name</h3>
        <p className="text-gray-700">{selectedCustomer.name}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Email</h3>
        <p className="text-gray-700">{selectedCustomer.email}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Phone Number</h3>
        <p className="text-gray-700">{selectedCustomer.phoneNumber}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Address</h3>
        <p className="text-gray-700">{selectedCustomer.address}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">User ID</h3>
        <p className="text-gray-700">{selectedCustomer.userId}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Role</h3>
        <p className="text-gray-700">{selectedCustomer.role}</p>
      </div>
      <div className="flex justify-between items-center">
        <button
          onClick={() => setIsDetailModalOpen(false)}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
        >
          Close
        </button>
        <button
          onClick={handleDeleteCustomer}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}


      {/* Email Modal */}
      {isEmailModalOpen && (
        <div
          ref={modalRef}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Send Email to All Customers</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email-subject">
                Subject
              </label>
              <input
                id="email-subject"
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="p-2 border border-gray-300 w-full rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email-body">
                Body
              </label>
              <textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="p-2 border border-gray-300 w-full h-32 rounded-md"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={sendEmailContent}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300 mr-2"
              >
                Send Email
              </button>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default CustomerPage;

