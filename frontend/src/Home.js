import React, { useEffect, useState } from 'react';
import apiRequest from './Api';
import { Typography, TextField, Tab, Tabs, Table, TableCell, TableRow, TableContainer, TableHead, TableBody, IconButton, Button, Dialog, DialogTitle, DialogActions, Paper, Autocomplete } from '@mui/material';
import { Delete as DeleteIcon, Assignment as ReportIcon } from '@mui/icons-material';
import CardModal from './CardModal';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import SessionExpired from './SessionExpiredModal';
import ErrorModal from './ErrorModal';
import MakePurchase from './MakePurchaseModal';
import ReportModal from './ReportModal';


const Home = () => {
  
 const [activeTab, setActiveTab] = useState(0);
 const [cards, setCards] = useState([]);
 const [transactions, setTransactions] = useState([]);
 const [selectedCard, setSelectedCard] = useState(null);
 const [openModal, setOpenModal] = useState(false);
 const [modalTitle, setModalTitle] = useState('');
 const [errorMessage, setErrorMessage] = useState('');
 const [sessionExpired, setSessionExpired] = useState(false);
 const [deleteCardId, setDeleteCardId] = useState(null);
 const [activeCardError, setActiveCardError] = useState('');
 const [openPurchaseModal, setOpenPurchaseModal] = useState(false);
 const [selectedCardNo, setSelectedCardNo] = useState('');
 const [cardLabel, setCardLabel] = useState('');
 const [message, setMessage] = useState(null);
 const [description, setDescription] = useState('');
 const [report, setReport] = useState(null);
const [openReportModal, setOpenReportModal] = useState(false);
 const getStatusText = (status) => {
  switch (status) {
    case 0:
      return 'Passive';
    case 1:
      return 'Active';
    default:
      return 'Undefined';
  }
};

 const navigate = useNavigate();

 useEffect(() => {
  fetchTransactions();
}, [selectedCardNo, cardLabel, description]);

useEffect(() => {
  fetchCards();
}, []);

const fetchCards = async () => {
  const cardsResponse = await apiRequest('cards', 'GET');

  if (cardsResponse.ok) {
    const cardsData = await cardsResponse.json();
    setCards(cardsData);
    setSelectedCardNo('');
  }
};

const fetchTransactions = async () => {
  let endpoint = 'transactions';
  if (selectedCardNo || cardLabel || description) {
    endpoint += '?';
    if (selectedCardNo) {
      endpoint += `card_no=${selectedCardNo}`;
      if (cardLabel || description) {
        endpoint += '&';
      }
    }
    if (cardLabel) {
      endpoint += `card_label=${cardLabel}`;
      if (description) {
        endpoint += '&';
      }
    }
    if (description) {
      endpoint += `description=${description}`;
    }
  }
  const transactionsResponse = await apiRequest(endpoint, 'GET');

  if (transactionsResponse.ok) {
    const transactionsData = await transactionsResponse.json();
    if (transactionsData.message) {
      setMessage(transactionsData.message);
    } else {
      setTransactions(transactionsData);
      setMessage(null);
    }  
  }
};

const fetchReport = async () => {
  let endpoint = 'transactions/report';
  if (selectedCardNo || cardLabel || description) {
    endpoint += '?';
    if (selectedCardNo) {
      endpoint += `card_no=${selectedCardNo}`;
      if (cardLabel || description) {
        endpoint += '&';
      }
    }
    if (cardLabel) {
      endpoint += `card_label=${cardLabel}`;
      if (description) {
        endpoint += '&';
      }
    }
    if (description) {
      endpoint += `description=${description}`;
    }
  }
  const reportResponse = await apiRequest(endpoint, 'GET');

  if (reportResponse.ok) {
    const reportData = await reportResponse.json();
    setReport(reportData);
  }
};

useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    //if there is no token, redirecting to login page
    navigate('/login');
  } else {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now().valueOf() / 1000;
    if (decodedToken.exp < currentTime) {
      //if the token is expired, redirecting to login page
      navigate('/login');
    }
  }
}, [navigate]);

 const handleAddNewCard = () => {
   setSelectedCard(null);
   setModalTitle('Add New Card');
   setOpenModal(true);
 };

 const handleTabChange = (event, newValue) => {
   setActiveTab(newValue);
 };

 const formatCardNumber = (cardNumber) => {
   return cardNumber.toString().replace(/\d{4}(?=.)/g, '$& ');
 };

 const formatAmount = (amount) => {
   return `$${amount.toFixed(2)}`;
 };

 const fetchCardDetails = async (cardId) => {
  const response = await apiRequest(`cards/get/${cardId}`, 'GET');
  if (response.ok) {
    const card = await response.json();
    setSelectedCard(card);
  }
};

 const handleRowClick = (card) => {
  fetchCardDetails(card.id);
   setModalTitle('Update Card');
   setOpenModal(true);
   setErrorMessage('');
 };

 const handleCloseModal = () => {
   setOpenModal(false);
   setErrorMessage('');
 };

 const handleDeleteClick = (cardId) => {
  setDeleteCardId(cardId);
};

const transactionRowRenderer = (transaction) => (
  <TableRow key={transaction.id}>
    <TableCell>{formatAmount(transaction.amount)}</TableCell>
    <TableCell>{transaction.description}</TableCell>
    <TableCell>{`${transaction.card_label} (${getStatusText(transaction.card_status)})`}</TableCell>
    <TableCell>{formatCardNumber(transaction.card_no)}</TableCell>
    <TableCell>{new Date(transaction.date_created).toLocaleString()}</TableCell>
  </TableRow>
);

