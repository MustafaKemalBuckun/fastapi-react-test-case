import React, { useState } from 'react';
import apiRequest from './Api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

const Login = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [errorMessage, setErrorMessage] = useState('');
 const navigate = useNavigate();

 const handleRegister = () => {
  navigate('/');
 };

 const handleSubmit = async (event) => {
  event.preventDefault();
  try {
    const response = await apiRequest('auth/login', 'POST', { email, password });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      navigate('/home');
    } else {
      const errorData = await response.json();
      if (typeof errorData.detail === 'object' && errorData.detail !== null) {
        setErrorMessage(errorData.detail[0].msg);
      } else {
        setErrorMessage(errorData.detail);
      }
    }
  } catch (error) {
    setErrorMessage('An unexpected error occurred.');
  }
};

 return (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
  <div><Button onClick={handleRegister} style={{ position: 'absolute', top: 0, right: 0 }}>Register</Button></div>
    <h2>Login</h2>
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
      <button type="submit">Log In</button>
    </form>
    <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
       <div><span style={{color: 'red'}}>{errorMessage}</span></div>
       {errorMessage && <div><button onClick={() => navigate('/')}>Go to Register</button></div>}
   </div>
  </div>
 );
};

export default Login;
