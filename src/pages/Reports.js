import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Tabs,
  Tab,
  Fab,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField
} from '@mui/material';
import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useReports } from '../hooks/useReports';
import PageHeader from '../components/PageHeader';
import ReportCard from '../components/reports/ReportCard';
import ReportFilters from '../components/reports/ReportFilters';
import DepartmentSummaryFilters from '../components/reports/DepartmentSummaryFilters';
import NewReportDialog from '../components/reports/NewReportDialog';
import ReportViewDialog from '../components/reports/ReportViewDialog';
import DepartmentSummary from '../components/reports/DepartmentSummary';
import reportService from '../services/reportService';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import WarningIcon from '@mui/icons-material/Warning';

const Reports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // All Reports filter state (match DepartmentSummaryFilters styling)
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [reportTypeFilter, setReportTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  
  // Department summary filter state
  const [deptSummaryStartDate, setDeptSummaryStartDate] = useState('');
  const [deptSummaryEndDate, setDeptSummaryEndDate] = useState('');
  const [showDeptSummaryFilters, setShowDeptSummaryFilters] = useState(false);

  const {
    // State
    reports,
    loading,
    error,
    isNewReportDialogOpen,
    newReport,
    activeTab,
    viewDialogOpen,
    selectedReport,
    isAdmin,
    users,
    departments,
    selectedUserId,
    selectedDepartmentId,
    
    // Actions
    setActiveTab,
    setIsNewReportDialogOpen,
    handleNewReportChange,
    handleAddReport,
    handleDeleteReport,
    handleViewReport,
    handleEditReport,
    handleCloseNewReportDialog,
    handleCloseViewDialog,
    setSelectedUserId,
    setSelectedDepartmentId,
    reportData,
    reportLoading
  } = useReports();

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Filtering logic
  const filteredReports = reports.filter(report => {
    const type = (report.type || '').toLowerCase();
    const matchesType = !reportTypeFilter || type === reportTypeFilter.toLowerCase();
    const matchesStatus = !statusFilter || (report.status || '').toLowerCase() === statusFilter.toLowerCase();
    const createdAt = new Date(report.createdAt);
    let matchesDate = true;
    if (dateRange.startDate) {
      matchesDate = matchesDate && createdAt >= new Date(dateRange.startDate);
    }
    if (dateRange.endDate) {
      matchesDate = matchesDate && createdAt <= new Date(dateRange.endDate);
    }
    return matchesType && matchesStatus && matchesDate;
  });

  const handleDownloadReport = async (report, format = 'csv') => {
    try {
      if (!report || !report.id) {
        console.error('Invalid report object provided for download');
        return;
      }
      // Map format to extension
      const extMap = { pdf: 'pdf', csv: 'csv', xlsx: 'xlsx', excel: 'xlsx' };
      const fileExtension = extMap[format] || format;
      const safeTitle = report.title ? report.title.replace(/[^a-zA-Z0-9]/g, '_') : `report_${report.id}`;
      const filename = `${safeTitle}.${fileExtension}`;
      await reportService.downloadReport(report.id, format, filename);
      showSnackbar('Report exported successfully!', 'success');
    } catch (err) {
      console.error('Download error:', err);
      showSnackbar('Failed to export report.', 'error');
    }
  };

  // Add helper to show snackbar
  const showSnackbar = (message, severity = 'info') => {
    window.dispatchEvent(new CustomEvent('show_snackbar', { detail: { message, severity } }));
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate and manage comprehensive reports"
        emoji="📊"
        color="secondary"
        actionButton={isAdmin ? {
          icon: <AddIcon />,
          text: "New Report",
          onClick: () => setIsNewReportDialogOpen(true),
          disabled: loading
        } : null}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters and Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary" 
          textColor="primary" 
          variant="fullWidth"
          sx={{ 
            '& .MuiTab-root': { 
              fontWeight: 600, 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              minHeight: { xs: 48, sm: 56 }
            } 
          }}
        >
          <Tab label="All Reports" />
          <Tab label="Department Summary" />
        </Tabs>
      </Paper>

      {/* Filtering UI - Only show for All Reports tab, styled like Department Summary */}
      {activeTab === 0 && (
        <ReportFilters
          showFilters={showAllFilters}
          setShowFilters={setShowAllFilters}
          reportTypeFilter={reportTypeFilter}
          setReportTypeFilter={setReportTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      )}

      {/* Content based on active tab */}
      {activeTab === 1 ? (
        // Department Summary Tab
        <>
          <DepartmentSummaryFilters
            showFilters={showDeptSummaryFilters}
            setShowFilters={setShowDeptSummaryFilters}
            startDate={deptSummaryStartDate}
            setStartDate={setDeptSummaryStartDate}
            endDate={deptSummaryEndDate}
            setEndDate={setDeptSummaryEndDate}
          />
          <DepartmentSummary 
            startDate={deptSummaryStartDate}
            endDate={deptSummaryEndDate}
          />
        </>
      ) : (
        // Reports Grid for All Reports tab
        <>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : filteredReports.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220, width: '100%' }}>
          <AssessmentIcon sx={{ fontSize: 64, color: theme.palette.action.disabled }} />
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>
            No reports found.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {'No reports available.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          {filteredReports.map((report) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={report.id}>
              <ReportCard
                report={report}
                isAdmin={isAdmin}
                onView={handleViewReport}
                onDelete={(id) => setConfirmDeleteId(id)}
                onDownload={handleDownloadReport}
              />
            </Grid>
          ))}
        </Grid>
          )}
        </>
      )}

      {/* New Report Dialog */}
      <NewReportDialog
        open={isNewReportDialogOpen}
        onClose={handleCloseNewReportDialog}
        newReport={newReport}
        onNewReportChange={handleNewReportChange}
        onAddReport={handleAddReport}
        loading={loading}
        isAdmin={isAdmin}
        users={users}
        departments={departments}
        selectedUserId={selectedUserId}
        selectedDepartmentId={selectedDepartmentId}
        onSelectedUserIdChange={setSelectedUserId}
        onSelectedDepartmentIdChange={setSelectedDepartmentId}
      />

      {/* Report View Dialog */}
      <ReportViewDialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        reportData={reportData}
        reportType={selectedReport?.type}
        loading={reportLoading}
        selectedReport={selectedReport}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this report? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)} variant="outlined">Cancel</Button>
          <Button onClick={() => { handleDeleteReport(confirmDeleteId); setConfirmDeleteId(null); }} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports; 