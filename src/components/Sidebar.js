import React, { useState } from 'react';
import { 
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Collapse,
  Tooltip,
  Paper,
  InputBase,
  Button
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import useStore from '../store/store';

// Get platform icon from name
const getPlatformIcon = (platform) => {
  try {
    // Placeholder for actual icon loading
    // In a real app, would load from assets dynamically
    return (
      <Avatar
        sx={{
          bgcolor: platform.color,
          width: 32,
          height: 32,
        }}
      >
        {platform.name.charAt(0)}
      </Avatar>
    );
  } catch (e) {
    return (
      <Avatar
        sx={{
          bgcolor: platform.color || 'primary.main',
          width: 32,
          height: 32,
        }}
      >
        {platform.name.charAt(0)}
      </Avatar>
    );
  }
};

// Get connection status indicator
const getConnectionStatus = (status) => {
  switch (status) {
    case 'connected':
      return { color: '#43b581', label: 'Connected' };
    case 'connecting':
      return { color: '#faa61a', label: 'Connecting...' };
    case 'disconnected':
      return { color: '#747f8d', label: 'Disconnected' };
    case 'error':
      return { color: '#f04747', label: 'Connection Error' };
    case 'disabled':
      return { color: '#36393f', label: 'Disabled' };
    default:
      return { color: '#36393f', label: 'Unknown' };
  }
};

const Sidebar = ({ 
  platforms,
  connectionStatus,
  chats,
  selectedPlatform,
  selectedChat,
  onPlatformSelect,
  onChatSelect,
  onSettingsClick 
}) => {
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [chatView, setChatView] = useState(false);
  
  // Handle expand toggle
  const handleExpandToggle = (platformId) => {
    setExpanded({
      ...expanded,
      [platformId]: !expanded[platformId]
    });
  };
  
  // Filter chats by search term
  const filteredChats = searchTerm 
    ? chats.filter(chat => 
        chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chat.lastMessage?.text && chat.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : chats;
  
  // Get chats for selected platform
  const platformChats = selectedPlatform 
    ? filteredChats.filter(chat => chat.platformId === selectedPlatform.id)
    : [];
  
  // Handle platform selection
  const handlePlatformSelect = (platform) => {
    onPlatformSelect(platform);
    setChatView(true);
    
    // Expand the platform
    setExpanded({
      ...expanded,
      [platform.id]: true
    });
  };
  
  // Handle back button in chat view
  const handleBackFromChats = () => {
    setChatView(false);
  };
  
  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.paper' 
    }}>
      {/* Sidebar Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        {chatView && selectedPlatform ? (
          <>
            <IconButton edge="start" onClick={handleBackFromChats}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, ml: 1 }}>
              {selectedPlatform.name}
            </Typography>
          </>
        ) : (
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Universal Chat
          </Typography>
        )}
        
        <IconButton color="inherit" onClick={() => setShowSearch(!showSearch)}>
          <SearchIcon />
        </IconButton>
        <IconButton edge="end" color="inherit" onClick={onSettingsClick}>
          <SettingsIcon />
        </IconButton>
      </Box>
      
      {/* Search Bar - Shown when search is active */}
      <Collapse in={showSearch}>
        <Box sx={{ p: 1 }}>
          <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
        </Box>
      </Collapse>
      
      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        {!chatView ? (
          /* Platform List View */
          <List>
            {platforms.map((platform) => (
              <React.Fragment key={platform.id}>
                <ListItem 
                  disablePadding
                  secondaryAction={
                    platform.enabled && (
                      <IconButton 
                        edge="end"
                        onClick={() => handleExpandToggle(platform.id)}
                      >
                        {expanded[platform.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    )
                  }
                >
                  <ListItemButton 
                    onClick={() => platform.enabled && handlePlatformSelect(platform)}
                    selected={selectedPlatform?.id === platform.id}
                    disabled={!platform.enabled}
                  >
                    <ListItemIcon>
                      <Badge
                        variant="dot"
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: getConnectionStatus(connectionStatus[platform.id]).color,
                          }
                        }}
                      >
                        {getPlatformIcon(platform)}
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primary={platform.name} 
                      secondary={getConnectionStatus(connectionStatus[platform.id]).label}
                    />
                  </ListItemButton>
                </ListItem>
                
                {/* Platform's chat list - collapsed by default */}
                <Collapse in={expanded[platform.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {filteredChats
                      .filter(chat => chat.platformId === platform.id)
                      .slice(0, 5) // Show only first 5 chats in collapsed view
                      .map((chat) => (
                        <ListItem key={chat.id} disablePadding sx={{ pl: 4 }}>
                          <ListItemButton
                            onClick={() => onChatSelect(chat)}
                            selected={selectedChat?.id === chat.id}
                          >
                            <ListItemIcon>
                              <Badge
                                badgeContent={chat.unreadCount}
                                color="error"
                                max={99}
                              >
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {chat.avatar || chat.name.charAt(0)}
                                </Avatar>
                              </Badge>
                            </ListItemIcon>
                            <ListItemText 
                              primary={chat.name} 
                              secondary={chat.lastMessage?.text || 'No messages yet'} 
                              primaryTypographyProps={{
                                noWrap: true
                              }}
                              secondaryTypographyProps={{
                                noWrap: true
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    
                    {filteredChats.filter(chat => chat.platformId === platform.id).length > 5 && (
                      <ListItem disablePadding sx={{ pl: 4 }}>
                        <ListItemButton onClick={() => handlePlatformSelect(platform)}>
                          <ListItemText 
                            primary="See all conversations" 
                            primaryTypographyProps={{
                              fontSize: 14,
                              color: 'primary'
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    )}
                  </List>
                </Collapse>
                
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          /* Chats List View for Selected Platform */
          <List>
            {platformChats.length > 0 ? (
              platformChats.map((chat) => (
                <ListItem 
                  key={chat.id} 
                  disablePadding
                  secondaryAction={
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(chat.lastMessage?.timestamp)}
                    </Typography>
                  }
                >
                  <ListItemButton
                    onClick={() => onChatSelect(chat)}
                    selected={selectedChat?.id === chat.id}
                  >
                    <ListItemIcon>
                      <Badge
                        badgeContent={chat.unreadCount}
                        color="error"
                        max={99}
                      >
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {chat.avatar || chat.name.charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemIcon>
                    <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <Typography variant="body1" noWrap>
                        {chat.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {chat.lastMessage?.senderName !== chat.name && chat.lastMessage?.senderName 
                          ? `${chat.lastMessage.senderName}: ${chat.lastMessage.text}` 
                          : chat.lastMessage?.text || 'No messages yet'}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No conversations found
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {searchTerm 
                    ? 'Try a different search term'
                    : 'Your conversations will appear here'}
                </Typography>
                
                {!searchTerm && selectedPlatform && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddCircleIcon />}
                    sx={{ mt: 2 }}
                  >
                    New Conversation
                  </Button>
                )}
              </Box>
            )}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;