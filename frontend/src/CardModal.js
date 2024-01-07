import React, { useState, useEffect } from 'react';
import { Modal, TextField, Button, Grid, Typography, FormControlLabel, Switch } from '@mui/material';

const CardModal = ({ open, handleClose, handleSaveCard, selectedCard, modalTitle, errorMessage, setErrorMessage }) => {
  const [label, setLabel] = useState(selectedCard ? selectedCard.label : '');
  const [card_no, setCardNo] = useState(selectedCard ? selectedCard.card_no : '');
  const [status, setStatus] = useState(selectedCard ? selectedCard.status : 0);

  useEffect(() => {
    if (selectedCard) {
      setLabel(selectedCard.label);
      setCardNo(selectedCard.card_no);
      setStatus(selectedCard.status);
    } else {
      setLabel('');
      setCardNo('');
      setStatus(0);
    }
  }, [selectedCard]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (label === '') {
      setErrorMessage('The label cannot be empty.');
    } else {
      handleSaveCard({ label, card_no, status });
    }
  };

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
          {modalTitle}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <TextField label="Label" value={label} onChange={(e) => setLabel(e.target.value)} fullWidth />
            </Grid>
            {!selectedCard && (
              <Grid item>
                <TextField label="Card Number (Leave empty to automatically generate.)" value={card_no} onChange={(e) => setCardNo(e.target.value)} fullWidth />
              </Grid>
            )}
            <Grid item>
              <FormControlLabel 
                control={
                  <Switch
                    checked={status === 1}
                    onChange={(e) => setStatus(e.target.checked ? 1 : 0, )}
                    name="status"
                    color="primary"
                  />
                }
                label="Active/Passive"
              />
            </Grid>
            <Grid item>
              <Button type="submit" variant="contained" color="primary" fullWidth>Save</Button>
            </Grid>
            {errorMessage && <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{errorMessage}</div>}
          </Grid>
        </form>
      </div>
    </Modal>
  );
};

export default CardModal;
