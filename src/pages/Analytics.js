import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
  LinearProgress,
  Divider,
  Button
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Analytics = () => {
  const theme = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [dateRange, setDateRange] = useState('6months');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      loadAnalytics();
    }
    // Real-time updates
    const handleRealtime = () => { loadAnalytics(); };
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
  }, [selectedDepartment, dateRange]);

  const loadDepartments = async () => {
    try {
      const response = await api.getDepartments();
      const departmentsData = response.data || response;
      setDepartments(departmentsData);
      if (departmentsData && departmentsData.length > 0) {
        setSelectedDepartment(departmentsData[0].id);
      }
    } catch (err) {
      setError('Failed to load departments');
      console.error('Error loading departments:', err);
    }
  };

  const loadAnalytics = async () => {
    if (!selectedDepartment) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const startDate = getStartDate(dateRange);
      const endDate = new Date().toISOString().split('T')[0];
      
      const response = await api.getDepartmentAnalytics(selectedDepartment, {
        startDate,
        endDate
      });
      
      const analyticsData = response.data || response;
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAnalytics();
  };

  const getStartDate = (range) => {
    const date = new Date();
    switch (range) {
      case '1week':
        date.setDate(date.getDate() - 7);
        break;
      case '1month':
        date.setMonth(date.getMonth() - 1);
        break;
      case '3months':
        date.setMonth(date.getMonth() - 3);
        break;
      case '6months':
        date.setMonth(date.getMonth() - 6);
        break;
      case '1year':
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setMonth(date.getMonth() - 6);
    }
    return date.toISOString().split('T')[0];
  };

  const formatDuration = (milliseconds) => {
    if (milliseconds === null || milliseconds === undefined) return 'No data';
    if (isNaN(milliseconds) || milliseconds < 0) return 'Invalid data';
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
    return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getDepartmentName = (id) => {
    const dept = departments.find(d => d.id === id);
    return dept ? dept.name : 'Unknown Department';
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 80) return 'success';
    if (efficiency >= 60) return 'warning';
    return 'error';
  };

  const getDateRangeLabel = (range) => {
    switch (range) {
      case '1week':
        return 'Last Week';
      case '1month':
        return 'Last Month';
      case '3months':
        return 'Last 3 Months';
      case '6months':
        return 'Last 6 Months';
      case '1year':
        return 'Last Year';
      default:
        return 'Last 6 Months';
    }
  };

  if (loading && !analytics) {
    return (
      <LoadingSpinner 
        message="Loading analytics data..." 
        size="large"
      />
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Comprehensive insights and performance metrics"
        emoji="📊"
        color="secondary"
        onRefresh={handleRefresh}
      />
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Card elevation={2} sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AssessmentIcon sx={{ color: 'secondary.main', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filter Options
        </Typography>
          </Box>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  label="Department"
                  sx={{ fontWeight: 500 }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
          <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  label="Date Range"
                  sx={{ fontWeight: 500 }}
                >
                  <MenuItem value="1week">Last Week</MenuItem>
                  <MenuItem value="1month">Last Month</MenuItem>
                  <MenuItem value="3months">Last 3 Months</MenuItem>
                  <MenuItem value="6months">Last 6 Months</MenuItem>
                  <MenuItem value="1year">Last Year</MenuItem>
          </Select>
        </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {analytics && (
        <>
          {/* Department Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Total Employees
                      </Typography>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                        {analytics.departmentStats?.totalEmployees || 0}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                          Active team
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: 'primary.light',
                        borderRadius: '16px',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 60,
                        height: 60
                      }}
                    >
                      <PeopleIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Active Employees
                      </Typography>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                        {analytics.departmentStats?.activeEmployees || 0}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                          Currently online
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: 'success.light',
                        borderRadius: '16px',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 60,
                        height: 60
                      }}
                    >
                      <PeopleIcon sx={{ color: 'success.main', fontSize: 28 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Department Efficiency
                      </Typography>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                        {analytics.departmentStats?.departmentEfficiency?.toFixed(1) || 0}%
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TrendingUpIcon sx={{ 
                          color: analytics.departmentStats?.departmentEfficiency >= 80 ? 'success.main' : 
                                 analytics.departmentStats?.departmentEfficiency >= 60 ? 'warning.main' : 'error.main', 
                          fontSize: 20 
                        }} />
                        <Typography variant="body2" sx={{ 
                          color: analytics.departmentStats?.departmentEfficiency >= 80 ? 'success.main' : 
                                 analytics.departmentStats?.departmentEfficiency >= 60 ? 'warning.main' : 'error.main',
                          fontWeight: 600 
                        }}>
                          {analytics.departmentStats?.departmentEfficiency >= 80 ? 'Excellent' : 
                           analytics.departmentStats?.departmentEfficiency >= 60 ? 'Good' : 'Needs improvement'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: 'info.light',
                        borderRadius: '16px',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 60,
                        height: 60
                      }}
                    >
                      <SpeedIcon sx={{ color: 'info.main', fontSize: 28 }} />
                    </Box>
      </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Avg. Task Completion
                      </Typography>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                        {formatDuration(analytics.departmentStats?.averageTaskCompletionTime)}
                      </Typography>
                      {analytics.departmentStats?.averageTaskCompletionTime !== null && analytics.departmentStats?.averageTaskCompletionTime !== undefined ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <TrendingUpIcon sx={{ 
                            color: analytics.departmentStats?.averageTaskCompletionTime < 86400000 ? 'success.main' : 
                                   analytics.departmentStats?.averageTaskCompletionTime < 259200000 ? 'warning.main' : 'error.main', 
                            fontSize: 20 
                          }} />
                          <Typography variant="body2" sx={{ 
                            color: analytics.departmentStats?.averageTaskCompletionTime < 86400000 ? 'success.main' : 
                                   analytics.departmentStats?.averageTaskCompletionTime < 259200000 ? 'warning.main' : 'error.main',
                            fontWeight: 600 
                          }}>
                            {analytics.departmentStats?.averageTaskCompletionTime < 86400000 ? 'Fast delivery' : 
                             analytics.departmentStats?.averageTaskCompletionTime < 259200000 ? 'Moderate speed' : 'Slow delivery'}
                          </Typography>
                        </Box>
                      ) : (
                      <Box display="flex" alignItems="center" gap={1}>
                          <TrendingUpIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            No completed tasks
              </Typography>
                      </Box>
                      )}
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: 'warning.light',
                        borderRadius: '16px',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 60,
                        height: 60
                      }}
                    >
                      <ScheduleIcon sx={{ color: 'warning.main', fontSize: 28 }} />
                    </Box>
                  </Box>
            </CardContent>
          </Card>
        </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <BarChartIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Task Metrics ({getDateRangeLabel(dateRange)})
              </Typography>
                  </Box>
              <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={(analytics.taskMetrics || []).filter(item => item.name !== 'Total')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#00C49F" name="Completed" />
                      <Bar dataKey="inProgress" fill="#FFBB28" name="In Progress" />
                      <Bar dataKey="pending" fill="#FF8042" name="Pending" />
                    </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <BarChartIcon sx={{ color: 'secondary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Ticket Metrics ({getDateRangeLabel(dateRange)})
              </Typography>
                  </Box>
              <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={(analytics.ticketMetrics || []).filter(item => item.name !== 'Total')}>
                  <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                  <Legend />
                      <Bar dataKey="resolved" fill="#00C49F" name="Resolved" />
                      <Bar dataKey="closed" fill="#8884D8" name="Closed" />
                      <Bar dataKey="pending" fill="#FF8042" name="Pending" />
                      <Bar dataKey="inProgress" fill="#FFBB28" name="In Progress" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

          {/* User Performance */}
          <Card elevation={2} sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TimelineIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  User Performance Overview
        </Typography>
      </Box>
      <Grid container spacing={3}>
                {(analytics.userPerformance || []).map((user, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[4]
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 40, height: 40 }}>
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {user.name}
                            </Typography>
                            <Chip 
                              label={user.role} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                              color="primary"
                            />
                          </Box>
                        </Box>
                        
                        <Stack spacing={2}>
                           {/* Show Tasks Completed only for employees with tasks */}
                           {user.role !== 'department_head' && user.tasks > 0 && (
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                   Tasks Handled
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {user.tasks}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min((user.tasks / 50) * 100, 100)}
                                 sx={{ 
                                   height: 6, 
                                   borderRadius: 3,
                                   '& .MuiLinearProgress-bar': {
                                     backgroundColor: user.tasks >= 40 ? '#4caf50' : user.tasks >= 20 ? '#ff9800' : '#f44336'
                                   }
                                 }}
                            />
                          </Box>
                           )}
                          
                           {/* Show Tickets Handled for employees with tickets but no tasks */}
                           {user.role !== 'department_head' && user.tasks === 0 && user.tickets > 0 && (
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Tickets Handled
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {user.tickets}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min((user.tickets / 30) * 100, 100)}
                                 sx={{ 
                                   height: 6, 
                                   borderRadius: 3,
                                   '& .MuiLinearProgress-bar': {
                                     backgroundColor: user.tickets >= 25 ? '#4caf50' : user.tickets >= 15 ? '#ff9800' : '#f44336'
                                   }
                                 }}
                               />
                             </Box>
                           )}
                          
                          {/* Show Tickets Managed only for department heads */}
                          {user.role === 'department_head' && (
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Tickets Managed
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {user.tickets}
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min((user.tickets / 50) * 100, 100)}
                                sx={{ 
                                  height: 6, 
                                  borderRadius: 3,
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: user.tickets >= 40 ? '#4caf50' : user.tickets >= 25 ? '#ff9800' : '#f44336'
                                  }
                                }}
                            />
                          </Box>
                          )}
                          
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                 {user.role === 'department_head' ? 'Ticket Efficiency' : 
                                  (user.tasks > 0 ? 'Task Efficiency' : 'Ticket Efficiency')}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {user.efficiency}%
              </Typography>
                            </Box>
                             <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                               {user.efficiency >= 80 ? 
                                 (user.role === 'department_head' || user.tasks === 0 ? 'Excellent ticket management' : 'Excellent task completion') : 
                                user.efficiency >= 60 ? 
                                 (user.role === 'department_head' || user.tasks === 0 ? 'Good ticket management' : 'Good task completion') : 
                                 (user.role === 'department_head' || user.tasks === 0 ? 'Needs ticket management improvement' : 'Needs task completion improvement')}
                             </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={user.efficiency}
                              color={getEfficiencyColor(user.efficiency)}
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3
                                }
                              }}
                            />
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Distribution Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PieChartIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Task Status Distribution
              </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                        data={(() => {
                          // Use only the "Total" data for pie chart, or aggregate all months if no "Total" exists
                          const totalData = analytics.taskMetrics?.find(item => item.name === 'Total');
                          if (totalData) {
                            const acc = [];
                            if (totalData.completed > 0) acc.push({ name: 'Completed', value: totalData.completed, fill: COLORS[0] });
                            if (totalData.inProgress > 0) acc.push({ name: 'In Progress', value: totalData.inProgress, fill: COLORS[1] });
                            if (totalData.pending > 0) acc.push({ name: 'Pending', value: totalData.pending, fill: COLORS[2] });
                            return acc;
                          } else {
                            // Fallback: aggregate all months
                            return analytics.taskMetrics?.reduce((acc, item) => {
                              if (item.completed > 0) acc.push({ name: 'Completed', value: item.completed, fill: COLORS[0] });
                              if (item.inProgress > 0) acc.push({ name: 'In Progress', value: item.inProgress, fill: COLORS[1] });
                              if (item.pending > 0) acc.push({ name: 'Pending', value: item.pending, fill: COLORS[2] });
                              return acc;
                            }, []) || [];
                          }
                        })()}
                    cx="50%"
                    cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                  >
                        {(() => {
                          // Use only the "Total" data for pie chart, or aggregate all months if no "Total" exists
                          const totalData = analytics.taskMetrics?.find(item => item.name === 'Total');
                          if (totalData) {
                            const acc = [];
                            if (totalData.completed > 0) acc.push({ name: 'Completed', value: totalData.completed, fill: COLORS[0] });
                            if (totalData.inProgress > 0) acc.push({ name: 'In Progress', value: totalData.inProgress, fill: COLORS[1] });
                            if (totalData.pending > 0) acc.push({ name: 'Pending', value: totalData.pending, fill: COLORS[2] });
                            return acc;
                          } else {
                            // Fallback: aggregate all months
                            return analytics.taskMetrics?.reduce((acc, item) => {
                              if (item.completed > 0) acc.push({ name: 'Completed', value: item.completed, fill: COLORS[0] });
                              if (item.inProgress > 0) acc.push({ name: 'In Progress', value: item.inProgress, fill: COLORS[1] });
                              if (item.pending > 0) acc.push({ name: 'Pending', value: item.pending, fill: COLORS[2] });
                              return acc;
                            }, []) || [];
                          }
                        })().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                      <RechartsTooltip />
                      <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PieChartIcon sx={{ color: 'secondary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Ticket Status Distribution
              </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={(() => {
                          // Use only the "Total" data for pie chart, or aggregate all months if no "Total" exists
                          const totalData = analytics.ticketMetrics?.find(item => item.name === 'Total');
                          if (totalData) {
                            const acc = [];
                            if (totalData.resolved > 0) acc.push({ name: 'Resolved', value: totalData.resolved, fill: COLORS[0] });
                            if (totalData.closed > 0) acc.push({ name: 'Closed', value: totalData.closed, fill: COLORS[1] });
                            if (totalData.pending > 0) acc.push({ name: 'Pending', value: totalData.pending, fill: COLORS[2] });
                            if (totalData.inProgress > 0) acc.push({ name: 'In Progress', value: totalData.inProgress, fill: COLORS[3] });
                            return acc;
                          } else {
                            // Fallback: aggregate all months
                            return analytics.ticketMetrics?.reduce((acc, item) => {
                              if (item.resolved > 0) acc.push({ name: 'Resolved', value: item.resolved, fill: COLORS[0] });
                              if (item.closed > 0) acc.push({ name: 'Closed', value: item.closed, fill: COLORS[1] });
                              if (item.pending > 0) acc.push({ name: 'Pending', value: item.pending, fill: COLORS[2] });
                              if (item.inProgress > 0) acc.push({ name: 'In Progress', value: item.inProgress, fill: COLORS[3] });
                              return acc;
                            }, []) || [];
                          }
                        })()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(() => {
                          // Use only the "Total" data for pie chart, or aggregate all months if no "Total" exists
                          const totalData = analytics.ticketMetrics?.find(item => item.name === 'Total');
                          if (totalData) {
                            const acc = [];
                            if (totalData.resolved > 0) acc.push({ name: 'Resolved', value: totalData.resolved, fill: COLORS[0] });
                            if (totalData.closed > 0) acc.push({ name: 'Closed', value: totalData.closed, fill: COLORS[1] });
                            if (totalData.pending > 0) acc.push({ name: 'Pending', value: totalData.pending, fill: COLORS[2] });
                            if (totalData.inProgress > 0) acc.push({ name: 'In Progress', value: totalData.inProgress, fill: COLORS[3] });
                            return acc;
                          } else {
                            // Fallback: aggregate all months
                            return analytics.ticketMetrics?.reduce((acc, item) => {
                              if (item.resolved > 0) acc.push({ name: 'Resolved', value: item.resolved, fill: COLORS[0] });
                              if (item.closed > 0) acc.push({ name: 'Closed', value: item.closed, fill: COLORS[1] });
                              if (item.pending > 0) acc.push({ name: 'Pending', value: item.pending, fill: COLORS[2] });
                              if (item.inProgress > 0) acc.push({ name: 'In Progress', value: item.inProgress, fill: COLORS[3] });
                              return acc;
                            }, []) || [];
                          }
                        })().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                  <Legend />
                    </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
        </>
      )}
    </Box>
  );
};

export default Analytics; 
