import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Divider,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Dashboard,
  Science,
  Inventory,
  BookOnline,
  AccountBalance,
  School,
  Menu,
  Logout,
  Person
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;
const collapsedWidth = 70;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Campuses', icon: <School />, path: '/campuses', roles: ['admin'] },
  { text: 'Labs', icon: <Science />, path: '/labs' },
  { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
  { text: 'Bookings', icon: <BookOnline />, path: '/bookings' },
  { text: 'Budget', icon: <AccountBalance />, path: '/budget', roles: ['admin', 'manager'] },
];

function Sidebar({ open, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
  };

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {open && (
          <Typography variant="h6" noWrap component="div" color="primary">
            Lab Manager
          </Typography>
        )}
        <IconButton onClick={onToggle} size="small">
          <Menu />
        </IconButton>
      </Box>
      
      <Divider />

      {/* User Info */}
      <Box sx={{ p: open ? 2 : 1, display: 'flex', alignItems: 'center', justifyContent: open ? 'flex-start' : 'center' }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
          <Person />
        </Avatar>
        {open && (
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2" noWrap>
              {user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={!open ? item.text : ''} placement="right">
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    '& .MuiTypography-root': {
                      fontSize: '0.9rem',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    }
                  }} 
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Logout */}
      <Box sx={{ p: 1 }}>
        <Tooltip title={!open ? 'Logout' : ''} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              borderRadius: 1,
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.contrastText',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
                color: 'inherit',
              }}
            >
              <Logout />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              sx={{ 
                opacity: open ? 1 : 0,
                '& .MuiTypography-root': {
                  fontSize: '0.9rem',
                }
              }} 
            />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export default Sidebar;