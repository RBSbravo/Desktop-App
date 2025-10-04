import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTickets } from '../services/api';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { ViewTicketDialog } from '../components/tickets/TicketDialogs';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTicket = async () => {
      setLoading(true);
      try {
        // fetchTickets returns an array, so filter by id
        const tickets = await fetchTickets();
        const found = tickets.find(t => t.id === id);
        setTicket(found || null);
        setError(found ? null : 'Ticket not found');
      } catch (err) {
        setError('Failed to load ticket');
      }
      setLoading(false);
    };
    loadTicket();
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 4 }}><Typography color="error" variant="h6">{error}</Typography><Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Back</Button></Box>;

  // Reuse ViewTicketDialog layout, but as a page
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Ticket Details</Typography>
      <ViewTicketDialog
        open={true}
        onClose={() => navigate(-1)}
        ticket={ticket}
        departments={[]}
        getStatusColor={() => 'primary'}
        getStatusIcon={() => null}
        getPriorityColor={() => 'primary'}
        getPriorityIcon={() => null}
        getTicketFiles={() => []}
        onFileDelete={() => {}}
        onFileDownload={() => {}}
        onEdit={() => {}}
        isMobile={false}
      />
    </Box>
  );
};

export default TicketDetail; 