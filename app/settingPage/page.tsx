"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession, signIn } from 'next-auth/react';
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

interface User {
    id: string;
    name: string;
    email: string;
    dateJoined?: string;
    role?: string;
}

const UserManagement: React.FC = () => {
    const [currentTab, setCurrentTab] = useState<'admins' | 'employees'>('employees');
    const [employees, setEmployees] = useState<User[]>([]);
    const [admins, setAdmins] = useState<User[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionType, setActionType] = useState<'addAdmin' | 'addEmployee' | 'removeAdmin' | 'removeEmployee'>('addAdmin');
    const [showActionModal, setShowActionModal] = useState<boolean>(false);
    const [showAccessDeniedModal, setShowAccessDeniedModal] = useState<boolean>(false);
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [employeesData, adminsData, usersData] = await Promise.all([
                    axios.get('/api/employees'),
                    axios.get('/api/admins'),
                    axios.get('/api/register'),
                ]);

                const usersArray = Array.isArray(usersData.data) ? usersData.data : [];
                setEmployees(employeesData.data);
                setAdmins(adminsData.data);
                setUsers(usersArray);
            } catch (error) {
                console.error('Error fetching data', error);
                toast.error('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };

        if (status === 'loading') {
            setLoading(true);
            return;
        }

        if (!session) {
            signIn();
            return;
        }

        if (session?.user?.role !== 'ADMIN') {
            setShowAccessDeniedModal(true);
            return;
        }

        fetchData();
    }, [status, session]);

    const handleAction = async () => {
        if (!selectedUser) {
            toast.warning('Please select a user before performing an action.');
            return;
        }

        try {
            if (actionType === 'addAdmin') {
                await axios.post(`/api/admins`, { userId: selectedUser.id });
                toast.success('User added as admin successfully.');
            } else if (actionType === 'addEmployee') {
                await axios.post(`/api/employees`, { userId: selectedUser.id });
                toast.success('User added as employee successfully.');
            } else if (actionType === 'removeEmployee') {
                await axios.delete(`/api/employees/${selectedUser.id}`);
                toast.success('Employee removed successfully.');
            } else if (actionType === 'removeAdmin') {
                await axios.delete(`/api/admins/${selectedUser.id}`);
                toast.success('Admin removed successfully.');
            }

            setShowActionModal(false);
            const [employeesData, adminsData, usersData] = await Promise.all([
                axios.get('/api/employees'),
                axios.get('/api/admins'),
                axios.get('/api/register'),
            ]);
            setEmployees(employeesData.data);
            setAdmins(adminsData.data);
            setUsers(usersData.data);
        } catch (error) {
            console.error('Error performing action', error);
            toast.error('Failed to perform action.');
        }
    };

    const handleEditEmployee = (employee: User) => {
        console.log('Edit employee', employee);
    };

    const handleDeleteEmployee = async (id: string) => {
        try {
            await axios.delete(`/api/employees/${id}`);
            setEmployees(employees.filter(employee => employee.id !== id));
            toast.success('Employee deleted successfully.');
        } catch (error) {
            console.error('Error deleting employee', error);
            toast.error('Failed to delete employee.');
        }
    };

    const closeActionModal = () => setShowActionModal(false);
    const closeAccessDeniedModal = () => {
        setShowAccessDeniedModal(false);
        window.history.back();
    };

    const getCurrentData = () => {
        if (currentTab === 'employees') return employees;
        return admins;
    };

    const dataToDisplay = getCurrentData().slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <CircularProgress />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm text-center">
                    <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
                    <p className="mb-6">You need to log in or register to access this page.</p>
                    <button
                        onClick={() => signIn()}
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                    >
                        Go to Login Page
                    </button>
                </div>
            </div>
        );
    }

    if (showAccessDeniedModal) {
        return (
            <Dialog open={showAccessDeniedModal} onClose={closeAccessDeniedModal}>
                <DialogTitle>Access Denied</DialogTitle>
                <DialogContent>
                    <p>You must be an admin to view this page.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeAccessDeniedModal} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <div className="mx-auto my-10 max-w-4xl px-4">
            <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
                Employee Management
            </h1>
            <p className="text-gray-500 text-center mb-8 bg-gradient-to-r from-green-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">
                Manage users and employees here.
            </p>

            <div className="flex flex-col lg:flex-row lg:space-x-8 mb-6">
                <div className="lg:w-1/3">
                    <h2 className="text-2xl font-bold mb-4   bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">Change Status</h2>
                    <div className="mb-4">
                        <select
                            className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            value={actionType}
                            onChange={(e) => setActionType(e.target.value as 'addAdmin' | 'addEmployee' | 'removeAdmin' | 'removeEmployee')}
                        >
                            <option value="addAdmin">Add as Admin</option>
                            <option value="addEmployee">Add as Employee</option>
                            <option value="removeAdmin">Remove Admin</option>
                            <option value="removeEmployee">Remove Employee</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <select
                            className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            onChange={(e) => setSelectedUser(users.find(user => user.id === e.target.value) || null)}
                        >
                            <option value="">Select a User</option>
                            {users.length > 0 ? (
                                users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} - {user.email}
                                    </option>
                                ))
                            ) : (
                                <option value="">No users available</option>
                            )}
                        </select>
                    </div>
                    <button
                        onClick={() => setShowActionModal(true)}
                        className="bg-blue-500 text-white rounded p-2 text-sm flex items-center"
                    >
                        <FaUserPlus className="mr-2" /> Perform Action
                    </button>
                </div>

                <div className="lg:w-2/3">
                    <div className="flex justify-between mb-4">
                        <button
                            className={`py-2 px-4 mx-2 rounded ${currentTab === 'employees' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => setCurrentTab('employees')}
                        >
                            Employees
                        </button>
                        <button
                            className={`py-2 px-4 mx-2 rounded ${currentTab === 'admins' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => setCurrentTab('admins')}
                        >
                            Admins
                        </button>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-teal-500 to-green-500 text-transparent bg-clip-text">
                            {currentTab === 'employees' ? 'Employee List' : 'Admin List'}
                        </h2>
                        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">Name</th>
                                    <th className="py-2 px-4 border-b">Email</th>
                                    {currentTab === 'employees' && <th className="py-2 px-4 border-b">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {dataToDisplay.length > 0 ? (
                                    dataToDisplay.map(user => (
                                        <tr key={user.id}>
                                            <td className="py-2 px-4 border-b">{user.name}</td>
                                            <td className="py-2 px-4 border-b">{user.email}</td>
                                            {currentTab === 'employees' && (
                                                <td className="py-2 px-4 border-b">
                                                    <button
                                                        onClick={() => handleEditEmployee(user)}
                                                        className="text-blue-500 hover:text-blue-600"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEmployee(user.id)}
                                                        className="text-red-500 hover:text-red-600 ml-2"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={currentTab === 'employees' ? 3 : 2} className="py-2 px-4 text-center">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="bg-gray-300 text-gray-700 rounded px-4 py-2"
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span>Page {currentPage}</span>
                        <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="bg-gray-300 text-gray-700 rounded px-4 py-2"
                            disabled={(currentPage * itemsPerPage) >= getCurrentData().length}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {showActionModal && (
                <Dialog open={showActionModal} onClose={closeActionModal}>
                    <DialogTitle>Confirm Action</DialogTitle>
                    <DialogContent>
                        <p>Are you sure you want to {actionType.replace(/([A-Z])/g, ' $1').toLowerCase()} {selectedUser?.name}?</p>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleAction} color="primary">
                            Confirm
                        </Button>
                        <Button onClick={closeActionModal} color="secondary">
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            <ToastContainer />
        </div>
    );
};

export default UserManagement;
