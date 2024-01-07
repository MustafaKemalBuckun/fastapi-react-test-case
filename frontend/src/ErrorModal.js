import React from 'react';
import { Modal, Typography, Button } from '@mui/material';

const ErrorModal = ({ open, handleClose, errorMessage }) => {
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
        borderRadius: '8px'
      }}>
        <Typography variant="h4" component="h2" style={{ textAlign: 'center', marginBottom: '20px' }}>
          Error
        </Typography>
        <Typography variant="body1" component="p" style={{ textAlign: 'center', marginBottom: '20px' }}>
          {errorMessage}
        </Typography>
        <Button onClick={handleClose} variant="contained" color="primary" fullWidth>Close</Button>
      </div>
    </Modal>
  );
};

export default ErrorModal;
