import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton,
  Dialog,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Switch,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import useStore from '../store/store';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
      style={{ height: '100%', overflow: 'auto' }}
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    general: {
      theme: 'dark',
      startMinimized: false,
      notifications: true,
      sounds: true,
    },
    platforms: {}
  });
  const [platformAuth, setPlatformAuth] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const { platforms, connectionStatus, clearAllData } = useStore();
  
  // Load settings from Electron store
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        if (window.electron) {
          const userSettings = await window.electron.getUserSettings();
          
          if (userSettings) {
            setSettings({
              general: userSettings.general || {
                theme: 'dark',
                startMinimized: false,
                notifications: true,
                sounds: true,
              },
              platforms: userSettings.platforms || {}
            });
            
            // Load auth data for each platform
            const auth = {};
            for (const platform of platforms) {
              if (platform.enabled) {
                auth[platform.id] = await window.electron.getPlatformAuth(platform.id);
              }
            }
            
            setPlatformAuth(auth);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [platforms]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle setting changes
  const handleGeneralSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [setting]: value
      }
    }));
  };
  
  // Handle platform setting change
  const handlePlatformSettingChange = (platformId, setting, value) => {
    setSettings(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platformId]: {
          ...(prev.platforms[platformId] || {}),
          [setting]: value
        }
      }
    }));
  };
  
  // Save settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      if (window.electron) {
        await window.electron.saveUserSettings(settings);
        
        setSuccess('Settings saved successfully');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
  
  // Clear data
  const handleClearData = async () => {
    try {
      if (window.confirm('Are you sure you want to clear all data? This will remove all your messages and conversations.')) {
        await clearAllData();
        setSuccess('All data cleared successfully');
      }
    } catch (err) {
      console.error('Failed to clear data:', err);
      setError('Failed to clear data');
    }
  };
  
  // Handle authentication
  const handleReauthenticate = async (platformId) => {
    try {
      // In a real implementation, this would open the authentication flow for the specific platform
      // For now, we'll just show a success message
      setSuccess(`Re-authentication for ${platformId} initiated. Please check the console.`);
    } catch (err) {
      console.error(`Failed to re-authenticate ${platformId}:`, err);
      setError(`Failed to re-authenticate ${platformId}`);
    }
  };
  
  // Handle clear auth
  const handleClearAuth = async (platformId) => {
    try {
      if (window.electron && window.confirm('Are you sure you want to disconnect this account?')) {
        await window.electron.clearPlatformAuth(platformId);
        
        setPlatformAuth(prev => ({
          ...prev,
          [platformId]: null
        }));
        
        setSuccess(`Disconnected ${platformId} successfully`);
      }
    } catch (err) {
      console.error(`Failed to clear auth for ${platformId}:`, err);
      setError(`Failed to disconnect ${platformId}`);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Dialog
        fullScreen
        open={true}
      >
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Settings
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%'
          }}
        >
          <CircularProgress />
        </Box>
      </Dialog>
    );
  }
  
  return (
    <Dialog
      fullScreen
      open={true}
    >
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Settings
          </Typography>
          <Button color="inherit" onClick={handleSaveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ 
        height: 'calc(100% - 64px)', 
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        {/* Tabs */}
        <Box sx={{ 
          borderRight: 1, 
          borderColor: 'divider',
          width: { xs: '100%', sm: '200px' }
        }}>
          <Tabs
            orientation={window.innerWidth > 600 ? "vertical" : "horizontal"}
            variant="scrollable"
            value={tabValue}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="General" />
            <Tab label="Platforms" />
            <Tab label="Appearance" />
            <Tab label="Advanced" />
            <Tab label="About" />
          </Tabs>
        </Box>
        
        {/* Tab Content */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {/* General Settings */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Notifications" 
                  secondary="Show notifications for new messages"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.general.notifications}
                    onChange={(e) => handleGeneralSettingChange('notifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Sound Effects" 
                  secondary="Play sounds for new messages and events"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.general.sounds}
                    onChange={(e) => handleGeneralSettingChange('sounds', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Start Minimized" 
                  secondary="Start the application minimized in the system tray"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.general.startMinimized}
                    onChange={(e) => handleGeneralSettingChange('startMinimized', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText primary="Theme" />
                <ListItemSecondaryAction>
                  <FormControl variant="standard" sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.general.theme}
                      onChange={(e) => handleGeneralSettingChange('theme', e.target.value)}
                    >
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="system">System</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </TabPanel>
          
          {/* Platform Settings */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Platform Settings
            </Typography>
            
            <List>
              {platforms.map((platform) => (
                <Paper key={platform.id} sx={{ mb: 2, p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {platform.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Status:
                    </Typography>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: 
                          connectionStatus[platform.id] === 'connected' ? 'success.main' :
                          connectionStatus[platform.id] === 'connecting' ? 'warning.main' :
                          connectionStatus[platform.id] === 'error' ? 'error.main' :
                          'text.disabled',
                        mr: 1
                      }}
                    />
                    <Typography variant="body2">
                      {connectionStatus[platform.id]}
                    </Typography>
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={platform.enabled}
                        onChange={(e) => handlePlatformSettingChange(platform.id, 'enabled', e.target.checked)}
                      />
                    }
                    label="Enabled"
                  />
                  
                  <Divider sx={{ my: 1 }} />
                  
                  {platform.id === 'whatsapp' && (
                    <Typography variant="body2" color="text.secondary">
                      WhatsApp uses WhatsApp Web for authentication.
                    </Typography>
                  )}
                  
                  {platform.id === 'telegram' && (
                    <>
                      <TextField
                        label="API ID"
                        variant="outlined"
                        size="small"
                        fullWidth
                        margin="normal"
                        value={settings.platforms[platform.id]?.apiId || ''}
                        onChange={(e) => handlePlatformSettingChange(platform.id, 'apiId', e.target.value)}
                      />
                      
                      <TextField
                        label="API Hash"
                        variant="outlined"
                        size="small"
                        fullWidth
                        margin="normal"
                        value={settings.platforms[platform.id]?.apiHash || ''}
                        onChange={(e) => handlePlatformSettingChange(platform.id, 'apiHash', e.target.value)}
                      />
                    </>
                  )}
                  
                  {platform.id === 'discord' && (
                    <>
                      <FormControl fullWidth margin="normal" size="small">
                        <InputLabel>Token Type</InputLabel>
                        <Select
                          value={settings.platforms[platform.id]?.tokenType || 'bot'}
                          label="Token Type"
                          onChange={(e) => handlePlatformSettingChange(platform.id, 'tokenType', e.target.value)}
                        >
                          <MenuItem value="bot">Bot Token</MenuItem>
                          <MenuItem value="user">User Token</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <TextField
                        label="Token"
                        variant="outlined"
                        size="small"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={platformAuth[platform.id]?.token || ''}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </>
                  )}
                  
                  {platform.id === 'slack' && (
                    <TextField
                      label="Workspace OAuth Token"
                      variant="outlined"
                      size="small"
                      type="password"
                      fullWidth
                      margin="normal"
                      value={platformAuth[platform.id]?.token || ''}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  )}
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {platform.enabled && (
                      <>
                        <Button 
                          variant="outlined"
                          onClick={() => handleReauthenticate(platform.id)}
                        >
                          Re-authenticate
                        </Button>
                        
                        <Button 
                          variant="outlined" 
                          color="error"
                          onClick={() => handleClearAuth(platform.id)}
                        >
                          Disconnect
                        </Button>
                      </>
                    )}
                  </Box>
                </Paper>
              ))}
            </List>
          </TabPanel>
          
          {/* Appearance Settings */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Appearance Settings
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Customize the look and feel of the application
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Chat Bubble Style</InputLabel>
              <Select
                value={settings.general.bubbleStyle || 'modern'}
                label="Chat Bubble Style"
                onChange={(e) => handleGeneralSettingChange('bubbleStyle', e.target.value)}
              >
                <MenuItem value="modern">Modern (Rounded)</MenuItem>
                <MenuItem value="classic">Classic (Square)</MenuItem>
                <MenuItem value="compact">Compact</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Font Size</InputLabel>
              <Select
                value={settings.general.fontSize || 'medium'}
                label="Font Size"
                onChange={(e) => handleGeneralSettingChange('fontSize', e.target.value)}
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.general.compactMode || false}
                  onChange={(e) => handleGeneralSettingChange('compactMode', e.target.checked)}
                />
              }
              label="Compact Mode"
            />
          </TabPanel>
          
          {/* Advanced Settings */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Advanced Settings
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 3 }}>
              These settings are for advanced users. Changing them may affect the application's performance.
            </Alert>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Developer Mode" 
                  secondary="Enable additional logging and developer features"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.general.developerMode || false}
                    onChange={(e) => handleGeneralSettingChange('developerMode', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Message Cache Size" 
                  secondary="Number of messages to keep in memory per chat"
                />
                <ListItemSecondaryAction>
                  <FormControl variant="standard" sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.general.messageCacheSize || 1000}
                      onChange={(e) => handleGeneralSettingChange('messageCacheSize', e.target.value)}
                    >
                      <MenuItem value={100}>100</MenuItem>
                      <MenuItem value={500}>500</MenuItem>
                      <MenuItem value={1000}>1000</MenuItem>
                      <MenuItem value={5000}>5000</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom color="error">
                Danger Zone
              </Typography>
              
              <Box sx={{ backgroundColor: 'error.main', color: 'error.contrastText', p: 2, borderRadius: 1 }}>
                <Typography variant="body1" gutterBottom>
                  Clear All Data
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  This will remove all your conversations, messages, and settings. This action cannot be undone.
                </Typography>
                <Button 
                  variant="contained" 
                  color="error"
                  onClick={handleClearData}
                >
                  Clear All Data
                </Button>
              </Box>
            </Box>
          </TabPanel>
          
          {/* About */}
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>
              About Universal Chat Aggregator
            </Typography>
            
            <Typography variant="body1" paragraph>
              Version 1.0.0
            </Typography>
            
            <Typography variant="body2" paragraph>
              Universal Chat Aggregator combines messages from WhatsApp, Telegram, Discord, Messenger, Slack, and more into a unified chat interface while preserving their features.
            </Typography>
            
            <Typography variant="body2" paragraph>
              Created by NamoVize
            </Typography>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Platform Integrations
              </Typography>
              
              <Typography variant="body2" component="div">
                <ul>
                  <li>WhatsApp - via WhatsApp Web Protocol</li>
                  <li>Telegram - via Telegram Client API</li>
                  <li>Discord - via Discord.js</li>
                  <li>Slack - via Slack SDK</li>
                  <li>Messenger - via Facebook Graph API</li>
                </ul>
              </Typography>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Privacy Policy
              </Typography>
              
              <Typography variant="body2" paragraph>
                Your data stays local. This application does not send your messages or credentials to any third-party servers. All communication happens directly between your computer and the respective messaging platforms.
              </Typography>
            </Box>
          </TabPanel>
        </Box>
      </Box>
      
      {/* Snackbars for feedback */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default Settings;