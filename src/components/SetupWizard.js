import React, { useState } from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography, 
  TextField,
  Paper,
  Container,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import useStore from '../store/store';

const steps = [
  'Welcome',
  'WhatsApp',
  'Telegram',
  'Discord',
  'Slack',
  'Messenger',
  'Finish'
];

const SetupWizard = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    theme: 'dark',
    platforms: {
      whatsapp: { enabled: false },
      telegram: { enabled: false, apiId: '', apiHash: '' },
      discord: { enabled: false, tokenType: 'bot', token: '' },
      slack: { enabled: false, token: '' },
      messenger: { enabled: false }
    }
  });
  
  const { initializeStore, connectPlatforms } = useStore();
  
  // Handle next step
  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      // Finish setup
      handleFinish();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Handle input change
  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle platform input change
  const handlePlatformInputChange = (platform, field, value) => {
    setUserData(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: {
          ...prev.platforms[platform],
          [field]: value
        }
      }
    }));
  };
  
  // Handle setup completion
  const handleFinish = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Save settings
      if (window.electron) {
        await window.electron.saveUserSettings({
          user: { name: userData.name },
          general: { theme: userData.theme },
          platforms: userData.platforms
        });
      }
      
      // Initialize store with user settings
      await initializeStore({
        user: { name: userData.name },
        platforms: userData.platforms
      });
      
      // Connect to enabled platforms
      await connectPlatforms();
      
      // Complete setup
      onComplete();
    } catch (err) {
      console.error('Setup failed:', err);
      setError('Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Skip platform setup
  const handleSkipPlatform = () => {
    handleNext();
  };
  
  // Get step content based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Welcome
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome to Universal Chat Aggregator
            </Typography>
            <Typography variant="body1" paragraph>
              This wizard will help you set up your messaging platforms.
              You can connect to WhatsApp, Telegram, Discord, Slack, and Messenger all in one place.
            </Typography>
            <Typography variant="body1" paragraph>
              Let's get started with some basic information.
            </Typography>
            
            <TextField
              label="Your Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={userData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Theme Preference</FormLabel>
              <RadioGroup 
                row 
                value={userData.theme} 
                onChange={(e) => handleInputChange('theme', e.target.value)}
              >
                <FormControlLabel value="light" control={<Radio />} label="Light" />
                <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                <FormControlLabel value="system" control={<Radio />} label="System" />
              </RadioGroup>
            </FormControl>
          </Box>
        );
        
      case 1: // WhatsApp
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              WhatsApp Setup
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="140"
                image="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png"
                alt="WhatsApp"
                sx={{ objectFit: 'contain', bgcolor: '#25D366', p: 2 }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  WhatsApp
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  WhatsApp integration uses the WhatsApp Web protocol. You'll need to scan a QR code with your phone when you first launch the application.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  No additional configuration is required at this step.
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userData.platforms.whatsapp.enabled}
                      onChange={(e) => handlePlatformInputChange('whatsapp', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable WhatsApp Integration"
                />
              </CardContent>
            </Card>
            
            <Alert severity="info">
              You will need to keep your phone connected to the internet for WhatsApp Web to work properly.
            </Alert>
          </Box>
        );
        
      case 2: // Telegram
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Telegram Setup
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="140"
                image="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/1024px-Telegram_logo.svg.png"
                alt="Telegram"
                sx={{ objectFit: 'contain', bgcolor: '#0088cc', p: 2 }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Telegram
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Telegram integration requires an API ID and API Hash from Telegram. You can obtain these by creating an application at <a href="https://my.telegram.org/apps" target="_blank" rel="noopener noreferrer">my.telegram.org/apps</a>.
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userData.platforms.telegram.enabled}
                      onChange={(e) => handlePlatformInputChange('telegram', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Telegram Integration"
                />
                
                {userData.platforms.telegram.enabled && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      label="API ID"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={userData.platforms.telegram.apiId}
                      onChange={(e) => handlePlatformInputChange('telegram', 'apiId', e.target.value)}
                    />
                    
                    <TextField
                      label="API Hash"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={userData.platforms.telegram.apiHash}
                      onChange={(e) => handlePlatformInputChange('telegram', 'apiHash', e.target.value)}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Alert severity="info">
              You will be prompted to enter your phone number and verification code when you first connect to Telegram.
            </Alert>
          </Box>
        );
        
      case 3: // Discord
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Discord Setup
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="140"
                image="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png"
                alt="Discord"
                sx={{ objectFit: 'contain', bgcolor: '#5865F2', p: 2 }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Discord
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Discord integration supports both bot tokens and user tokens. Bot tokens are recommended and can be created at the <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer">Discord Developer Portal</a>.
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userData.platforms.discord.enabled}
                      onChange={(e) => handlePlatformInputChange('discord', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Discord Integration"
                />
                
                {userData.platforms.discord.enabled && (
                  <Box sx={{ mt: 2 }}>
                    <FormControl component="fieldset" margin="normal">
                      <FormLabel component="legend">Token Type</FormLabel>
                      <RadioGroup 
                        row 
                        value={userData.platforms.discord.tokenType} 
                        onChange={(e) => handlePlatformInputChange('discord', 'tokenType', e.target.value)}
                      >
                        <FormControlLabel value="bot" control={<Radio />} label="Bot Token" />
                        <FormControlLabel value="user" control={<Radio />} label="User Token" />
                      </RadioGroup>
                    </FormControl>
                    
                    <TextField
                      label={userData.platforms.discord.tokenType === 'bot' ? 'Bot Token' : 'User Token'}
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={userData.platforms.discord.token}
                      onChange={(e) => handlePlatformInputChange('discord', 'token', e.target.value)}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Alert severity="warning">
              Using a user token may violate Discord's Terms of Service. Bot tokens are recommended.
            </Alert>
          </Box>
        );
        
      case 4: // Slack
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Slack Setup
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="140"
                image="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png"
                alt="Slack"
                sx={{ objectFit: 'contain', bgcolor: '#4A154B', p: 2 }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Slack
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Slack integration requires an OAuth token from Slack. You can create a Slack app and get a token from the <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer">Slack API website</a>.
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userData.platforms.slack.enabled}
                      onChange={(e) => handlePlatformInputChange('slack', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Slack Integration"
                />
                
                {userData.platforms.slack.enabled && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      label="Slack OAuth Token"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={userData.platforms.slack.token}
                      onChange={(e) => handlePlatformInputChange('slack', 'token', e.target.value)}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Alert severity="info">
              You'll need to select the necessary scopes when creating your Slack app, including chat:read, chat:write, and users:read.
            </Alert>
          </Box>
        );
        
      case 5: // Messenger
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Messenger Setup
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="140"
                image="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Facebook_Messenger_logo_2020.svg/2048px-Facebook_Messenger_logo_2020.svg.png"
                alt="Messenger"
                sx={{ objectFit: 'contain', bgcolor: '#00B2FF', p: 2 }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Facebook Messenger
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Messenger integration requires Facebook authentication within the application. You will be prompted to log in to Facebook when you first use the app.
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userData.platforms.messenger.enabled}
                      onChange={(e) => handlePlatformInputChange('messenger', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Messenger Integration"
                />
              </CardContent>
            </Card>
            
            <Alert severity="info">
              Your Facebook credentials are stored securely on your device only.
            </Alert>
          </Box>
        );
        
      case 6: // Finish
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Setup Complete!
            </Typography>
            
            <Typography variant="body1" paragraph>
              Congratulations! You've successfully set up the Universal Chat Aggregator. Here's a summary of your configuration:
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                General Settings
              </Typography>
              <Typography variant="body2">
                User Name: {userData.name || 'Not set'}
              </Typography>
              <Typography variant="body2">
                Theme: {userData.theme}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Enabled Platforms
              </Typography>
              
              <Grid container spacing={1}>
                {Object.entries(userData.platforms).map(([platform, config]) => (
                  config.enabled && (
                    <Grid item xs={6} sm={4} key={platform}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}>
                        <CheckCircleIcon color="success" />
                        <Typography variant="body2">
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </Typography>
                      </Box>
                    </Grid>
                  )
                ))}
                
                {!Object.values(userData.platforms).some(p => p.enabled) && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      No platforms enabled. You can enable them later in Settings.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
            
            <Typography variant="body1">
              Click Finish to start using the application. You can modify these settings at any time.
            </Typography>
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ p: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 4, mb: 2 }}>
          {getStepContent(activeStep)}
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          
          <Box>
            {activeStep > 0 && activeStep < steps.length - 1 && (
              <Button
                onClick={handleSkipPlatform}
                sx={{ mr: 1 }}
                disabled={loading}
              >
                Skip
              </Button>
            )}
            
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={loading ? <CircularProgress size={16} /> : <ArrowForwardIcon />}
              disabled={loading || (activeStep === 0 && !userData.name)}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SetupWizard;