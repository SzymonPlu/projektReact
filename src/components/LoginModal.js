import React, { useState } from 'react';


function LoginModal({ onClose, show }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const data = await response.json();
      console.log('Odpowiedź serwera po zalogowaniu:', data);

      // Zapisz token i rolę użytkownika w pamięci lokalnej (localStorage)
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', username);

      localStorage.setItem('isLoggedIn', 'true');

      console.log('Zalogowano pomyślnie jako:', username);
      console.log('Role użytkownika:', data.role);
      setError('');
      setLoginSuccess(true);
      window.location.reload();

      // Ustawienie timeout na 2 sekundy
      setTimeout(() => {
        setLoginSuccess(false);
        onClose(); // Zamknięcie okna logowania
      }, 2000);
    } catch (error) {
      console.error('Błąd logowania:', error.message);
      setError('Nieprawidłowe dane logowania. Spróbuj ponownie.');
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#ffffff', padding: '20px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)', zIndex: '9999' }}>
      {loginSuccess && <p style={{ color: 'green', marginBottom: '10px' }}>Logowanie udało się!</p>}
      <button style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '16px', padding: '5px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#000000' }} >X</button>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ marginBottom: '10px', padding: '8px', borderRadius: '5px', border: '1px solid #cccccc', width: '100%' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: '10px', padding: '8px', borderRadius: '5px', border: '1px solid #cccccc', width: '100%' }} />
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
        <button type="submit" style={{ fontSize: '16px', padding: '8px 20px', backgroundColor: '#007bff', color: '#ffffff', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>Log in</button>
      </form>
    </div>
  );
}

export default LoginModal;