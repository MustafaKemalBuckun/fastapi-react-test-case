import React from 'react';
import { Modal, Button } from '@mui/material';

const SessionExpired = ({ open, handleClose }) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '1em',
        width: '30%',
        borderRadius: '8px',
		textAlign: 'center',
		color: 'red',
		justifyContent: 'center'
      }}>
        <p>Your session has expired, you may need to login again.</p>
        <Button onClick={handleClose} variant="contained" color="primary" fullWidth>Go to Login</Button>
      </div>
    </Modal>
  );
};

export default SessionExpired;
