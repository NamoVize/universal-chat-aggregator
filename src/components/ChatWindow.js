import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  Paper, 
  InputBase, 
  IconButton,
  Divider,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ReplyIcon from '@mui/icons-material/Reply';
import ForwardIcon from '@mui/icons-material/Forward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import VideoIcon from '@mui/icons-material/Videocam';
import AudioIcon from '@mui/icons-material/AudioFile';
import useStore from '../store/store';

// Message status indicators
const getMessageStatus = (status) => {
  switch (status) {
    case 'sending':
      return <CircularProgress size={12} thickness={8} />;
    case 'sent':
      return <Typography variant="caption" color="text.secondary">Sent</Typography>;
    case 'delivered':
      return <Typography variant="caption" color="text.secondary">Delivered</Typography>;
    case 'read':
      return <Typography variant="caption" color="text.secondary">Read</Typography>;
    case 'error':
      return <Typography variant="caption" color="error">Failed</Typography>;
    default:
      return null;
  }
};

// Format message timestamp
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format message date for headers
const formatMessageDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }
};

const ChatWindow = ({ platform, chat, messages = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [emojiMenuAnchor, setEmojiMenuAnchor] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { sendMessage, markChatAsRead, addReaction, removeReaction } = useStore();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Mark chat as read when opened
  useEffect(() => {
    if (chat) {
      markChatAsRead(chat.id);
    }
  }, [chat, markChatAsRead]);
  
  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle send message
  const handleSendMessage = async () => {
    if (!inputValue.trim() && !attachments.length) return;
    
    try {
      await sendMessage(chat.id, inputValue, attachments);
      setInputValue('');
      setAttachments([]);
      setReplyingTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle message menu open
  const handleMessageMenuOpen = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };
  
  // Handle message menu close
  const handleMessageMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };
  
  // Handle message options
  const handleMessageOption = (option) => {
    switch (option) {
      case 'reply':
        setReplyingTo(selectedMessage);
        break;
      case 'copy':
        navigator.clipboard.writeText(selectedMessage.text);
        break;
      case 'forward':
        // Would open forward dialog
        break;
      case 'delete':
        // Would delete message if allowed
        break;
      default:
        break;
    }
    
    handleMessageMenuClose();
  };
  
  // Handle emoji menu
  const handleEmojiMenuOpen = (event) => {
    setEmojiMenuAnchor(event.currentTarget);
  };
  
  const handleEmojiMenuClose = () => {
    setEmojiMenuAnchor(null);
  };
  
  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setInputValue(prev => prev + emoji);
    handleEmojiMenuClose();
  };
  
  // Handle reaction
  const handleReaction = (message, reaction) => {
    const existing = message.reactions?.find(
      r => r.emoji === reaction && r.userId === 'self'
    );
    
    if (existing) {
      removeReaction(chat.id, message.id, { emoji: reaction });
    } else {
      addReaction(chat.id, message.id, { emoji: reaction });
    }
  };
  
  // Group messages by date
  const groupedMessages = (chat?.id && messages[chat.id]) || [];
  let lastDate = null;
  
  // Handle file attachment
  const [attachments, setAttachments] = useState([]);
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substring(2),
      file,
      type: file.type.split('/')[0],
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };
  
  const handleRemoveAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };
  
  // Render empty state
  if (!chat) {
    return (
      <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
        padding: 3,
      }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Select a conversation to start chatting
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose a platform and chat from the sidebar
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default'
    }}>
      {/* Chat Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}>
        <Avatar sx={{ mr: 2 }}>
          {chat.avatar || chat.name.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div">
            {chat.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {platform?.name || ''}
          </Typography>
        </Box>
        <Tooltip title="Chat options">
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Message List */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {groupedMessages.map((message, index) => {
          const isSelf = message.senderId === 'self';
          const showDate = lastDate !== formatMessageDate(message.timestamp);
          
          if (showDate) {
            lastDate = formatMessageDate(message.timestamp);
          }
          
          return (
            <React.Fragment key={message.id}>
              {showDate && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  my: 2
                }}>
                  <Chip 
                    label={lastDate} 
                    sx={{ 
                      bgcolor: 'background.paper',
                      color: 'text.secondary'
                    }} 
                  />
                </Box>
              )}
              
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: isSelf ? 'flex-end' : 'flex-start',
                mb: 1
              }}>
                {/* Reply reference */}
                {message.replyTo && (
                  <Paper 
                    elevation={0}
                    sx={{
                      p: 1,
                      mb: 0.5,
                      bgcolor: 'action.hover',
                      borderRadius: 2,
                      maxWidth: '80%',
                      width: 'auto',
                      alignSelf: isSelf ? 'flex-end' : 'flex-start',
                      borderLeft: '3px solid',
                      borderColor: 'primary.main'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Reply to {message.replyTo.senderName}
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {message.replyTo.text}
                    </Typography>
                  </Paper>
                )}
                
                {/* Message bubble */}
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: isSelf ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  maxWidth: '80%'
                }}>
                  {!isSelf && (
                    <Avatar 
                      sx={{ width: 32, height: 32, mr: 1 }}
                    >
                      {message.senderAvatar || message.senderName?.charAt(0) || '?'}
                    </Avatar>
                  )}
                  
                  <Box sx={{ maxWidth: 'calc(100% - 40px)' }}>
                    {!isSelf && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {message.senderName}
                      </Typography>
                    )}
                    
                    <Paper
                      elevation={1}
                      className={isSelf ? 'chat-bubble-self' : 'chat-bubble-other'}
                      sx={{
                        p: 1.5,
                        maxWidth: '100%',
                        wordBreak: 'break-word',
                        position: 'relative'
                      }}
                      onClick={(e) => e.button === 2 && handleMessageMenuOpen(e, message)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleMessageMenuOpen(e, message);
                      }}
                    >
                      <Typography variant="body1">
                        {message.text}
                      </Typography>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {message.attachments.map((attachment, i) => {
                            let AttachmentIcon = FileIcon;
                            
                            if (attachment.type === 'image') {
                              AttachmentIcon = ImageIcon;
                            } else if (attachment.type === 'video') {
                              AttachmentIcon = VideoIcon;
                            } else if (attachment.type === 'audio') {
                              AttachmentIcon = AudioIcon;
                            }
                            
                            return (
                              <Box 
                                key={i}
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  p: 1,
                                  borderRadius: 1,
                                  bgcolor: 'rgba(0,0,0,0.1)',
                                  mt: 0.5
                                }}
                              >
                                <AttachmentIcon sx={{ mr: 1 }} />
                                <Typography variant="body2" noWrap sx={{ maxWidth: '200px' }}>
                                  {attachment.name}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                      
                      {/* Message info */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        mt: 0.5,
                        opacity: 0.7,
                        fontSize: '0.7rem'
                      }}>
                        <Typography variant="caption" color="inherit">
                          {formatMessageTime(message.timestamp)}
                        </Typography>
                        {isSelf && (
                          <Box sx={{ ml: 0.5 }}>
                            {getMessageStatus(message.status)}
                          </Box>
                        )}
                      </Box>
                    </Paper>
                    
                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <Box sx={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        mt: 0.5,
                        mb: 1,
                        justifyContent: isSelf ? 'flex-end' : 'flex-start',
                        gap: 0.5
                      }}>
                        {Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => {
                          const count = message.reactions.filter(r => r.emoji === emoji).length;
                          const userReacted = message.reactions.some(r => r.emoji === emoji && r.userId === 'self');
                          
                          return (
                            <Chip
                              key={emoji}
                              label={`${emoji} ${count}`}
                              size="small"
                              onClick={() => handleReaction(message, emoji)}
                              variant={userReacted ? "filled" : "outlined"}
                              sx={{ 
                                bgcolor: userReacted ? 'rgba(114, 137, 218, 0.1)' : 'transparent',
                                cursor: 'pointer'
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </React.Fragment>
          );
        })}
        
        {isTyping && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mt: 2
          }}>
            <Typography variant="body2" color="text.secondary">
              Someone is typing...
            </Typography>
            <Box sx={{ display: 'flex', ml: 1 }}>
              {[0, 1, 2].map(i => (
                <Box 
                  key={i}
                  className="typing-dot" 
                  sx={{ 
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'text.secondary',
                    ml: 0.5
                  }} 
                />
              ))}
            </Box>
          </Box>
        )}
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Reply preview */}
      {replyingTo && (
        <Box sx={{ 
          p: 1, 
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Box sx={{ 
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <ReplyIcon color="action" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="caption" color="primary">
                Reply to {replyingTo.senderName}
              </Typography>
              <Typography variant="body2" noWrap>
                {replyingTo.text}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setReplyingTo(null)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      
      {/* Attachment preview */}
      {attachments.length > 0 && (
        <Box sx={{ 
          p: 1, 
          bgcolor: 'background.paper',
          borderTop: attachments.length && !replyingTo ? 1 : 0,
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1
        }}>
          {attachments.map(att => (
            <Chip
              key={att.id}
              icon={att.type === 'image' ? <ImageIcon /> : <FileIcon />}
              label={att.name}
              onDelete={() => handleRemoveAttachment(att.id)}
            />
          ))}
        </Box>
      )}
      
      {/* Message Input */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Paper
          component="form"
          elevation={0}
          sx={{ 
            p: '2px 4px', 
            display: 'flex', 
            alignItems: 'center',
            bgcolor: 'action.hover',
            borderRadius: 4
          }}
        >
          <IconButton onClick={handleEmojiMenuOpen}>
            <EmojiEmotionsIcon />
          </IconButton>
          
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <IconButton onClick={() => fileInputRef.current.click()}>
            <AttachFileIcon />
          </IconButton>
          
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Type a message"
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          
          <IconButton 
            color="primary" 
            sx={{ p: '10px' }} 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() && !attachments.length}
          >
            <SendIcon />
          </IconButton>
        </Paper>
      </Box>
      
      {/* Message context menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMessageMenuClose}
      >
        <MenuItem onClick={() => handleMessageOption('reply')}>
          <ListItemIcon>
            <ReplyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reply</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMessageOption('forward')}>
          <ListItemIcon>
            <ForwardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Forward</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMessageOption('copy')}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Text</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleMessageOption('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Emoji menu */}
      <Menu
        anchorEl={emojiMenuAnchor}
        open={Boolean(emojiMenuAnchor)}
        onClose={handleEmojiMenuClose}
      >
        {['😊', '👍', '❤️', '😂', '😎', '🎉', '👏', '🔥'].map(emoji => (
          <MenuItem key={emoji} onClick={() => handleEmojiSelect(emoji)}>
            {emoji}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default ChatWindow;