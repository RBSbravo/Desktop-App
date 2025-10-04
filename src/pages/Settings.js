import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tab,
  Tabs,
  IconButton,
  Avatar,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { useTheme } from '@mui/material/styles';
import PageHeader from '../components/PageHeader';
import { changePassword, api } from '../services/api';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Settings = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [currentTab, setCurrentTab] = useState(0);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    email: user.email || ''
  });
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [settings, setSettings] = useState({
    autoSave: true,
  });

  // Change password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAccountFieldChange = (field, value) => {
    setAccountForm(prev => ({ ...prev, [field]: value }));
    if (accountError) setAccountError('');
  };

  const handleAccountEditToggle = () => setIsEditingAccount(true);
  const handleAccountCancel = () => {
    setAccountForm({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || ''
    });
    setIsEditingAccount(false);
    setAccountError('');
  };

  const handleAccountSave = async () => {
    setIsSavingAccount(true);
    setAccountError('');
    try {
      const payload = {
        firstname: (accountForm.firstname || '').trim(),
        lastname: (accountForm.lastname || '').trim(),
        email: (accountForm.email || '').trim()
      };
      await api.users.updateUser({ id: user.id, ...payload });
      const updatedUser = { ...user, ...payload };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditingAccount(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (e) {
      setAccountError(e.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear success message when user starts typing
    if (passwordSuccess) {
      setPasswordSuccess(false);
    }
    
    // Clear general error when user starts typing
    if (passwordError) {
      setPasswordError('');
    }
  };

  const validatePasswords = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) {
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordError('');
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
      
      // Clear success message and logout after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
        
        // Clear user data and redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <PageHeader
        title="Settings"
        subtitle="Customize your application preferences"
        emoji="⚙️"
        color="primary"
      />

      {showSaveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Card>
        <CardContent>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<PersonIcon />} label="Account" />
            <Tab icon={<SecurityIcon />} label="Security" />
          </Tabs>

          {/* Account Settings */}
          <TabPanel value={currentTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                      mr: 2 
                    }}
                  >
                    {user.firstname?.[0]}{user.lastname?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {user.firstname} {user.lastname}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {user.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mb: 0 }}>
                    Account Information
                  </Typography>
                    {!isEditingAccount ? (
                    <Button variant="outlined" onClick={handleAccountEditToggle} startIcon={<EditIcon />}>Edit</Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={handleAccountCancel} startIcon={<CloseIcon />}>Cancel</Button>
                        <Button variant="contained" onClick={handleAccountSave} disabled={isSavingAccount} startIcon={<SaveIcon />}>
                        {isSavingAccount ? 'Saving...' : 'Save'}
                      </Button>
                    </Box>
                  )}
                </Box>
                {accountError && (
                  <Alert severity="error" sx={{ mb: 2 }}>{accountError}</Alert>
                )}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={isEditingAccount ? accountForm.firstname : (user.firstname || '')}
                      onChange={(e) => handleAccountFieldChange('firstname', e.target.value)}
                      disabled={!isEditingAccount}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={isEditingAccount ? accountForm.lastname : (user.lastname || '')}
                      onChange={(e) => handleAccountFieldChange('lastname', e.target.value)}
                      disabled={!isEditingAccount}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={isEditingAccount ? accountForm.email : (user.email || '')}
                      onChange={(e) => handleAccountFieldChange('email', e.target.value)}
                      disabled={!isEditingAccount}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={user.role || ''}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={user.department?.name || user.department || 'N/A'}
                      disabled
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>




          {/* Security Settings */}
          <TabPanel value={currentTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                
                {passwordSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Password changed successfully! You will be logged out for security.
                  </Alert>
                )}
                
                {passwordError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {passwordError}
                  </Alert>
                )}
                
                <TextField
                  fullWidth
                  type={showPasswords.current ? 'text' : 'password'}
                  label="Current Password"
                  variant="outlined"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('current')}
                          edge="end"
                        >
                          {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  type={showPasswords.new ? 'text' : 'password'}
                  label="New Password"
                  variant="outlined"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('new')}
                          edge="end"
                        >
                          {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  type={showPasswords.confirm ? 'text' : 'password'}
                  label="Confirm New Password"
                  variant="outlined"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('confirm')}
                          edge="end"
                        >
                          {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  startIcon={isChangingPassword ? <CircularProgress size={20} /> : <SecurityIcon />}
                >
                  {isChangingPassword ? 'Changing Password...' : 'Update Password'}
                </Button>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  After changing your password, you will be automatically logged out for security purposes.
                </Typography>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Global Save button removed: actions are handled inline for better UX */}
    </Box>
  );
};

export default Settings; 