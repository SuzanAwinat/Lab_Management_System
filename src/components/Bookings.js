import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Edit, BookOnline, AccessTime, Person, AttachMoney } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    lab_id: '',
    start_time: dayjs(),
    end_time: dayjs().add(1, 'hour'),
    purpose: '',
    participants: 1,
    notes: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchLabs();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/api/bookings');
      setBookings(response.data);
    } catch (error) {
      setError('Failed to fetch bookings');
      console.error('Bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabs = async () => {
    try {
      const response = await api.get('/api/labs');
      setLabs(response.data);
    } catch (error) {
      console.error('Labs error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        ...formData,
        lab_id: parseInt(formData.lab_id),
        participants: parseInt(formData.participants),
        start_time: formData.start_time.toISOString(),
        end_time: formData.end_time.toISOString()
      };

      if (editingBooking) {
        await api.put(`/api/bookings/${editingBooking.id}`, bookingData);
        toast.success('Booking updated successfully!');
      } else {
        const response = await api.post('/api/bookings', bookingData);
        toast.success(`Booking created successfully! Cost: $${response.data.cost}`);
      }

      handleCloseDialog();
      fetchBookings();
    } catch (error) {
      toast.error('Failed to save booking');
      console.error('Save booking error:', error);
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setFormData({
      lab_id: booking.lab_id.toString(),
      start_time: dayjs(booking.start_time),
      end_time: dayjs(booking.end_time),
      purpose: booking.purpose || '',
      participants: booking.participants,
      notes: booking.notes || ''
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBooking(null);
    setFormData({
      lab_id: '',
      start_time: dayjs(),
      end_time: dayjs().add(1, 'hour'),
      purpose: '',
      participants: 1,
      notes: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const calculateDuration = (startTime, endTime) => {
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    const duration = end.diff(start, 'hours', true);
    return duration.toFixed(1);
  };

  const isUpcoming = (startTime) => {
    return dayjs(startTime).isAfter(dayjs());
  };

  const isPast = (endTime) => {
    return dayjs(endTime).isBefore(dayjs());
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" color="primary">
            Lab Bookings
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Book Lab
          </Button>
        </Box>

        {/* Booking Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {bookings.map((booking) => (
            <Grid item xs={12} md={6} lg={4} key={booking.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BookOnline sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" component="div">
                      {booking.lab_name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(booking)}
                      sx={{ ml: 'auto' }}
                    >
                      <Edit />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {booking.user_name} ({booking.participants} participants)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {dayjs(booking.start_time).format('MMM DD, YYYY HH:mm')} - 
                      {dayjs(booking.end_time).format('HH:mm')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoney sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      ${booking.cost} ({calculateDuration(booking.start_time, booking.end_time)}h)
                    </Typography>
                  </Box>

                  {booking.purpose && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Purpose: {booking.purpose}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                    {isUpcoming(booking.start_time) && (
                      <Chip
                        label="Upcoming"
                        color="info"
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {isPast(booking.end_time) && (
                      <Chip
                        label="Past"
                        color="default"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {booking.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                      Notes: {booking.notes}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Booking Table */}
        <Paper sx={{ mt: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lab</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Participants</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.lab_name}</TableCell>
                    <TableCell>{booking.user_name}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(booking.start_time).format('MMM DD, YYYY')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(booking.start_time).format('HH:mm')} - {dayjs(booking.end_time).format('HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>{calculateDuration(booking.start_time, booking.end_time)}h</TableCell>
                    <TableCell>{booking.participants}</TableCell>
                    <TableCell>${booking.cost}</TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(booking)} size="small">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingBooking ? 'Edit Booking' : 'Book New Lab'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Lab</InputLabel>
                    <Select
                      value={formData.lab_id}
                      label="Lab"
                      onChange={(e) => setFormData({ ...formData, lab_id: e.target.value })}
                    >
                      {labs.map((lab) => (
                        <MenuItem key={lab.id} value={lab.id}>
                          {lab.name} - {lab.campus_name} (${lab.hourly_rate}/hour)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="Start Time"
                    value={formData.start_time}
                    onChange={(date) => setFormData({ 
                      ...formData, 
                      start_time: date,
                      end_time: date.add(1, 'hour')
                    })}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                    minDateTime={dayjs()}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="End Time"
                    value={formData.end_time}
                    onChange={(date) => setFormData({ ...formData, end_time: date })}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                    minDateTime={formData.start_time}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Participants"
                    type="number"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                    margin="normal"
                    inputProps={{ min: 1 }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    margin="normal"
                    multiline
                    rows={3}
                  />
                </Grid>
                {formData.lab_id && formData.start_time && formData.end_time && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Booking Summary:
                      </Typography>
                      <Typography variant="body2">
                        Duration: {calculateDuration(formData.start_time, formData.end_time)} hours
                      </Typography>
                      <Typography variant="body2">
                        Estimated Cost: ${(
                          calculateDuration(formData.start_time, formData.end_time) * 
                          (labs.find(lab => lab.id === parseInt(formData.lab_id))?.hourly_rate || 0)
                        ).toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingBooking ? 'Update Booking' : 'Book Lab'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default Bookings;