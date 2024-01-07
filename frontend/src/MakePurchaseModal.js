import React, { useState } from 'react';
import { Dialog, DialogTitle, Modal, Grid, DialogActions, Button, Select, MenuItem, TextField, Typography, FormControl, InputLabel } from '@mui/material';
import ErrorModal from './ErrorModal';

const MakePurchase = ({ open, handleClose, cards, handlePurchase }) => {
  const [selectedCard, setSelectedCard] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(parseFloat((Math.random() * (1000 - 0.01) + 0.01).toFixed(2)));
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return 'Passive';
      case 1:
        return 'Active';
      default:
        return 'Unknown';
    }
  };

  const formatCardNumber = (cardNumber) => {
    return cardNumber.toString().replace(/\d{4}(?=.)/g, '$& ');
  };

  const handleConfirm = (event) => {
    event.preventDefault();
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  const handlePurchaseConfirm = () => {
    if (!selectedCard) {
      setError(true);
      setErrorMessage('You must choose a card to make a purchase.');
      return; 
    }

    handlePurchase(selectedCard, price, description);
    handleClose();
    setConfirmOpen(false);
    setPrice(parseFloat((Math.random() * (1000 - 0.01) + 0.01).toFixed(2))); //generating a new price after purchase
  };

  return (
    <div>
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
          Make a Purchase
        </Typography>
        <form onSubmit={handleConfirm}>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <FormControl fullWidth>
                <InputLabel id="card-select-label">Choose a card</InputLabel>
                <Select labelId="card-select-label" value={formatCardNumber(selectedCard)} onChange={(e) => setSelectedCard(e.target.value)}>
                  {cards.map((card) => (
                    <MenuItem key={card.id} value={card.id}>
                      {`${card.label} - ${formatCardNumber(card.card_no)} (${getStatusText(card.status)})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <Typography variant="h6" style={{ textAlign: 'center' }}>
                <span style={{ color: 'blue', fontWeight: 'bold' }}>Price: ${price.toFixed(2)}</span>
              </Typography>
            </Grid>
            <Grid item>
              <TextField
                multiline
                rows={4}
                variant="outlined"
                style={{ marginTop: '20px', width: '100%' }}
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            <Grid item>
              <Button type="submit" variant="contained" color="primary" fullWidth>Purchase</Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </Modal>
      <Dialog open={confirmOpen} onClose={handleConfirmClose}>
        <DialogTitle>Confirm Purchase?</DialogTitle>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Cancel</Button>
          <Button onClick={handlePurchaseConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>
      {error && (
      <ErrorModal
          open={error}
          handleClose={() => setError(false)}
          errorMessage={errorMessage}
        />
       )}
    </div>
  );
};

export default MakePurchase;
