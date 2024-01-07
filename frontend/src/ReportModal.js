import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';

const ReportModal = ({ open, handleClose, report }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Transaction Report</DialogTitle>
      <DialogContent>
        {report ? (
          <>
            <Typography variant="body1">Number of active cards: {report.total_active_cards}</Typography>
            <Typography variant="body1">Total spent with active cards: ${report.total_amount_active_cards.toFixed(2)}</Typography>
            <Typography variant="body1">Total spent with passive cards: ${report.total_amount_passive_cards.toFixed(2)}</Typography>
            <Typography variant="body1">Total spent: ${report.total_amount_all_cards.toFixed(2)}</Typography>
          </>
        ) : (
          <Typography variant="body1">Loading...</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
