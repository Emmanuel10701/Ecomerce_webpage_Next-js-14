"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '@/components/spinner/page'; 
import Sidebar from '@/components/sidebar/page'; // Import Sidebar
import moment from 'moment';
import { FaSync, FaEnvelope, FaFilePdf, FaEllipsisV } from 'react-icons/fa'; // Import additional icons
import { useRouter } from 'next/navigation';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces'; // Import TDocumentDefinitions

// Define the User type
interface User {
  id: number;
  email: string;
  dateAdded: string; // Assuming date is in ISO format
}

const PAGE_SIZE = 10; // Number of items per page

const SubscribersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown menu
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for dropdown
  const modalRef = useRef<HTMLDivElement>(null); // Ref for modal
  const router = useRouter();

  // Function to fetch users
  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/subscribers?page=${page}&limit=${PAGE_SIZE}`); // Update with your API endpoint
      setUsers(response.data.users); // Adjust based on the response structure
      setTotalUsers(response.data.total); // Assuming the API returns total user count
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch subscribers.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

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

  // Function to handle email button click
  const handleEmailAll = () => {
    setIsEmailModalOpen(true);
    setDropdownOpen(false);
  };

  // Function to send email
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

  // Function to generate and download PDF
  const exportToPDF = () => {
    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Subscribers Report', style: 'header' },
        {
          text: 'This report includes detailed information about all subscribers.',
          style: 'intro',
        },
        {
          text: 'Subscribers Information:',
          style: 'subheader',
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*'],
            body: [
              ['Email', 'Date Added'],
              ...users.map(user => [
                user.email,
                moment(user.dateAdded).format('YYYY-MM-DD'),
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
    pdfMake.createPdf(docDefinition).download('subscribers_report.pdf');
    setDropdownOpen(false);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setLoading(true); // Set loading to true when refreshing
    setTimeout(() => {
      fetchUsers(currentPage);
      setIsRefreshing(false);
      setLoading(false); // Reset loading after refreshing
    }, 1000);
  };

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`flex transition-all ${isSidebarOpen ? 'ml-[25%]' : 'ml-0'}`}>
        <div className="flex-1 p-4">
          <div className="mb-4 flex flex-col md:flex-row items-center justify-between">
            <h1 className="text-2xl text-purple-400 font-bold">Subscribers List</h1>
            <div className="relative flex items-center space-x-4 md:space-x-4">
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
              {/* Buttons for larger screens */}
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
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="border border-gray-300 p-2">Email</th>
                    <th className="border border-gray-300 p-2">Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center p-4">No subscribers found</td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id}>
                        <td className="border border-gray-300 p-2">{user.email}</td>
                        <td className="border border-gray-300 p-2">
                          {moment(user.dateAdded).fromNow()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-300 text-gray-700 py-1 px-3 rounded-full hover:bg-gray-400 transition duration-300"
                >
                  Previous
                </button>
                <span className="text-lg">Page {currentPage}</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={users.length < PAGE_SIZE}
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
            <h2 className="text-xl font-bold mb-4">Send Email to Subscribers</h2>
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
    </>
  );
};

export default SubscribersPage;
