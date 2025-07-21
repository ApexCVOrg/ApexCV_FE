'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  TextField,
  Switch,
  Select,
  MenuItem,
  Button,
  InputLabel,
  FormControl,
  FormControlLabel,
  Divider,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SelectChangeEvent,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GroupIcon from '@mui/icons-material/Group';
import InventoryIcon from '@mui/icons-material/Inventory';
import LanguageIcon from '@mui/icons-material/Language';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ApiIcon from '@mui/icons-material/Api';
import { managerSettingsService, ManagerSettings } from '@/services/managerSettings';
import set from 'lodash/set';
import get from 'lodash/get';

const tabData = [
  { label: 'General Settings', icon: <SettingsIcon /> },
  { label: 'Account Settings', icon: <AccountCircleIcon /> },
  { label: 'User Management', icon: <GroupIcon /> },
  { label: 'Order & Inventory Rules', icon: <InventoryIcon /> },
  { label: 'Language & Localization', icon: <LanguageIcon /> },
  { label: 'Notification Settings', icon: <NotificationsIcon /> },
  { label: 'API & Integrations', icon: <ApiIcon /> },
];

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      sx={{ height: '100%', width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', width: '100%' }}>{children}</Box>
      )}
    </Box>
  );
}

// Patch Partial<ManagerSettings> to allow dynamic string index
interface ManagerSettingsForm extends Partial<ManagerSettings> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export default function ManagerSettingsPage() {
  const [tab, setTab] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState<ManagerSettingsForm>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Section keys must match backend
  const sectionKeys = [
    'general',
    'account',
    'userManagement',
    'inventory',
    'localization',
    'notifications',
    'integrations',
  ];

