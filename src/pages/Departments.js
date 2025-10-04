import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Fab,
  Avatar,
  Chip,
  useMediaQuery
} from '@mui/material';
import { 
  Add as AddIcon, 
  Group as GroupIcon, 
  Person as PersonIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Info as InfoIcon,
  Business as BusinessIcon,
  SupervisorAccount as SupervisorAccountIcon
} from '@mui/icons-material';
import {
  fetchDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment
} from '../services/api';
import PageHeader from '../components/PageHeader';

// Helper component: Only show tooltip if text is truncated
function TruncateTooltip({ title, children, ...props }) {
  const textRef = useRef(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      const el = textRef.current;
      if (el) {
        const isTruncated = el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
        setTruncated(isTruncated);
      }
    };

    // Check immediately
    checkTruncation();
    
    // Check again after a small delay to ensure proper detection
    const timer = setTimeout(checkTruncation, 100);
    
    return () => clearTimeout(timer);
  }, [children, title]);

  if (truncated) {
    return (
      <Tooltip title={title} arrow {...props}>
        <span ref={textRef} style={{ display: 'block', width: '100%' }}>{children}</span>
      </Tooltip>
    );
  }
  return <span ref={textRef} style={{ display: 'block', width: '100%' }}>{children}</span>;
}

const Departments = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  // Mock admin role check
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    setLoading(true);
    fetchDepartments()
      .then(data => {
        setDepartments(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load departments.');
        setLoading(false);
      });
    // Real-time updates
    const handleRealtime = () => { fetchDepartments().then(data => setDepartments(data)); };
    window.addEventListener('user_update', handleRealtime);
    window.addEventListener('new_comment', handleRealtime);
    window.addEventListener('notification', handleRealtime);
    window.addEventListener('ticket_update', handleRealtime);
    window.addEventListener('task_update', handleRealtime);
    return () => {
      window.removeEventListener('user_update', handleRealtime);
      window.removeEventListener('new_comment', handleRealtime);
      window.removeEventListener('notification', handleRealtime);
      window.removeEventListener('ticket_update', handleRealtime);
      window.removeEventListener('task_update', handleRealtime);
    };
  }, []);

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewDept({ name: '', description: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDept((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDepartment = async () => {
    if (!newDept.name) return;
    setLoading(true);
    try {
      const created = await addDepartment({
        name: newDept.name,
        description: newDept.description
      });
      setDepartments(prev => [...prev, created]);
      handleCloseDialog();
    } catch {
      setError('Failed to add department.');
    }
    setLoading(false);
  };

  const handleEditClick = (dept) => {
    setSelectedDept(dept);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (dept) => {
    setSelectedDept(dept);
    setDeleteDialogOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedDept((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    setLoading(true);
    try {
      const updated = await updateDepartment({
        id: selectedDept.id,
        name: selectedDept.name,
        description: selectedDept.description
      });
      setDepartments(prev => prev.map(d => d.id === updated.id ? updated : d));
      setEditDialogOpen(false);
      setSelectedDept(null);
    } catch {
      setError('Failed to update department.');
    }
    setLoading(false);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await deleteDepartment(selectedDept.id);
      setDepartments(prev => prev.filter(d => d.id !== selectedDept.id));
      setDeleteDialogOpen(false);
      setSelectedDept(null);
    } catch (err) {
      setError(err.message || 'Failed to delete department.');
    }
    setLoading(false);
  };

  const handleViewClick = (dept) => {
    // Try to find department head name if available
    let headName = '';
    if (dept.head && (dept.head.firstname || dept.head.lastname)) {
      headName = `${dept.head.firstname || ''} ${dept.head.lastname || ''}`.trim();
    } else if (dept.headName) {
      headName = dept.headName;
    }
    setSelectedDept({ ...dept, headName });
    setViewDialogOpen(true);
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <PageHeader
        title="Department Management"
        subtitle="Organize and manage company departments"
        emoji="🏢"
        color="primary"
        actionButton={isAdmin ? {
          icon: <AddIcon />,
          text: "Add Department",
          onClick: handleOpenDialog,
          disabled: loading
        } : null}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : departments.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220, width: '100%' }}>
          <GroupIcon sx={{ fontSize: 64, color: theme.palette.action.disabled }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            No departments found.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          {departments.map((dept) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={dept.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  cursor: 'pointer'
                }}
                onClick={() => handleViewClick(dept)}
              >
                <CardContent sx={{ 
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    mb: { xs: 1.5, sm: 2 } 
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      flex: 1,
                      minWidth: 0
                    }}>
                      <Avatar 
                        sx={{ 
                          mr: { xs: 1.5, sm: 2 }, 
                          bgcolor: theme.palette.primary.main,
                          width: { xs: 48, sm: 60 },
                          height: { xs: 48, sm: 60 },
                          fontSize: { xs: '1.25rem', sm: '1.5rem' },
                          fontWeight: 600
                        }}
                      >
                        <BusinessIcon />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <TruncateTooltip title={dept.name}>
                          <Typography 
                            variant={isMobile ? "subtitle1" : "h6"} 
                            sx={{ 
                              fontWeight: 600, 
                              mb: 0.5,
                              fontSize: { xs: '0.875rem', sm: '1.25rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: theme.palette.primary.main
                            }}
                          >
                      {dept.name}
                    </Typography>
                        </TruncateTooltip>
                        <Typography 
                          color="textSecondary" 
                          variant="body2" 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <GroupIcon fontSize={isMobile ? "small" : "small"} />
                          Department
                        </Typography>
                      </Box>
                    </Box>
                    {isAdmin && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size={isMobile ? "small" : "small"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(dept);
                            }}
                            sx={{ 
                              color: theme.palette.primary.main,
                              p: { xs: 0.5, sm: 0.75 }
                            }}
                          >
                            <EditIcon fontSize={isMobile ? "small" : "small"} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size={isMobile ? "small" : "small"}
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(dept);
                            }}
                            sx={{ p: { xs: 0.5, sm: 0.75 } }}
                          >
                            <DeleteIcon fontSize={isMobile ? "small" : "small"} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ 
                    mb: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: { xs: 0.5, sm: 1 }
                  }}>
                    <Chip
                      label="Active"
                      color="success"
                      size={isMobile ? "small" : "small"}
                      sx={{ 
                        mr: { xs: 0, sm: 1 }, 
                        mb: { xs: 0.5, sm: 1 }, 
                        fontWeight: 600,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        height: { xs: 20, sm: 24 }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: { xs: 1.5, sm: 2 },
                    flex: 1
                  }}>
                    <SupervisorAccountIcon 
                      fontSize={isMobile ? "small" : "small"} 
                      sx={{ 
                        mr: 1, 
                        color: theme.palette.text.secondary,
                        flexShrink: 0
                      }} 
                    />
                    <TruncateTooltip title={dept.head && (dept.head.firstname || dept.head.lastname) 
                      ? `${dept.head.firstname || ''} ${dept.head.lastname || ''}`.trim()
                      : dept.headName || 'No Head Assigned'
                    }>
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {dept.head && (dept.head.firstname || dept.head.lastname) 
                          ? `${dept.head.firstname || ''} ${dept.head.lastname || ''}`.trim()
                          : dept.headName || 'No Head Assigned'
                        }
                      </Typography>
                    </TruncateTooltip>
                  </Box>
                  
                  {dept.description && (
                    <TruncateTooltip title={dept.description}>
                      <Typography 
                        variant="body2" 
                        color="textSecondary" 
                        sx={{ 
                          mb: { xs: 1.5, sm: 2 }, 
                          fontStyle: 'italic',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.4
                        }}
                      >
                        "{dept.description}"
                      </Typography>
                    </TruncateTooltip>
                  )}
                  
                  <Box 
                    sx={{ 
                      mt: 'auto',
                      pt: { xs: 1.5, sm: 2 },
                      borderTop: `1px solid ${theme.palette.divider}`,
                      textAlign: 'center'
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="primary" 
                      sx={{ 
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      View Details
                  </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {/* Add Department Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Department</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Department Name"
              name="name"
              value={newDept.name}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newDept.description}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleAddDepartment}>Add</Button>
        </DialogActions>
      </Dialog>
      {/* Edit Department Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Department</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Department Name"
              name="name"
              value={selectedDept?.name || ''}
              onChange={handleEditChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={selectedDept?.description || ''}
              onChange={handleEditChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Department Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the department <b>{selectedDept?.name}</b>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Delete</Button>
        </DialogActions>
      </Dialog>
      {/* View Department Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <GroupIcon sx={{ color: theme.palette.primary.main, fontSize: 36 }} />
          <Box>
            <TruncateTooltip title={selectedDept?.name}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.primary.main, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '1.25rem' }}>
              {selectedDept?.name}
            </Typography>
            </TruncateTooltip>
            <Typography variant="body2" color="text.secondary">
              Department Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
              <InfoIcon color="primary" />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Department ID
                </Typography>
                <TruncateTooltip title={selectedDept?.id}>
                  <Typography variant="body1" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedDept?.id}
                </Typography>
                </TruncateTooltip>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
              <GroupIcon color="primary" />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Department Name
                </Typography>
                <TruncateTooltip title={selectedDept?.name}>
                  <Typography variant="body1" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedDept?.name}
                </Typography>
                </TruncateTooltip>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
              <PersonIcon color="primary" />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Department Head
                </Typography>
                <TruncateTooltip title={selectedDept?.headName || 'No Department Head Assigned'}>
                  <Typography variant="body1" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedDept?.headName || 'No Department Head Assigned'}
                </Typography>
                </TruncateTooltip>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
              <InfoIcon color="primary" />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Description
                </Typography>
                <TruncateTooltip title={selectedDept?.description || 'No description provided.'}>
                  <Typography variant="body1" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedDept?.description || 'No description provided.'}
                </Typography>
                </TruncateTooltip>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Departments; 