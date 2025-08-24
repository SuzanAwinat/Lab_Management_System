import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  School,
  Science,
  Inventory,
  BookOnline,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function StatCard({ title, value, icon, trend, color = 'primary' }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color + '.main'}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend > 0 ? (
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                ) : (
                  <TrendingDown color="error" sx={{ mr: 1 }} />
                )}
                <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
                  {Math.abs(trend)}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: color + '.light',
              color: color + '.main',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    statistics: {},
    recent_bookings: [],
    budget_summary: {}
  });
  const [budgetData, setBudgetData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchBudgetData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/analytics/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetData = async () => {
    try {
      const response = await api.get('/api/budget/summary');
      setBudgetData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Budget data error:', error);
    }
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

  const { statistics, recent_bookings, budget_summary } = dashboardData;

  // Prepare chart data
  const budgetChartData = budgetData.map(campus => ({
    name: campus.campus_name,
    allocated: campus.budget_allocated,
    used: campus.budget_used,
    remaining: campus.budget_remaining
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 4 }}>
        Dashboard Overview
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Campuses"
            value={statistics.total_campuses || 0}
            icon={<School fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Labs"
            value={statistics.total_labs || 0}
            icon={<Science fontSize="large" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bookings"
            value={statistics.total_bookings || 0}
            icon={<BookOnline fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inventory Items"
            value={statistics.total_inventory_items || 0}
            icon={<Inventory fontSize="large" />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Budget Overview Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Budget Overview by Campus
            </Typography>
            {budgetChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="allocated" fill="#8884d8" name="Allocated" />
                  <Bar dataKey="used" fill="#82ca9d" name="Used" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                No budget data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Budget Summary */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Budget Summary
            </Typography>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h4" color="primary.main">
                ${budget_summary.total_allocated?.toLocaleString() || '0'}
              </Typography>
              <Typography color="textSecondary">Total Allocated</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h4" color="success.main">
                ${budget_summary.total_used?.toLocaleString() || '0'}
              </Typography>
              <Typography color="textSecondary">Total Used</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                ${((budget_summary.total_allocated || 0) - (budget_summary.total_used || 0)).toLocaleString()}
              </Typography>
              <Typography color="textSecondary">Remaining</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Bookings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Bookings
            </Typography>
            {recent_bookings && recent_bookings.length > 0 ? (
              <List>
                {recent_bookings.map((booking) => (
                  <ListItem key={booking.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1">
                            {booking.lab_name}
                          </Typography>
                          <Chip
                            label={booking.status}
                            color={getStatusColor(booking.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            User: {booking.user_name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Time: {new Date(booking.start_time).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                No recent bookings
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;