  // Fetch only current section on tab change
  useEffect(() => {
    const section = sectionKeys[tab] as keyof ManagerSettings;
    setLoading(true);
    setError(null);
    setSuccess(null);
    managerSettingsService
      .getSectionSettings(section)
      .then(data => setForm(prev => ({ ...prev, [section]: data })))
      .catch(err => setError(err?.response?.data?.message || 'Failed to fetch settings'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Helper to update nested state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormChange = (path: string) => (e: any) => {
    // e.target.type may not exist on all event types, so fallback to value
    const value = e.target?.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => {
      const updated = { ...prev };
      set(updated, path, value);
      return updated;
    });
  };

  // Save only current section
  const handleSave = async () => {
    const section = sectionKeys[tab] as keyof ManagerSettings;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await managerSettingsService.updateSectionSettings(section, form[section]);
      setSuccess('Settings saved successfully');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only run on client
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: 700,
        width: '100%',
        maxWidth: 1400,
        mx: 'auto',
        my: 4,
        bgcolor: 'background.default',
        borderRadius: 3,
        boxShadow: { md: 3, xs: 0 },
      }}
    >
      {/* Vertical Tabs */}
      <Tabs
        orientation={isMobile ? 'horizontal' : 'vertical'}
        variant="scrollable"
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
        sx={{
          borderRight: { md: 1, xs: 0 },
          borderColor: 'divider',
          minWidth: { md: 220, xs: '100%' },
          width: { md: 220, xs: '100%' },
          mb: { xs: 2, md: 0 },
          bgcolor: 'background.paper',
          borderRadius: { md: '16px 0 0 16px', xs: '16px 16px 0 0' },
          boxShadow: { md: 2, xs: 0 },
          p: { xs: 1, md: 2 },
        }}
        aria-label="Manager Settings Tabs"
      >
        {tabData.map((tab, idx) => (
          <Tab
            key={tab.label}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {tab.icon}
                {tab.label}
              </Box>
            }
            id={`vertical-tab-${idx}`}
            aria-controls={`vertical-tabpanel-${idx}`}
            sx={{
              alignItems: 'flex-start',
              textAlign: 'left',
              minHeight: 48,
              fontWeight: 600,
              fontSize: '1rem',
              borderRadius: 2,
              transition: 'background 0.2s',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          />
        ))}
      </Tabs>
      {/* Tab Panels */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          overflow: 'auto',
          pl: { md: 3, xs: 0 },
          py: { xs: 2, md: 3 },
        }}
      >
        {/* General Settings */}
        <TabPanel value={tab} index={0}>
          <Card
            sx={{
              mb: 4,
              borderRadius: 3,
              boxShadow: 2,
              p: 0,
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 6 },
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                Shop Information
              </Typography>
              {loading && <Typography color="text.secondary">Loading...</Typography>}
              {error && <Typography color="error">{error}</Typography>}
              {success && <Typography color="success.main">{success}</Typography>}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <TextField
                    label="Shop Name"
                    name="shopName"
                    value={get(form, 'general.shopName', '')}
                    onChange={handleFormChange('general.shopName')}
                    fullWidth
                    size="medium"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <TextField
                    label="Logo URL"
                    name="logoUrl"
                    value={get(form, 'general.logoUrl', '')}
                    onChange={handleFormChange('general.logoUrl')}
                    fullWidth
                    size="medium"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      label="Timezone"
                      name="timezone"
                      value={get(form, 'general.timezone', '')}
                      onChange={handleFormChange('general.timezone')}
                    >
                      <MenuItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</MenuItem>
                      <MenuItem value="Asia/Bangkok">Asia/Bangkok</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      label="Currency"
                      name="currency"
                      value={get(form, 'general.currency', '')}
                      onChange={handleFormChange('general.currency')}
                    >
                      <MenuItem value="VND">VND</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: 1,
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  Save
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
        {/* Account Settings */}
        <TabPanel value={tab} index={1}>
          <Card
            sx={{
              mb: 4,
              borderRadius: 3,
              boxShadow: 2,
              p: 0,
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 6 },
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                Profile
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <TextField label="Full Name" fullWidth size="medium" variant="outlined" />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <TextField label="Email" fullWidth size="medium" variant="outlined" />
                </Box>
              </Box>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Change Password
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <TextField
                    label="Current Password"
                    type="password"
                    fullWidth
                    size="medium"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    size="medium"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    size="medium"
                    variant="outlined"
                  />
                </Box>
              </Box>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: 1,
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  Update
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
        {/* User Management */}
        <TabPanel value={tab} index={2}>
          <Card
            sx={{
              mb: 4,
              borderRadius: 3,
              boxShadow: 2,
              p: 0,
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 6 },
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                User List
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">(User list table goes here)</Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: 1,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 4 },
                  mb: 2,
                }}
              >
                Add User
              </Button>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Roles
              </Typography>
              <Box>
                <Typography variant="body2">(Role management UI goes here)</Typography>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
        {/* Order & Inventory Rules */}
        <TabPanel value={tab} index={3}>
          <Card
            sx={{
              mb: 4,
              borderRadius: 3,
              boxShadow: 2,
              p: 0,
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 6 },
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                Order & Inventory Rules
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <TextField
                    label="Low Stock Threshold"
                    type="number"
                    fullWidth
                    size="medium"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Order Status Config</InputLabel>
                    <Select label="Order Status Config" defaultValue="pending">
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: 1,
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  Save
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
        {/* Language & Localization */}
        <TabPanel value={tab} index={4}>
          <Card
            sx={{
              mb: 4,
              borderRadius: 3,
              boxShadow: 2,
              p: 0,
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 6 },
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                Language & Localization
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Default Language</InputLabel>
                    <Select label="Default Language" defaultValue="en">
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="vi">Vietnamese</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box
                  sx={{
                    width: { xs: '100%', md: '50%' },
                    px: 1,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <FormControlLabel control={<Switch defaultChecked />} label="Enable i18n" />
                </Box>
              </Box>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: 1,
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  Save
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
        {/* Notification Settings */}
        <TabPanel value={tab} index={5}>
          <Card
            sx={{
              mb: 4,
              borderRadius: 3,
              boxShadow: 2,
              p: 0,
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 6 },
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                Notification Settings
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Email Notifications"
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <FormControlLabel control={<Switch />} label="SMS Notifications" />
                </Box>
              </Box>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: 1,
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  Save
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
        {/* API & Integrations */}
        <TabPanel value={tab} index={6}>
          <Card
            sx={{
              mb: 4,
              borderRadius: 3,
              boxShadow: 2,
              p: 0,
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 6 },
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                API & Integrations
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <TextField label="Webhook URL" fullWidth size="medium" variant="outlined" />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '50%' }, px: 1, mb: 2 }}>
                  <TextField label="API Key" fullWidth size="medium" variant="outlined" />
                </Box>
              </Box>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: 1,
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  Save
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
    </Box>
  );
}
