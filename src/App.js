import React, { useState, useEffect } from 'react';
import { 
  Box, 
  CssBaseline, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  useMediaQuery,
  useTheme,
  LinearProgress,
  Snackbar,
  Alert
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import components
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Settings from './components/Settings';
import SetupWizard from './components/SetupWizard';
import useStore from './store/store';

// Drawer width
const drawerWidth = 280;

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const { 
    initializeStore, 
    isInitialized,
    platforms, 
    chats,
    messages,
    connectPlatforms,
    connectionStatus
  } = useStore();

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Load user settings and check if setup is needed
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // Check if window.electron exists (we're in Electron)
        if (window.electron) {
          const userSettings = await window.electron.getUserSettings();
          
          // Initialize the store with user settings
          await initializeStore(userSettings);
          
          // If no platforms are enabled, show the setup wizard
          const needsSetup = !userSettings || 
            !userSettings.platforms || 
            Object.keys(userSettings.platforms || {}).length === 0;
          
          setShowSetup(needsSetup);
        } else {
          console.warn('Running outside of Electron environment');
          // For web development, initialize with mock data
          await initializeStore({ user: { name: 'Demo User' } });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to load application settings. Please restart the application.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [initializeStore]);

  // Connect to platforms after initialization
  useEffect(() => {
    if (isInitialized && !showSetup) {
      connectPlatforms();
    }
  }, [isInitialized, showSetup, connectPlatforms]);

  // Handle platform selection
  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    setSelectedChat(null);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Handle chat selection
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Handle setup completion
  const handleSetupComplete = () => {
    setShowSetup(false);
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'background.default'
      }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Universal Chat Aggregator
        </Typography>
        <Box sx={{ width: '300px', mt: 4 }}>
          <LinearProgress />
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading your conversations...
        </Typography>
      </Box>
    );
  }

  // Render setup wizard if needed
  if (showSetup) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  return (
    <Router>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <CssBaseline />
        
        {/* App Bar - visible on mobile only */}
        <AppBar
          position="fixed"
          sx={{
            display: { xs: 'block', md: 'none' },
            width: '100%',
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {selectedChat?.name || selectedPlatform?.name || 'Universal Chat'}
            </Typography>
            <IconButton color="inherit" onClick={() => setShowSettings(true)}>
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        {/* Sidebar - permanent on desktop, drawer on mobile */}
        <Box
          component="nav"
          sx={{
            width: { md: drawerWidth },
            flexShrink: { md: 0 }
          }}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth 
              },
            }}
          >
            <Sidebar 
              platforms={platforms}
              connectionStatus={connectionStatus}
              chats={chats}
              selectedPlatform={selectedPlatform}
              selectedChat={selectedChat}
              onPlatformSelect={handlePlatformSelect}
              onChatSelect={handleChatSelect}
              onSettingsClick={() => setShowSettings(true)}
            />
          </Drawer>
          
          {/* Desktop permanent drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                height: '100%',
                position: 'relative' 
              },
            }}
            open
          >
            <Sidebar 
              platforms={platforms}
              connectionStatus={connectionStatus}
              chats={chats}
              selectedPlatform={selectedPlatform}
              selectedChat={selectedChat}
              onPlatformSelect={handlePlatformSelect}
              onChatSelect={handleChatSelect}
              onSettingsClick={() => setShowSettings(true)}
            />
          </Drawer>
        </Box>
        
        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 0,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            mt: { xs: '64px', md: 0 }
          }}
        >
          <Routes>
            <Route path="/settings" element={
              <Settings onClose={() => setShowSettings(false)} />
            } />
            <Route path="*" element={
              <ChatWindow 
                platform={selectedPlatform}
                chat={selectedChat}
                messages={messages}
              />
            } />
          </Routes>
          
          {/* Settings overlay */}
          {showSettings && (
            <Settings onClose={() => setShowSettings(false)} />
          )}
        </Box>
        
        {/* Error snackbar */}
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
      </Box>
    </Router>
  );
}

export default App;