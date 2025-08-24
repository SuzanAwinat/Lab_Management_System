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
  Alert
} from '@mui/material';
import { Add, Edit, School, LocationOn, Email, Phone } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

function Campuses() {
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact_email: '',
    contact_phone: '',
    budget_allocated: ''
  });

  useEffect(() => {
    fetchCampuses();
  }, []);

  const fetchCampuses = async () => {
    try {
      const response = await api.get('/api/campuses');
      setCampuses(response.data);
    } catch (error) {
      setError('Failed to fetch campuses');
      console.error('Campuses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const campusData = {
        ...formData,
        budget_allocated: parseFloat(formData.budget_allocated) || 0
      };

      if (editingCampus) {
        await api.put(`/api/campuses/${editingCampus.id}`, campusData);
        toast.success('Campus updated successfully!');
      } else {
        await api.post('/api/campuses', campusData);
        toast.success('Campus created successfully!');
      }

      setDialogOpen(false);
      setEditingCampus(null);
      setFormData({
        name: '',
        location: '',
        contact_email: '',
        contact_phone: '',
        budget_allocated: ''
      });
      fetchCampuses();
    } catch (error) {
      toast.error('Failed to save campus');
      console.error('Save campus error:', error);
    }
  };

  const handleEdit = (campus) => {
    setEditingCampus(campus);
    setFormData({
      name: campus.name,
      location: campus.location,
      contact_email: campus.contact_email || '',
      contact_phone: campus.contact_phone || '',
      budget_allocated: campus.budget_allocated.toString()
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCampus(null);
    setFormData({
      name: '',
      location: '',
      contact_email: '',
      contact_phone: '',
      budget_allocated: ''
    });
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" color="primary">
          Campus Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Add Campus
        </Button>
      </Box>

      {/* Campus Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {campuses.map((campus) => (
          <Grid item xs={12} md={6} lg={4} key={campus.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <School sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" component="div">
                    {campus.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(campus)}
                    sx={{ ml: 'auto' }}
                  >
                    <Edit />
                  </IconButton>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {campus.location}
                  </Typography>
                </Box>
                
                {campus.contact_email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {campus.contact_email}
                    </Typography>
                  </Box>
                )}
                
                {campus.contact_phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Phone sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {campus.contact_phone}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Chip
                    label={`${campus.labs_count} Labs`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    Budget: ${campus.budget_allocated.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Used: ${campus.budget_used.toLocaleString()} ({((campus.budget_used / campus.budget_allocated) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Campus Table */}
      <Paper sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Labs</TableCell>
                <TableCell>Budget Allocated</TableCell>
                <TableCell>Budget Used</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campuses.map((campus) => (
                <TableRow key={campus.id}>
                  <TableCell>{campus.name}</TableCell>
                  <TableCell>{campus.location}</TableCell>
                  <TableCell>
                    {campus.contact_email && (
                      <Typography variant="body2">{campus.contact_email}</Typography>
                    )}
                    {campus.contact_phone && (
                      <Typography variant="body2">{campus.contact_phone}</Typography>
                    )}
                  </TableCell>
                  <TableCell>{campus.labs_count}</TableCell>
                  <TableCell>${campus.budget_allocated.toLocaleString()}</TableCell>
                  <TableCell>${campus.budget_used.toLocaleString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(campus)} size="small">
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingCampus ? 'Edit Campus' : 'Add New Campus'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Campus Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Contact Email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Contact Phone"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Budget Allocated"
              type="number"
              value={formData.budget_allocated}
              onChange={(e) => setFormData({ ...formData, budget_allocated: e.target.value })}
              margin="normal"
              InputProps={{
                startAdornment: '$'
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCampus ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Campuses;