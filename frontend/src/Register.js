import React, { useState } from 'react';
import apiRequest from './Api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

const Register = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [errorMessage, setErrorMessage] = useState('');
 const navigate = useNavigate();


 const handleLoginPage = () => {
  navigate('/login');
 };
 const handleSubmit = async (event) => {
 event.preventDefault();

    const response = await apiRequest('auth/register', 'POST', { email, password });

    if (response.ok) {
      navigate('/login')
    } else {
      const errorData = await response.json();
      setErrorMessage(errorData.detail);
    }
 };

 return (
 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
   <div><Button onClick={handleLoginPage} style={{ position: 'absolute', top: 0, right: 0 }}>Login</Button></div>
   <h2>Register</h2>
   <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
     <input
       type="email"
       placeholder="Email"
       value={email}
       onChange={(e) => setEmail(e.target.value)}
       style={{ width: '200px' }}
     />
     <input
       type="password"
       placeholder="Password"
       value={password}
       onChange={(e) => setPassword(e.target.value)}
       style={{ width: '200px' }}
     />
     <button type="submit">Register</button>
   </form>
   <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
       <div><span style={{color: 'red'}}>{errorMessage}</span></div>
       {errorMessage && <div><button onClick={() => navigate('/login')}>Go to Login</button></div>}
   </div>
 </div>
 );
};

export default Register;
