import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Platform Services
import whatsappService from '../platforms/whatsapp/service';
import telegramService from '../platforms/telegram/service';
import discordService from '../platforms/discord/service';
import slackService from '../platforms/slack/service';
import messengerService from '../platforms/messenger/service';

// Define store
const useStore = create((set, get) => ({
  // State
  isInitialized: false,
  user: null,
  platforms: [],
  chats: [],
  messages: {},
  connectionStatus: {},
  error: null,
  
  // Platform Service Map
  platformServices: {
    whatsapp: whatsappService,
    telegram: telegramService,
    discord: discordService,
    slack: slackService,
    messenger: messengerService,
  },
  
  // Initialize the store with user settings
  initializeStore: async (settings) => {
    try {
      const { user, platforms: platformSettings } = settings || {};
      
      // Initialize user
      const currentUser = user || { name: 'User' };
      
      // Initialize platform list
      const platforms = [
        {
          id: 'whatsapp',
          name: 'WhatsApp',
          enabled: platformSettings?.whatsapp?.enabled || false,
          icon: 'whatsapp.png',
          color: '#25D366',
        },
        {
          id: 'telegram',
          name: 'Telegram',
          enabled: platformSettings?.telegram?.enabled || false,
          icon: 'telegram.png',
          color: '#0088cc',
          apiId: platformSettings?.telegram?.apiId || null,
          apiHash: platformSettings?.telegram?.apiHash || null,
        },
        {
          id: 'discord',
          name: 'Discord',
          enabled: platformSettings?.discord?.enabled || false,
          icon: 'discord.png',
          color: '#7289da',
          tokenType: platformSettings?.discord?.tokenType || 'bot',
        },
        {
          id: 'slack',
          name: 'Slack',
          enabled: platformSettings?.slack?.enabled || false,
          icon: 'slack.png',
          color: '#4A154B',
        },
        {
          id: 'messenger',
          name: 'Messenger',
          enabled: platformSettings?.messenger?.enabled || false,
          icon: 'messenger.png',
          color: '#00B2FF',
        },
      ];
      
      // Initialize connection status
      const connectionStatus = platforms.reduce((status, platform) => {
        status[platform.id] = platform.enabled ? 'disconnected' : 'disabled';
        return status;
      }, {});
      
      set({ 
        isInitialized: true,
        user: currentUser,
        platforms,
        connectionStatus,
        chats: [],
        messages: {},
      });
      
      return true;
    } catch (error) {
      console.error('Error initializing store:', error);
      set({ error: 'Failed to initialize application state' });
      return false;
    }
  },
  
  // Connect to all enabled platforms
  connectPlatforms: async () => {
    const { platforms, platformServices } = get();
    
    // For each enabled platform, initialize its service and connect
    const enabledPlatforms = platforms.filter(p => p.enabled);
    
    for (const platform of enabledPlatforms) {
      try {
        // Update connection status to connecting
        set(state => ({
          connectionStatus: {
            ...state.connectionStatus,
            [platform.id]: 'connecting'
          }
        }));
        
        // Get platform service
        const service = platformServices[platform.id];
        
        if (!service) {
          throw new Error(`Service for platform ${platform.id} not found`);
        }
        
        // Initialize the service with platform config
        await service.init(platform, {
          onMessage: (message) => get().addMessage(platform.id, message),
          onChat: (chat) => get().addChat(platform.id, chat),
          onConnectionStatusChange: (status) => get().updateConnectionStatus(platform.id, status),
          onError: (error) => console.error(`${platform.id} error:`, error),
        });
        
        // Connect to the platform
        await service.connect();
        
        // Update connection status
        set(state => ({
          connectionStatus: {
            ...state.connectionStatus,
            [platform.id]: 'connected'
          }
        }));
        
      } catch (error) {
        console.error(`Error connecting to ${platform.id}:`, error);
        
        set(state => ({
          connectionStatus: {
            ...state.connectionStatus,
            [platform.id]: 'error'
          },
          error: `Failed to connect to ${platform.name}`
        }));
      }
    }
  },
  
  // Disconnect from all platforms
  disconnectPlatforms: async () => {
    const { platforms, platformServices } = get();
    
    for (const platform of platforms) {
      try {
        const service = platformServices[platform.id];
        
        if (service) {
          await service.disconnect();
        }
        
        set(state => ({
          connectionStatus: {
            ...state.connectionStatus,
            [platform.id]: 'disconnected'
          }
        }));
      } catch (error) {
        console.error(`Error disconnecting from ${platform.id}:`, error);
      }
    }
  },
  
  // Add a new chat
  addChat: (platformId, chat) => {
    // Check if chat already exists
    const existing = get().chats.find(c => 
      c.platformId === platformId && c.originalId === chat.originalId
    );
    
    if (existing) {
      // If it exists, update it
      set(state => ({
        chats: state.chats.map(c => 
          (c.platformId === platformId && c.originalId === chat.originalId)
            ? { ...c, ...chat, lastUpdated: new Date() }
            : c
        )
      }));
    } else {
      // If it doesn't exist, add it
      const newChat = {
        id: uuidv4(),
        platformId,
        originalId: chat.originalId,
        type: chat.type || 'private',
        name: chat.name,
        avatar: chat.avatar,
        unreadCount: chat.unreadCount || 0,
        lastMessage: chat.lastMessage,
        members: chat.members || [],
        lastUpdated: new Date(),
        ...chat
      };
      
      set(state => ({
        chats: [...state.chats, newChat]
      }));
      
      // Initialize empty message list for this chat
      if (!get().messages[newChat.id]) {
        set(state => ({
          messages: {
            ...state.messages,
            [newChat.id]: []
          }
        }));
      }
    }
  },
  
  // Add a new message
  addMessage: (platformId, message) => {
    // Find the chat this message belongs to
    const chat = get().chats.find(c => 
      c.platformId === platformId && c.originalId === message.chatId
    );
    
    if (!chat) {
      console.error(`Chat not found for message: ${JSON.stringify(message)}`);
      return;
    }
    
    // Check if message already exists
    if (get().messages[chat.id]) {
      const existing = get().messages[chat.id].find(m => 
        m.platformId === platformId && m.originalId === message.originalId
      );
      
      if (existing) {
        // If it exists, update it
        set(state => ({
          messages: {
            ...state.messages,
            [chat.id]: state.messages[chat.id].map(m => 
              (m.platformId === platformId && m.originalId === message.originalId)
                ? { ...m, ...message, updatedAt: new Date() }
                : m
            )
          }
        }));
        return;
      }
    }
    
    // If it doesn't exist, add it
    const newMessage = {
      id: uuidv4(),
      chatId: chat.id,
      platformId,
      originalId: message.originalId,
      senderId: message.senderId,
      senderName: message.senderName,
      senderAvatar: message.senderAvatar,
      text: message.text,
      timestamp: message.timestamp || new Date(),
      attachments: message.attachments || [],
      reactions: message.reactions || [],
      replyTo: message.replyTo,
      isForwarded: message.isForwarded || false,
      status: message.status || 'sent',
      ...message
    };
    
    // Add the message
    set(state => ({
      messages: {
        ...state.messages,
        [chat.id]: [
          ...(state.messages[chat.id] || []),
          newMessage
        ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      },
      // Update chat with last message
      chats: state.chats.map(c => 
        c.id === chat.id
          ? {
              ...c,
              lastMessage: {
                text: newMessage.text,
                timestamp: newMessage.timestamp,
                senderId: newMessage.senderId,
                senderName: newMessage.senderName
              },
              unreadCount: c.unreadCount + 1,
              lastUpdated: new Date()
            }
          : c
      )
    }));
  },
  
  // Send a message
  sendMessage: async (chatId, text, attachments = []) => {
    const chat = get().chats.find(c => c.id === chatId);
    
    if (!chat) {
      console.error(`Chat not found: ${chatId}`);
      return null;
    }
    
    try {
      const service = get().platformServices[chat.platformId];
      
      if (!service) {
        throw new Error(`Service for platform ${chat.platformId} not found`);
      }
      
      // Create temporary message
      const tempMessage = {
        id: uuidv4(),
        chatId,
        platformId: chat.platformId,
        originalId: `temp-${Date.now()}`,
        senderId: 'self', // Will be replaced by platform
        senderName: get().user.name,
        text,
        timestamp: new Date(),
        attachments,
        status: 'sending'
      };
      
      // Add temporary message to UI
      set(state => ({
        messages: {
          ...state.messages,
          [chatId]: [
            ...(state.messages[chatId] || []),
            tempMessage
          ]
        }
      }));
      
      // Send the message through platform service
      const result = await service.sendMessage(chat.originalId, text, attachments);
      
      // Update temporary message with actual message details
      set(state => ({
        messages: {
          ...state.messages,
          [chatId]: state.messages[chatId].map(m => 
            m.id === tempMessage.id
              ? { 
                  ...m, 
                  originalId: result.originalId, 
                  status: 'sent',
                  timestamp: result.timestamp || m.timestamp
                }
              : m
          )
        },
        // Update chat's last message
        chats: state.chats.map(c => 
          c.id === chatId
            ? {
                ...c,
                lastMessage: {
                  text,
                  timestamp: new Date(),
                  senderId: 'self',
                  senderName: get().user.name
                },
                lastUpdated: new Date()
              }
            : c
        )
      }));
      
      return result;
    } catch (error) {
      console.error(`Error sending message to ${chat.platformId}:`, error);
      
      // Update message status to error
      set(state => ({
        messages: {
          ...state.messages,
          [chatId]: state.messages[chatId].map(m => 
            m.originalId === `temp-${Date.now()}`
              ? { ...m, status: 'error' }
              : m
          )
        }
      }));
      
      return null;
    }
  },
  
  // Mark chat as read
  markChatAsRead: async (chatId) => {
    const chat = get().chats.find(c => c.id === chatId);
    
    if (!chat) {
      return;
    }
    
    try {
      // Update in UI first
      set(state => ({
        chats: state.chats.map(c => 
          c.id === chatId
            ? { ...c, unreadCount: 0 }
            : c
        )
      }));
      
      // Send to platform service
      const service = get().platformServices[chat.platformId];
      
      if (service && service.markAsRead) {
        await service.markAsRead(chat.originalId);
      }
    } catch (error) {
      console.error(`Error marking chat as read: ${chat.platformId}/${chatId}`, error);
    }
  },
  
  // Update platform connection status
  updateConnectionStatus: (platformId, status) => {
    set(state => ({
      connectionStatus: {
        ...state.connectionStatus,
        [platformId]: status
      }
    }));
  },
  
  // Add reaction to message
  addReaction: async (chatId, messageId, reaction) => {
    const chat = get().chats.find(c => c.id === chatId);
    const message = get().messages[chatId]?.find(m => m.id === messageId);
    
    if (!chat || !message) {
      return false;
    }
    
    try {
      const service = get().platformServices[chat.platformId];
      
      if (!service || !service.addReaction) {
        throw new Error(`Reactions not supported on ${chat.platformId}`);
      }
      
      // Update in UI first
      set(state => ({
        messages: {
          ...state.messages,
          [chatId]: state.messages[chatId].map(m => 
            m.id === messageId
              ? {
                  ...m,
                  reactions: [
                    ...(m.reactions || []).filter(r => r.emoji !== reaction.emoji || r.userId !== 'self'),
                    { emoji: reaction.emoji, userId: 'self', username: get().user.name }
                  ]
                }
              : m
          )
        }
      }));
      
      // Send to platform
      await service.addReaction(chat.originalId, message.originalId, reaction.emoji);
      return true;
    } catch (error) {
      console.error(`Error adding reaction: ${chat.platformId}/${messageId}`, error);
      return false;
    }
  },
  
  // Remove reaction from message
  removeReaction: async (chatId, messageId, reaction) => {
    const chat = get().chats.find(c => c.id === chatId);
    const message = get().messages[chatId]?.find(m => m.id === messageId);
    
    if (!chat || !message) {
      return false;
    }
    
    try {
      const service = get().platformServices[chat.platformId];
      
      if (!service || !service.removeReaction) {
        throw new Error(`Reactions not supported on ${chat.platformId}`);
      }
      
      // Update in UI first
      set(state => ({
        messages: {
          ...state.messages,
          [chatId]: state.messages[chatId].map(m => 
            m.id === messageId
              ? {
                  ...m,
                  reactions: (m.reactions || []).filter(r => 
                    !(r.emoji === reaction.emoji && r.userId === 'self')
                  )
                }
              : m
          )
        }
      }));
      
      // Send to platform
      await service.removeReaction(chat.originalId, message.originalId, reaction.emoji);
      return true;
    } catch (error) {
      console.error(`Error removing reaction: ${chat.platformId}/${messageId}`, error);
      return false;
    }
  },
  
  // Clear all data
  clearAllData: () => {
    get().disconnectPlatforms();
    
    set({
      chats: [],
      messages: {},
      connectionStatus: get().platforms.reduce((status, platform) => {
        status[platform.id] = 'disconnected';
        return status;
      }, {})
    });
  }
}));

export default useStore;