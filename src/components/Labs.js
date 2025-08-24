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
  MenuItem,
  Autocomplete
} from '@mui/material';
import { Add, Edit, Science, LocationOn, People, AttachMoney } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

function Labs() {
  const [labs, setLabs] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLab, setEditingLab] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    location: '',
    equipment_list: [],
    hourly_rate: '',
    campus_id: '',
    status: 'active'
  });
  const [equipmentInput, setEquipmentInput] = useState('');

  useEffect(() => {
    fetchLabs();
    fetchCampuses();
  }, []);

  const fetchLabs = async () => {
    try {
      const response = await api.get('/api/labs');
      setLabs(response.data);
    } catch (error) {
      setError('Failed to fetch labs');
      console.error('Labs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampuses = async () => {
    try {
      const response = await api.get('/api/campuses');
      setCampuses(response.data);
    } catch (error) {
      console.error('Campuses error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const labData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        hourly_rate: parseFloat(formData.hourly_rate) || 0,
        campus_id: parseInt(formData.campus_id)
      };

      if (editingLab) {
        await api.put(`/api/labs/${editingLab.id}`, labData);
        toast.success('Lab updated successfully!');
      } else {
        await api.post('/api/labs', labData);
        toast.success('Lab created successfully!');
      }

      handleCloseDialog();
      fetchLabs();
    } catch (error) {
      toast.error('Failed to save lab');
      console.error('Save lab error:', error);
    }
  };

  const handleEdit = (lab) => {
    setEditingLab(lab);
    setFormData({
      name: lab.name,
      description: lab.description || '',
      capacity: lab.capacity.toString(),
      location: lab.location || '',
      equipment_list: lab.equipment_list || [],
      hourly_rate: lab.hourly_rate.toString(),
      campus_id: lab.campus_id.toString(),
      status: lab.status
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLab(null);
    setFormData({
      name: '',
      description: '',
      capacity: '',
      location: '',
      equipment_list: [],
      hourly_rate: '',
      campus_id: '',
      status: 'active'
    });
    setEquipmentInput('');
  };

  const addEquipment = () => {
    if (equipmentInput.trim()) {
      setFormData({
        ...formData,
        equipment_list: [...formData.equipment_list, equipmentInput.trim()]
      });
      setEquipmentInput('');
    }
  };

  const removeEquipment = (index) => {
    setFormData({
      ...formData,
      equipment_list: formData.equipment_list.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
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
          Lab Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Add Lab
        </Button>
      </Box>

      {/* Lab Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {labs.map((lab) => (
          <Grid item xs={12} md={6} lg={4} key={lab.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Science sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" component="div">
                    {lab.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(lab)}
                    sx={{ ml: 'auto' }}
                  >
                    <Edit />
                  </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {lab.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {lab.location} - {lab.campus_name}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Capacity: {lab.capacity} people
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    ${lab.hourly_rate}/hour
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={lab.status}
                    color={getStatusColor(lab.status)}
                    size="small"
                  />
                  <Typography variant="body2" color="primary.main" fontWeight="bold">
                    {lab.equipment_list.length} Equipment
                  </Typography>
                </Box>

                {lab.equipment_list.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Equipment:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {lab.equipment_list.slice(0, 3).map((equipment, index) => (
                        <Chip
                          key={index}
                          label={equipment}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {lab.equipment_list.length > 3 && (
                        <Chip
                          label={`+${lab.equipment_list.length - 3} more`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Lab Table */}
      <Paper sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Campus</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Hourly Rate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {labs.map((lab) => (
                <TableRow key={lab.id}>
                  <TableCell>{lab.name}</TableCell>
                  <TableCell>{lab.campus_name}</TableCell>
                  <TableCell>{lab.location}</TableCell>
                  <TableCell>{lab.capacity}</TableCell>
                  <TableCell>${lab.hourly_rate}</TableCell>
                  <TableCell>
                    <Chip
                      label={lab.status}
                      color={getStatusColor(lab.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(lab)} size="small">
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
            {editingLab ? 'Edit Lab' : 'Add New Lab'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Lab Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Campus</InputLabel>
                  <Select
                    value={formData.campus_id}
                    label="Campus"
                    onChange={(e) => setFormData({ ...formData, campus_id: e.target.value })}
                  >
                    {campuses.map((campus) => (
                      <MenuItem key={campus.id} value={campus.id}>
                        {campus.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Hourly Rate"
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  margin="normal"
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Equipment List
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label="Add Equipment"
                    value={equipmentInput}
                    onChange={(e) => setEquipmentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                    size="small"
                  />
                  <Button onClick={addEquipment} variant="outlined">
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.equipment_list.map((equipment, index) => (
                    <Chip
                      key={index}
                      label={equipment}
                      onDelete={() => removeEquipment(index)}
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingLab ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Labs;