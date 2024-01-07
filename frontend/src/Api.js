const API_URL = 'http://127.0.0.1:8000/'; //  Backend server URL

async function apiRequest(endpoint, method, body = null) {
  const token = localStorage.getItem('token');
  console.log(token)
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
  if (body !== null) {
    options.body = JSON.stringify(body);
  }
 
  const response = await fetch(`${API_URL}${endpoint}`, options);
 
  return await response;
 }

export default apiRequest;
