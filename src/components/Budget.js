import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Receipt
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import dayjs from 'dayjs';
import api from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function Budget() {
  const [budgetSummary, setBudgetSummary] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBudgetData();
    fetchTransactions();
  }, [selectedCampus]);

  const fetchBudgetData = async () => {
    try {
      const params = selectedCampus ? `?campus_id=${selectedCampus}` : '';
      const response = await api.get(`/api/budget/summary${params}`);
      setBudgetSummary(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (error) {
      setError('Failed to fetch budget data');
      console.error('Budget error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = selectedCampus ? `?campus_id=${selectedCampus}` : '';
      const response = await api.get(`/api/budget/transactions${params}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Transactions error:', error);
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'booking': return 'primary';
      case 'maintenance': return 'warning';
      case 'purchase': return 'error';
      case 'allocation': return 'success';
      default: return 'default';
    }
  };

  const getBudgetUsageColor = (percentage) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  const calculateBudgetPercentage = (used, allocated) => {
    return allocated > 0 ? (used / allocated) * 100 : 0;
  };

  // Prepare chart data
  const chartData = budgetSummary.map(campus => ({
    name: campus.campus_name,
    allocated: campus.budget_allocated,
    used: campus.budget_used,
    remaining: campus.budget_remaining,
    percentage: calculateBudgetPercentage(campus.budget_used, campus.budget_allocated)
  }));

  // Prepare transaction types data
  const transactionTypes = transactions.reduce((acc, transaction) => {
    const type = transaction.transaction_type;
    acc[type] = (acc[type] || 0) + transaction.amount;
    return acc;
  }, {});

  const pieData = Object.entries(transactionTypes).map(([type, amount]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: amount
  }));

  // Monthly spending trend
  const monthlySpending = transactions.reduce((acc, transaction) => {
    const month = dayjs(transaction.transaction_date).format('MMM YYYY');
    acc[month] = (acc[month] || 0) + transaction.amount;
    return acc;
  }, {});

  const trendData = Object.entries(monthlySpending)
    .sort(([a], [b]) => dayjs(a).valueOf() - dayjs(b).valueOf())
    .map(([month, amount]) => ({ month, amount }));

  const totalAllocated = budgetSummary.reduce((sum, campus) => sum + campus.budget_allocated, 0);
  const totalUsed = budgetSummary.reduce((sum, campus) => sum + campus.budget_used, 0);
  const totalRemaining = totalAllocated - totalUsed;

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
          Budget Management
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Campus Filter</InputLabel>
          <Select
            value={selectedCampus}
            label="Campus Filter"
            onChange={(e) => setSelectedCampus(e.target.value)}
          >
            <MenuItem value="">All Campuses</MenuItem>
            {budgetSummary.map((campus) => (
              <MenuItem key={campus.campus_id} value={campus.campus_id}>
                {campus.campus_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Allocated
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    ${totalAllocated.toLocaleString()}
                  </Typography>
                </Box>
                <AccountBalance sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Used
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    ${totalUsed.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Remaining
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    ${totalRemaining.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingDown sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Usage Rate
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {((totalUsed / totalAllocated) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Campus Budget Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Budget Overview by Campus
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="allocated" fill="#8884d8" name="Allocated" />
                <Bar dataKey="used" fill="#82ca9d" name="Used" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Spending by Category
            </Typography>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                No spending data available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Campus Budget Details */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Campus Budget Details
            </Typography>
            <Grid container spacing={2}>
              {budgetSummary.map((campus) => {
                const percentage = calculateBudgetPercentage(campus.budget_used, campus.budget_allocated);
                return (
                  <Grid item xs={12} md={6} lg={4} key={campus.campus_id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {campus.campus_name}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Budget Usage</Typography>
                            <Typography variant="body2" color={getBudgetUsageColor(percentage) + '.main'}>
                              {percentage.toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            color={getBudgetUsageColor(percentage)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Allocated:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            ${campus.budget_allocated.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Used:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="warning.main">
                            ${campus.budget_used.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Remaining:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            ${campus.budget_remaining.toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Monthly Spending Trend */}
      {trendData.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Spending Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Recent Transactions */}
      <Paper sx={{ mt: 3 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Recent Transactions
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Campus</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.slice(0, 20).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {dayjs(transaction.transaction_date).format('MMM DD, YYYY HH:mm')}
                  </TableCell>
                  <TableCell>{transaction.campus_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.transaction_type}
                      color={getTransactionTypeColor(transaction.transaction_type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      color={transaction.amount > 0 ? 'error.main' : 'success.main'}
                      fontWeight="bold"
                    >
                      ${transaction.amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default Budget;