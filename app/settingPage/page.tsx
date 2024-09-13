"use client";
import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { FaCheckCircle } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import {
    fetchUsers,
    addAdmin,
    addEmployee,
    removeEmployee,
    removeAdmin
} from '@/libs/api'; // Ensure the path is correct

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
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
    const [showRoleConflictModal, setShowRoleConflictModal] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const router = useRouter(); 
 const [isProcessing, setIsProcessing] = useState(false); // Add this state


    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersData = await fetchUsers();
                setUsers(Array.isArray(usersData.data) ? usersData.data : []);

                const adminsData = usersData.data.filter((user: User) => user.role === 'ADMIN');
                const employeesData = usersData.data.filter((user: User) => user.role === 'STAFF');

                setAdmins(adminsData);
                setEmployees(employeesData);
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

        if (session?.user?.role !== 'ADMIN') {
            setShowAccessDeniedModal(true);
            return;
        }

        fetchData();
    }, [status, session]);

    const handleLogin = () => {
        router.push('/login');
    };

    const handleAction = async () => {
        if (!selectedUser) {
            toast.warning('Please select a user before performing an action.');
            return;
        }

        try {
            const userRole = selectedUser.role;

            if (actionType === 'addAdmin' && userRole === 'ADMIN') {
                setShowRoleConflictModal(true);
                return;
            }
            if (actionType === 'addEmployee' && userRole === 'STAFF') {
                setShowRoleConflictModal(true);
                return;
            }

            if (actionType === 'addAdmin') {
                await addAdmin(selectedUser.id);
                toast.success('User added as admin successfully.');
            } else if (actionType === 'addEmployee') {
                await addEmployee(selectedUser.id);
                toast.success('User added as employee successfully.');
            } else if (actionType === 'removeEmployee') {
                await removeEmployee(selectedUser.id);
                toast.success('Employee removed successfully.');
            } else if (actionType === 'removeAdmin') {
                await removeAdmin(selectedUser.id);
                toast.success('Admin removed successfully.');
            }

            setShowActionModal(false);
            // Fetch updated user list
            const usersData = await fetchUsers();
            const adminsData = usersData.data.filter((user: User) => user.role === 'ADMIN');
            const employeesData = usersData.data.filter((user: User) => user.role === 'STAFF');

            setAdmins(adminsData);
            setEmployees(employeesData);
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
            await removeEmployee(id);
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
        router.back();
    };
    const closeRoleConflictModal = () => setShowRoleConflictModal(false);

    const getCurrentData = () => {
        return currentTab === 'employees' ? employees : admins;
    };

    const filteredData = getCurrentData().filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const dataToDisplay = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                onClick={handleLogin} 
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                disabled={isProcessing} // Disable button while processing
              >
                {isProcessing ? 'Processing...' : 'Go to Login Page'}
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

    if (showRoleConflictModal) {
        return (
            <Dialog open={showRoleConflictModal} onClose={closeRoleConflictModal}>
                <DialogTitle>Role Conflict</DialogTitle>
                <DialogContent>
                    <p>{selectedUser?.name} already has the role of {selectedUser?.role}. Please select a different action.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeRoleConflictModal} color="primary">
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

            <div className="mb-6">
                <div className="flex justify-center space-x-4 mb-4">
                    <button
                        className={`py-2 px-4 rounded ${currentTab === 'employees' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600`}
                        onClick={() => setCurrentTab('employees')}
                    >
                        Employees
                    </button>
                    <button
                        className={`py-2 px-4 rounded ${currentTab === 'admins' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600`}
                        onClick={() => setCurrentTab('admins')}
                    >
                        Admins
                    </button>
                </div>

                <div className="lg:flex lg:space-x-6 mb-8">
                    <div className="lg:w-1/3">
                        <div className="mb-4">
                            <select
                                className="m rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-black-700"
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
                            <input
                                type="text"
                                placeholder="Search Users"
                                className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4 ">
                                Select User
                            </h3>
                            <select
                                className=" border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-black-700"
                                value={selectedUser ? selectedUser.id : ''}
                                onChange={(e) => {
                                    const user = users.find(user => user.id === e.target.value);
                                    setSelectedUser(user || null);
                                }}
                            >
                                <option value="" disabled>Select a user</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id} className="flex items-center space-x-2">
                                        {user.name} ({user.email})
                                        {user.role === 'ADMIN' && <FaCheckCircle className="text-green-500 ml-2" />}
                                        {user.role === 'STAFF' && <FaCheckCircle className="text-blue-500 ml-2" />}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                            onClick={() => setShowActionModal(true)}
                        >
                            {actionType === 'addAdmin' || actionType === 'addEmployee' ? 'Add User' : 'Remove User'}
                        </button>
                    </div>
                    <div className="lg:w-2/3">
                        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
                            {currentTab === 'employees' ? 'Employees' : 'Admins'}
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-2 px-4 border-b">Name</th>
                                        <th className="py-2 px-4 border-b">Email</th>
                                        <th className="py-2 px-4 border-b">Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataToDisplay.map(user => (
                                        <tr key={user.id}>
                                            <td className="py-2 px-4 border-b">{user.name}</td>
                                            <td className="py-2 px-4 border-b">{user.email}</td>
                                            <td className="py-2 px-4 border-b">{user.role}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-4 flex justify-between items-center">
                                <button
                                    className={`py-2 px-4 rounded transition duration-300 ${currentPage === 1 ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <span>Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}</span>
                                <button
                                    className={`py-2 px-4 rounded transition duration-300 ${currentPage === Math.ceil(filteredData.length / itemsPerPage) ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredData.length / itemsPerPage)))}
                                    disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            <Dialog open={showActionModal} onClose={closeActionModal}>
                <DialogTitle>{actionType.includes('add') ? 'Add User' : 'Remove User'}</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to {actionType.replace(/([A-Z])/g, ' $1').toLowerCase()} {selectedUser?.name}?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeActionModal} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAction} color="secondary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer />
        </div>
    );
};

export default UserManagement;
