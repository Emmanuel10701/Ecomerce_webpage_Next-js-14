import React from 'react';
import { Person } from '@mui/icons-material';
import { XMarkIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  onAddAdminClick: () => void;
  onViewAdminsClick: () => void;
  onAddEmployeeClick: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddAdminClick, onViewAdminsClick, onAddEmployeeClick, isOpen, toggleSidebar, isAdmin }) => {
  return (
    <div className={`fixed top-0 left-0 bottom-0 bg-gray-800 text-white transition-transform duration-300 ease-in-out z-50 
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                    sm:translate-x-0 sm:relative sm:w-64 sm:block`}>
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between p-4 bg-slate-200 sm:hidden">
            <h2 className="text-lg font-bold">Admin Panel</h2>
            <button onClick={toggleSidebar} className="text-black">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4">
            <button
              onClick={onAddAdminClick}
              className="mb-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded flex items-center w-full text-sm"
            >
              <Person className="mr-2 w-4 h-4" />
              Add Admin
            </button>
            {isAdmin && (
              <button
                onClick={onAddEmployeeClick}
                className="mb-3 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded flex items-center w-full text-sm"
              >
                <UserIcon className="mr-2 w-4 h-4" />
                Add Employee
              </button>
            )}
            <button
              onClick={onViewAdminsClick}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded flex items-center w-full text-sm"
            >
              <UsersIcon className="mr-2 w-4 h-4" />
              View All Admins
            </button>
          </div>
        </div>
        {/* Admin Panel text at the bottom */}
        <div className="p-4 bg-gray-700 mb-10">
          <h2 className="text-lg font-bold">Admin Panel</h2>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
