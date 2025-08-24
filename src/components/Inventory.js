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
import { Add, Edit, Inventory as InventoryIcon, Category, Warning } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import api from '../services/api';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity_total: '',
    quantity_available: '',
    unit_cost: '',
    supplier: '',
    purchase_date: null,
    warranty_expiry: null,
    lab_id: '',
    status: 'active'
  });

  const categories = ['Computing', 'Electronics', 'Optics', 'Chemistry', 'Biology', 'Physics', 'General'];

  useEffect(() => {
    fetchInventory();
    fetchLabs();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/api/inventory');
      setInventory(response.data);
    } catch (error) {
      setError('Failed to fetch inventory');
      console.error('Inventory error:', error);
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
      const itemData = {
        ...formData,
        quantity_total: parseInt(formData.quantity_total),
        quantity_available: parseInt(formData.quantity_available),
        unit_cost: parseFloat(formData.unit_cost) || 0,
        lab_id: parseInt(formData.lab_id),
        purchase_date: formData.purchase_date ? formData.purchase_date.format('YYYY-MM-DD') : null,
        warranty_expiry: formData.warranty_expiry ? formData.warranty_expiry.format('YYYY-MM-DD') : null
      };

      if (editingItem) {
        await api.put(`/api/inventory/${editingItem.id}`, itemData);
        toast.success('Inventory item updated successfully!');
      } else {
        await api.post('/api/inventory', itemData);
        toast.success('Inventory item created successfully!');
      }

      handleCloseDialog();
      fetchInventory();
    } catch (error) {
      toast.error('Failed to save inventory item');
      console.error('Save inventory error:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      quantity_total: item.quantity_total.toString(),
      quantity_available: item.quantity_available.toString(),
      unit_cost: item.unit_cost.toString(),
      supplier: item.supplier || '',
      purchase_date: item.purchase_date ? dayjs(item.purchase_date) : null,
      warranty_expiry: item.warranty_expiry ? dayjs(item.warranty_expiry) : null,
      lab_id: item.lab_id.toString(),
      status: item.status
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      quantity_total: '',
      quantity_available: '',
      unit_cost: '',
      supplier: '',
      purchase_date: null,
      warranty_expiry: null,
      lab_id: '',
      status: 'active'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'retired': return 'error';
      default: return 'default';
    }
  };

  const getAvailabilityColor = (available, total) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'success';
    if (percentage > 20) return 'warning';
    return 'error';
  };

  const isWarrantyExpiring = (warrantyDate) => {
    if (!warrantyDate) return false;
    const today = dayjs();
    const warranty = dayjs(warrantyDate);
    return warranty.diff(today, 'days') <= 30 && warranty.isAfter(today);
  };

  const isWarrantyExpired = (warrantyDate) => {
    if (!warrantyDate) return false;
    return dayjs(warrantyDate).isBefore(dayjs());
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
            Inventory Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Add Item
          </Button>
        </Box>

        {/* Inventory Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {inventory.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InventoryIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" component="div">
                      {item.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(item)}
                      sx={{ ml: 'auto' }}
                    >
                      <Edit />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Category sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {item.category} - {item.lab_name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      ${item.unit_cost} each
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Available: {item.quantity_available} / {item.quantity_total}
                    </Typography>
                    <Chip
                      label={`${((item.quantity_available / item.quantity_total) * 100).toFixed(0)}% Available`}
                      color={getAvailabilityColor(item.quantity_available, item.quantity_total)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  {item.supplier && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Supplier: {item.supplier}
                    </Typography>
                  )}

                  {item.warranty_expiry && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      {isWarrantyExpired(item.warranty_expiry) && (
                        <Warning sx={{ mr: 1, color: 'error.main', fontSize: 20 }} />
                      )}
                      {isWarrantyExpiring(item.warranty_expiry) && !isWarrantyExpired(item.warranty_expiry) && (
                        <Warning sx={{ mr: 1, color: 'warning.main', fontSize: 20 }} />
                      )}
                      <Typography 
                        variant="body2" 
                        color={
                          isWarrantyExpired(item.warranty_expiry) ? 'error.main' :
                          isWarrantyExpiring(item.warranty_expiry) ? 'warning.main' : 
                          'text.secondary'
                        }
                      >
                        Warranty: {dayjs(item.warranty_expiry).format('MMM DD, YYYY')}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Inventory Table */}
        <Paper sx={{ mt: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Lab</TableCell>
                  <TableCell>Available/Total</TableCell>
                  <TableCell>Unit Cost</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Warranty</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.lab_name}</TableCell>
                    <TableCell>
                      {item.quantity_available} / {item.quantity_total}
                      <Chip
                        label={`${((item.quantity_available / item.quantity_total) * 100).toFixed(0)}%`}
                        color={getAvailabilityColor(item.quantity_available, item.quantity_total)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </TableCell>
                    <TableCell>${item.unit_cost}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {item.warranty_expiry ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {(isWarrantyExpired(item.warranty_expiry) || isWarrantyExpiring(item.warranty_expiry)) && (
                            <Warning 
                              sx={{ 
                                mr: 1, 
                                color: isWarrantyExpired(item.warranty_expiry) ? 'error.main' : 'warning.main',
                                fontSize: 16 
                              }} 
                            />
                          )}
                          <Typography 
                            variant="body2"
                            color={
                              isWarrantyExpired(item.warranty_expiry) ? 'error.main' :
                              isWarrantyExpiring(item.warranty_expiry) ? 'warning.main' : 
                              'text.primary'
                            }
                          >
                            {dayjs(item.warranty_expiry).format('MMM DD, YYYY')}
                          </Typography>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(item)} size="small">
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
              {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Item Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      label="Category"
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Lab</InputLabel>
                    <Select
                      value={formData.lab_id}
                      label="Lab"
                      onChange={(e) => setFormData({ ...formData, lab_id: e.target.value })}
                    >
                      {labs.map((lab) => (
                        <MenuItem key={lab.id} value={lab.id}>
                          {lab.name} - {lab.campus_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Total Quantity"
                    type="number"
                    value={formData.quantity_total}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      quantity_total: e.target.value,
                      quantity_available: formData.quantity_available || e.target.value
                    })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Available Quantity"
                    type="number"
                    value={formData.quantity_available}
                    onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Unit Cost"
                    type="number"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                    margin="normal"
                    InputProps={{
                      startAdornment: '$'
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="Purchase Date"
                    value={formData.purchase_date}
                    onChange={(date) => setFormData({ ...formData, purchase_date: date })}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="Warranty Expiry"
                    value={formData.warranty_expiry}
                    onChange={(date) => setFormData({ ...formData, warranty_expiry: date })}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
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
                      <MenuItem value="retired">Retired</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default Inventory;