// api.ts
import axios from 'axios';

export const fetchUsers = async () => {
    try {
        const response = await axios.get('/api/register');
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch users');
    }
};

export const addAdmin = async (userId: string) => {
    try {
        await axios.post(`/api/admins`, { userId });
    } catch (error) {
        throw new Error('Failed to add admin');
    }
};

export const addEmployee = async (userId: string) => {
    try {
        await axios.post(`/api/employees`, { userId });
    } catch (error) {
        throw new Error('Failed to add employee');
    }
};

export const removeEmployee = async (userId: string) => {
    try {
        await axios.delete(`/api/employees/${userId}`);
    } catch (error) {
        throw new Error('Failed to remove employee');
    }
};

export const removeAdmin = async (userId: string) => {
    try {
        await axios.delete(`/api/admins/${userId}`);
    } catch (error) {
        throw new Error('Failed to remove admin');
    }
};
