"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '@/components/spinner/page'; 
import Sidebar from '@/components/sidebar/page'; // Import Sidebar
import moment from 'moment';
import { FaSync, FaEnvelope } from 'react-icons/fa'; // Import icons
import { useRouter } from 'next/navigation';

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
      toast.error('Failed to fetch users.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  // Function to handle email button click
  const handleEmailAll = () => {
    setIsEmailModalOpen(true);
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
      <div className={`flex ${isSidebarOpen ? 'ml-[25%]' : ''} transition-all`}>
        <div className="flex-1 p-4 md:ml-64">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl text-purple-400 font-bold">Subscribers List</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="bg-blue-500 text-white py-1.5 px-3 rounded-full hover:bg-blue-600 transition duration-300 flex items-center"
              >
                Refresh
              </button>
              <button
                onClick={handleEmailAll}
                className="bg-green-500 text-white py-1.5 px-3 rounded-full hover:bg-green-600 transition duration-300 flex items-center"
              >
                <FaEnvelope className="mr-2" />
                Email All
              </button>
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Send Email to All Subscribers</h2>
            <div className="mb-4">
              <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                id="emailSubject"
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="emailBody" className="block text-sm font-medium text-gray-700">Body</label>
              <textarea
                id="emailBody"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md resize-none shadow-sm"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="bg-gray-300 text-gray-700 py-1 px-3 rounded-full hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={sendEmailContent}
                className="bg-blue-500 text-white py-1 px-3 rounded-full hover:bg-blue-600 transition duration-300"
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

export default SubscribersPage;