const renderTable = (headers, rows, rowRenderer) => {
  return (
    <TableContainer component={Paper} style={{ maxWidth: '80%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBlock: '10px' }}>
        {activeTab === 0 && <Typography variant="caption" color="text.secondary" style={{ marginLeft: '10px' }}>* You can click at the card name of the cards you want to update.</Typography>}
      </div>
      {message && activeTab === 1 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h6">{message}</Typography>
        </div>
      ) : rows.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h6">No data yet.</Typography>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: '#E5E5E5' }}>
              {headers.map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
              {activeTab === 1 && (
                <TableCell>
                  <Button
                    variant="outlined"
                    startIcon={<ReportIcon />}
                    onClick={() => { fetchReport(); setOpenReportModal(true); }}
                  >
                    Report
                  </Button>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(rowRenderer)}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};

const handleConfirmDelete = async () => {
  const response = await apiRequest(`cards/delete/${deleteCardId}`, 'DELETE');
  if (!response.ok) {
    const errorData = await response.json();
    setActiveCardError(errorData.detail);
  } else {
    fetchCards();
    fetchTransactions();
    setDeleteCardId(null);
  }
};

const handleSaveCard = async (card) => {
  const numberRegex = /^[0-9]+$/;
  let cardData = card;
  if (card.card_no === '') {
    cardData = { label: card.label, card_no: null, status: card.status };
  } else if (!numberRegex.test(card.card_no)) {
    setActiveCardError('Card number must contain only numbers.');
    return;
  }
  const endpoint = selectedCard ? `cards/update/${selectedCard.id}` : 'cards/add';
  const method = selectedCard ? 'PUT' : 'POST';
  const response = await apiRequest(endpoint, method, cardData);

  if (!response.ok) {
    const errorData = await response.json();
    setActiveCardError(errorData.detail);
  } else {
    setOpenModal(false);
    fetchCards();
    setSelectedCard(null);
  }
};

 const handleLogout = () => {
  localStorage.removeItem('token');
  navigate('/login');
};

const handleSessionExpiredClose = () => {
  setSessionExpired(false);
  navigate('/login');
};

const handlePurchase = async (cardId, amount, description) => {
  const response = await apiRequest('transactions/add', 'POST', { card_id: cardId, amount, description });
  if (response.ok) {
    fetchTransactions();
  }
};

 return (
   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100vh' }}>
    <SessionExpired open={sessionExpired} handleClose={handleSessionExpiredClose} />
    <ErrorModal open={!!activeCardError} handleClose={() => setActiveCardError('')} errorMessage={activeCardError} />
    <div><Button onClick={handleLogout} style={{ position: 'absolute', top: 0, right: 0 }}>Logout</Button></div>
     <h2 style={{marginBottom: '50px'}}>Home Page</h2>
     <Tabs value={activeTab} onChange={handleTabChange}>
       <Tab label="Cards" />
       <Tab label="Transactions" />
     </Tabs>
      <div id="aa" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '80%' }}>
        <Button variant="contained" color="primary" onClick={activeTab === 0 ? handleAddNewCard : () => setOpenPurchaseModal(true)} style={{ alignSelf: 'flex-start' }}>
          {activeTab === 0 ? 'Add New Card' : 'Make Purchase'}
        </Button>
        {activeTab === 1 && (
          <div style={{ display: 'contents', alignItems: 'center' }}>
            <Autocomplete
              value={selectedCardNo}
              onChange={(event, newValue) => {
                setSelectedCardNo(newValue);  
              }}
              style={{ width: '25%' }}
              options={cards.map((card) => formatCardNumber(card.card_no))}
              renderInput={(params) => <TextField {...params} label="Filter By Card Number" />}
            />
            <TextField label="Filter By Card Label" value={cardLabel} style={{ width: '25%' }} onChange={(e) => setCardLabel(e.target.value)} />
            <TextField label="Filter By Description" value={description} style={{ width: '25%' }} onChange={(e) => setDescription(e.target.value)} />
          </div>
        )}
      </div>
     {activeTab === 0 ? (
        renderTable(
          ['Label', 'Card Number', 'Status', 'Created Date', 'Last Modified Date', ''],
          cards,
          (card) => (
            <TableRow key={card.id}>
              <TableCell onClick={() => handleRowClick(card)} style={{ color: 'blue'}}>{card.label}</TableCell>
              <TableCell>{formatCardNumber(card.card_no)}</TableCell>
              <TableCell>{getStatusText(card.status)}</TableCell>
              <TableCell>{new Date(card.date_created).toLocaleString()}</TableCell>
              <TableCell>{card.date_modified ? new Date(card.date_modified).toLocaleString() : '-'}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDeleteClick(card.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          )
        )
      ) : (
        renderTable(
          ['Amount', 'Description', 'Card Name', 'Card Number', 'Transaction Date'],
          transactions,
          transactionRowRenderer,
          (transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.amount}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{transaction.card_label}</TableCell>
              <TableCell>{transaction.card_no}</TableCell>
              <TableCell>{new Date(transaction.date_created).toLocaleString()}</TableCell>
            </TableRow>
          )
        )
      )}
     <CardModal open={openModal} handleClose={handleCloseModal} handleSaveCard={handleSaveCard} selectedCard={selectedCard} modalTitle={modalTitle} errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
     <MakePurchase open={openPurchaseModal} handleClose={() => setOpenPurchaseModal(false)} cards={cards} handlePurchase={handlePurchase} />
     <ReportModal open={openReportModal} handleClose={() => setOpenReportModal(false)} report={report} />
     <Dialog open={deleteCardId !== null} onClose={() => setDeleteCardId(null)}>
        <DialogTitle>Are you sure you want to delete this card? All transactions of the card will also be deleted.</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteCardId(null)}>Cancel</Button>
          <Button onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
   </div>
 );
};

export default Home;
