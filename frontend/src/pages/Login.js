import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import './Login.css';
import { checkFormCompletion, fetchCurrentUser } from '../api/userApi';

const Login = ({ setAuthToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: loginData } = await axios.post(
        'http://localhost:8021/api/auth/login',
        { email, password }
      );

      const token = loginData?.data.token;

      if (token) {
        setAuthToken(token);
        localStorage.setItem('token', token);

        const { data: userData } = await fetchCurrentUser(token);
        const hasCompletedCompanyForm = await checkFormCompletion(userData._id);

        if (!hasCompletedCompanyForm && userData.role === 'Admin') {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Login failed: No token provided');
      }
    } catch (err) {
      console.error(
        'Login error:',
        err.response ? err.response.data : err.message
      );
      setError('Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        loading={loading}
        handleLogin={handleLogin}
      />
    </LoginContainer>
  );
};

const LoginContainer = ({ children }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundImage: 'url(/assets/hipaaBG.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: '20px',
    }}
  >
    <Container
      maxWidth='sm'
      sx={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '10px',
        boxShadow: 3,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box mb={4} sx={{ display: 'flex', justifyContent: 'center' }}>
        <img
          src='/assets/Hipaa.png'
          alt='HIPAA Logo'
          style={{ width: '60%', maxWidth: '220px' }}
        />
      </Box>
      {children}
    </Container>
  </Box>
);

const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  handleLogin,
}) => (
  <Box component='form' onSubmit={handleLogin} sx={{ width: '100%' }}>
    <Typography variant='h5' align='center' mb={2} color='primary'>
      Login
    </Typography>

    {error && (
      <Alert severity='error' sx={{ marginBottom: '1rem' }}>
        {error}
      </Alert>
    )}

    <TextField
      label='Email'
      type='email'
      fullWidth
      margin='normal'
      required
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      sx={{ marginBottom: '1rem' }}
    />

    <TextField
      label='Password'
      type='password'
      fullWidth
      margin='normal'
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      sx={{ marginBottom: '1rem' }}
    />

    <Button
      variant='contained'
      color='primary'
      fullWidth
      sx={{
        marginTop: '1rem',
        padding: '10px',
        fontSize: '16px',
        '&:hover': {
          backgroundColor: '#3b7fff',
        },
      }}
      type='submit'
      disabled={loading}
    >
      {loading ? <CircularProgress size={24} color='inherit' /> : 'Login'}
    </Button>
  </Box>
);

export default Login;
