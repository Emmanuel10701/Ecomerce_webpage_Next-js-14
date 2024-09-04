"use client";
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { FaUser, FaEnvelope } from 'react-icons/fa';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: {
    name: string;
    email: string;
  };
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ open, onClose, onConfirm, user }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="text-center text-xl font-semibold">Confirm Deletion</DialogTitle>
      <DialogContent>
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center mb-2">
            <FaUser className="text-green-500 mr-2" />
            <span className="text-lg text-green-500">{user.name}</span>
          </div>
          <div className="flex items-center">
            <FaEnvelope className="text-slate-500 mr-2" />
            <span className="text-lg text-slate-500">{user.email}</span>
          </div>
        </div>
        <p className="mb-4">Are you sure you want to delete this user?</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="secondary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
