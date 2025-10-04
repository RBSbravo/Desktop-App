import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  useTheme,
  Alert,
  Link,
  Fade,
  Slide,
  Backdrop,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import mitoLogo from '../assets/mito_logo.png';
import LoadingSpinner from '../components/LoadingSpinner';
import { login as apiLogin, registerAdmin, forgotPassword } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState('login');
  const [registerData, setRegisterData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Forgot password state
  const [forgotPwOpen, setForgotPwOpen] = useState(false);
  const [forgotPwEmail, setForgotPwEmail] = useState('');
  const [forgotPwLoading, setForgotPwLoading] = useState(false);
  const [forgotPwError, setForgotPwError] = useState('');
  const [forgotPwSuccess, setForgotPwSuccess] = useState('');
  const [forgotPwSuccessState, setForgotPwSuccessState] = useState(false);

  // Philippines-inspired demo users
  const demoUsers = [
    {
      email: 'juan.delacruz@company.ph',
      password: 'password123',
      name: 'Juan Dela Cruz',
      role: 'Administrator',
      department: 'IT Department',
    },
    {
      email: 'maria.santos@company.ph',
      password: 'password123',
      name: 'Maria Santos',
      role: 'Project Manager',
      department: 'Operations',
    },
    {
      email: 'pedro.reyes@company.ph',
      password: 'password123',
      name: 'Pedro Reyes',
      role: 'Developer',
      department: 'IT Department',
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const user = await apiLogin(formData.email, formData.password);
        setSuccess(true);
        setTimeout(() => {
          navigate('/app/dashboard');
        }, 1000);
    } catch (err) {
      setError(err.message || 'Login failed');
        setLoading(false);
      }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
    setSuccess(false);
    setRegisterError('');
    setRegisterSuccess(false);
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    if (registerError) setRegisterError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerData.firstname || !registerData.lastname || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setRegisterError('Please fill in all fields');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
    setRegisterLoading(true);
    setRegisterError('');
    setRegisterSuccess(false);
    try {
      await registerAdmin(registerData.firstname, registerData.lastname, registerData.email, registerData.password);
      setRegisterSuccess(true);
      setTimeout(() => {
        setTab('login');
        setRegisterSuccess(false);
        setRegisterData({ firstname: '', lastname: '', email: '', password: '', confirmPassword: '' });
      }, 1500);
    } catch (err) {
      setRegisterError(err.message || 'Registration failed');
    }
    setRegisterLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotPwEmail) {
      setForgotPwError('Please enter your email address.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPwEmail)) {
      setForgotPwError('Please enter a valid email address.');
      return;
    }

    setForgotPwLoading(true);
    setForgotPwError('');
    setForgotPwSuccess('');
    
    try {
      await forgotPassword(forgotPwEmail);
      setForgotPwSuccess('Password reset email sent! Please check your inbox and follow the instructions.');
      setForgotPwSuccessState(true);
    } catch (err) {
      setForgotPwError(err.message || 'Failed to send reset email.');
    } finally {
      setForgotPwLoading(false);
    }
  };

  const handleCloseForgotPassword = () => {
    if (!forgotPwLoading) {
      setForgotPwOpen(false);
      setForgotPwEmail('');
      setForgotPwError('');
      setForgotPwSuccess('');
      setForgotPwSuccessState(false);
    }
  };

  const handleOpenForgotPassword = () => {
    setForgotPwOpen(true);
    setForgotPwEmail(formData.email); // Pre-fill with current email if available
    setForgotPwError('');
    setForgotPwSuccess('');
    setForgotPwSuccessState(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: theme.palette.mode === 'dark' 
          ? theme.palette.background.default
          : `linear-gradient(to right bottom, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
        py: 8,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Animation */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, ${theme.palette.primary.light}15 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, ${theme.palette.primary.main}10 0%, transparent 50%)`,
        }}
      />

      <Container component="main" maxWidth="sm">
        <Slide direction="up" in={true} timeout={800}>
          <Paper
            elevation={theme.palette.mode === 'dark' ? 2 : 8}
            sx={{
              p: { xs: 3, sm: 6 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.background.paper 
                : '#ffffff',
              borderRadius: 3,
              position: 'relative',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}`,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 8px 32px rgba(0,0,0,0.3)'
                : '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            {/* Tabs for Login/Register */}
            <Tabs
              value={tab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ mb: 2, width: '100%' }}
            >
              <Tab label="Login" value="login" sx={{ fontWeight: 600 }} />
              <Tab label="Register" value="register" sx={{ fontWeight: 600 }} />
            </Tabs>
            {/* Logo with animation */}
            <Fade in={true} timeout={1200}>
              <Box 
                component="img"
                src={mitoLogo}
                alt="Logo"
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mb: 2,
                  display: 'block',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  animation: success ? 'successPulse 0.6s ease-in-out' : 'none',
                  '@keyframes successPulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)' },
                  },
                }}
              />
            </Fade>

            <Fade in={true} timeout={1400}>
              <Typography
                variant="h5"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  textAlign: 'center',
                }}
              >
                {success ? 'Welcome!' : 'Welcome Back'}
              </Typography>
            </Fade>

            <Fade in={true} timeout={1600}>
              <Typography
                variant="body2"
                sx={{
                  mb: 4,
                  color: theme.palette.text.secondary,
                  textAlign: 'center',
                }}
              >
                {success ? 'Authentication successful. Redirecting...' : 'Sign in to Ticketing and Task Management System'}
              </Typography>
            </Fade>

            {error && (
              <Slide direction="down" in={!!error} timeout={300}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    width: '100%', 
                    mb: 3,
                    '& .MuiAlert-message': {
                      width: '100%'
                    }
                  }}
                  icon={<ErrorIcon />}
                >
                  {error}
                </Alert>
              </Slide>
            )}

            {success && (
              <Slide direction="down" in={success} timeout={300}>
                <Alert 
                  severity="success" 
                  sx={{ 
                    width: '100%', 
                    mb: 3,
                    '& .MuiAlert-message': {
                      width: '100%'
                    }
                  }}
                  icon={<CheckCircleIcon />}
                >
                  Authentication successful! Redirecting to dashboard...
                </Alert>
              </Slide>
            )}

            {/* Login Form */}
            {tab === 'login' && (
              <Box 
                component="form" 
                onSubmit={handleSubmit} 
                sx={{ 
                  width: '100%',
                  maxWidth: 400,
                  mx: 'auto',
                  position: 'relative'
                }}
              >
                <Fade in={!success} timeout={800}>
                  <Box>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading || success}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          },
                        }
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading || success}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="large"
                              disabled={loading || success}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          },
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
                      <Link 
                        component="button"
                        type="button"
                        variant="body2" 
                        underline="hover"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenForgotPassword();
                        }}
                        sx={{ 
                          border: 'none', 
                          background: 'none', 
                          cursor: 'pointer',
                          color: theme.palette.primary.main,
                          '&:hover': {
                            color: theme.palette.primary.dark,
                          }
                        }}
                      >
                        Forgot password?
                      </Link>
                    </Box>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading || success}
                      sx={{
                        mt: 1,
                        mb: 3,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          transform: 'none',
                        },
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s',
                        },
                        '&:hover::before': {
                          left: '100%',
                        },
                      }}
                    >
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LoadingSpinner size="small" message="" color="inherit" />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Authenticating...
                          </Typography>
                        </Box>
                      ) : success ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Success! Redirecting...
                          </Typography>
                        </Box>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </Box>
                </Fade>
              </Box>
            )}

            {/* Register Form */}
            {tab === 'register' && (
              <Fade in={tab === 'register'} timeout={800}>
                <Box component="form" onSubmit={handleRegister} sx={{ width: '100%', maxWidth: 400, mx: 'auto', position: 'relative' }}>
                  {registerError && (
                    <Slide direction="down" in={!!registerError} timeout={300}>
                      <Alert severity="error" sx={{ width: '100%', mb: 3 }} icon={<ErrorIcon />}>
                        {registerError}
                      </Alert>
                    </Slide>
                  )}
                  {registerSuccess && (
                    <Slide direction="down" in={registerSuccess} timeout={300}>
                      <Alert severity="success" sx={{ width: '100%', mb: 3 }} icon={<CheckCircleIcon />}>
                        Registration successful! You can now log in.
                      </Alert>
                    </Slide>
                  )}
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="firstname"
                    label="First Name"
                    name="firstname"
                    autoComplete="given-name"
                    value={registerData.firstname}
                    onChange={handleRegisterChange}
                    disabled={registerLoading}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="lastname"
                    label="Last Name"
                    name="lastname"
                    autoComplete="family-name"
                    value={registerData.lastname}
                    onChange={handleRegisterChange}
                    disabled={registerLoading}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="register-email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    disabled={registerLoading}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="register-password"
                    autoComplete="new-password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    disabled={registerLoading}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="register-confirm-password"
                    autoComplete="new-password"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    disabled={registerLoading}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={registerLoading}
                    sx={{ mt: 2, mb: 2, py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem', fontWeight: 600 }}
                  >
                    {registerLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LoadingSpinner size="small" message="" color="inherit" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Registering...
                        </Typography>
                      </Box>
                    ) : (
                      'Register as Admin'
                    )}
                  </Button>
                </Box>
              </Fade>
            )}
          </Paper>
        </Slide>
      </Container>

      {/* Professional Loading Backdrop */}
      {loading && (
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
          open={loading}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              p: 4,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <LoadingSpinner 
              size="xlarge" 
              message="Authenticating your credentials..." 
              color="primary"
            />
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Please wait while we verify your account
            </Typography>
          </Box>
        </Backdrop>
      )}

      {/* Forgot Password Modal */}
      <Dialog 
        open={forgotPwOpen} 
        onClose={handleCloseForgotPassword}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        {!forgotPwSuccessState ? (
          <>
            <DialogTitle sx={{ 
              pb: 1, 
              fontWeight: 600,
              color: theme.palette.text.primary
            }}>
              Forgot Password
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                margin="normal"
                value={forgotPwEmail}
                onChange={(e) => setForgotPwEmail(e.target.value)}
                disabled={forgotPwLoading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              {forgotPwError && (
                <Alert severity="error" sx={{ mt: 2 }} icon={<ErrorIcon />}>
                  {forgotPwError}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={handleCloseForgotPassword} 
                disabled={forgotPwLoading}
                sx={{ 
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.text.primary,
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleForgotPassword}
                variant="contained"
                color="primary"
                disabled={forgotPwLoading}
                size="small"
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none', 
                  fontWeight: 600,
                  px: 3,
                  minWidth: '120px', // Fixed minimum width
                  height: '36px' // Fixed height for compact look
                }}
              >
                {forgotPwLoading ? (
                  <LoadingSpinner size="small" message="" color="inherit" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle sx={{ 
              pb: 1, 
              fontWeight: 600,
              color: theme.palette.text.primary,
              textAlign: 'center'
            }}>
              Check Your Email
            </DialogTitle>
            <DialogContent sx={{ pt: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: theme.palette.success.main }} />
              </Box>
              <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                We've sent password reset instructions to:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3, 
                  color: theme.palette.primary.main, 
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  padding: 1,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}
              >
                {forgotPwEmail}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                {forgotPwSuccess}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 3, 
                  color: theme.palette.text.secondary,
                  fontStyle: 'italic',
                  fontSize: '0.875rem'
                }}
              >
                Note: The reset link will open in your web browser. You can complete the password reset there.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
              <Button
                onClick={handleCloseForgotPassword}
                variant="contained"
                color="primary"
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none', 
                  fontWeight: 600,
                  px: 4,
                  py: 1
                }}
              >
                Back to Login
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Login; 