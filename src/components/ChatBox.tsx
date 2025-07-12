'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Button,
  Fab,
  Collapse,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon, Chat as ChatIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  chatId: string;
  userId: string;
  status: 'active' | 'closed' | 'pending';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AI_CHAT_STORAGE_KEY = 'nidas_ai_chat_messages';

const ChatBox: React.FC = () => {
  const { isAuthenticated, getCurrentUser, getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatType, setChatType] = useState<'ai' | 'shop'>('ai');
  const [shopChatStarted, setShopChatStarted] = useState(false);
  const [shopChatTimer, setShopChatTimer] = useState<number>(0);
  const [currentChatSession, setCurrentChatSession] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user and check role
  const currentUser = getCurrentUser();
  
  // Get user role from JWT token (similar to Header component)
  const getUserRole = (): string | null => {
    try {
      const token = getToken();
      if (!token) return null;
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.role || null;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  };

  const userRole = getUserRole();

  // Only show ChatBox for users with role 'user'
  if (!isAuthenticated || userRole !== 'user') {
    return null;
  }

  // Load AI chat messages from localStorage
  const loadAIChatMessages = (): Message[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(AI_CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading AI chat messages:', error);
    }
    return [];
  };

  // Save AI chat messages to localStorage
  const saveAIChatMessages = (messages: Message[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving AI chat messages:', error);
    }
  };

  // Create chat session for shop chat
  const createChatSession = async (): Promise<ChatSession | null> => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No authentication token found');
        return null;
      }

      const response = await fetch(`${API_URL}/user/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to create chat session');
        return null;
      }

      const data = await response.json();
      return {
        chatId: data.data.chatId,
        userId: String(currentUser?.id || 'unknown'),
        status: 'active'
      };
    } catch (error) {
      console.error('Error creating chat session:', error);
      return null;
    }
  };

  // Save shop message to database
  const saveShopMessageToDatabase = async (message: string, isUserMessage: boolean) => {
    if (!currentChatSession) return;
    
    try {
      const token = getToken();
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${API_URL}/user/chats/${currentChatSession.chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: message,
          role: isUserMessage ? 'user' : 'manager', // Bot messages saved as manager
          isBotMessage: !isUserMessage, // Flag to identify bot messages
        }),
      });

      if (!response.ok) {
        console.error('Failed to save shop message to database');
      }
    } catch (error) {
      console.error('Error saving shop message to database:', error);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestions, isOpen]);

  // Fetch root suggestions when open
  useEffect(() => {
    if (isOpen) {
      if (chatType === 'ai') {
        // Load AI chat messages from localStorage
        const savedMessages = loadAIChatMessages();
        setMessages(savedMessages);
      } else {
        setMessages([]); // Reset shop chat
      }
      fetchSuggestions('');
      setCurrentPath('');
      setShopChatStarted(false);
      setShopChatTimer(0);
      setCurrentChatSession(null);
    }
  }, [isOpen, chatType]);

  // Timer effect for shop chat
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (shopChatStarted && shopChatTimer < 60) {
      interval = setInterval(() => {
        setShopChatTimer(prev => {
          if (prev >= 60) {
            // Add notification message when timer reaches 1 minute
            const notificationMessage = 'Shop: Cảm ơn bạn đã chat với chúng tôi! Nhân viên sẽ liên hệ lại trong thời gian sớm nhất. Bạn có thể tiếp tục gửi tin nhắn nếu cần hỗ trợ thêm.';
            setMessages(prev => [
              ...prev,
              {
                id: Date.now().toString(),
                text: notificationMessage,
                isUser: false,
                timestamp: new Date(),
              },
            ]);
            // Save bot message to database for shop chat
            if (chatType === 'shop') {
              saveShopMessageToDatabase(notificationMessage, false);
            }
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [shopChatStarted, shopChatTimer, chatType]);

  // Fetch suggestions from API
  const fetchSuggestions = async (path: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/suggestions?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
    } catch (err) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Send message to chat API
  const sendChatMessage = async (message: string) => {
    setChatLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        return {
          reply: data.data.reply,
          suggestions: data.data.suggestions || []
        };
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (err) {
      console.error('Chat API Error:', err);
      return {
        reply: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        suggestions: []
      };
    } finally {
      setChatLoading(false);
    }
  };

  // Send message to shop chat
  const sendShopMessage = async (message: string) => {
    setChatLoading(true);
    try {
      // Giả lập response từ shop (có thể thay bằng API thực tế)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const shopResponses = [
        'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
        'Xin chào! Nhân viên của chúng tôi sẽ hỗ trợ bạn ngay.',
        'Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ liên hệ lại.',
        'Xin chào! Bạn cần hỗ trợ gì ạ? Chúng tôi sẵn sàng giúp đỡ.',
        'Cảm ơn bạn đã quan tâm! Nhân viên sẽ phản hồi trong 5-10 phút.'
      ];
      
      const randomResponse = shopResponses[Math.floor(Math.random() * shopResponses.length)];
      
      return {
        reply: randomResponse,
        suggestions: []
      };
    } catch (err) {
      console.error('Shop Chat Error:', err);
      return {
        reply: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        suggestions: []
      };
    } finally {
      setChatLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = async (s: string) => {
    // Add user message
    const userMessage = `Bạn: ${s}`;
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: userMessage,
        isUser: true,
        timestamp: new Date(),
      },
    ]);

    // Save user message based on chat type
    if (chatType === 'shop') {
      await saveShopMessageToDatabase(s, true);
    }

    // Send to appropriate chat API
    const response = chatType === 'ai' 
      ? await sendChatMessage(s)
      : await sendShopMessage(s);
    
    // Add bot response
    const botMessage = `Bot: ${response.reply}`;
    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        text: botMessage,
        isUser: false,
        timestamp: new Date(),
      },
    ]);

    // Save bot message based on chat type
    if (chatType === 'shop') {
      await saveShopMessageToDatabase(response.reply, false);
    } else {
      // Save AI messages to localStorage
      const updatedMessages = [
        ...messages,
        {
          id: Date.now().toString(),
          text: userMessage,
          isUser: true,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          text: botMessage,
          isUser: false,
          timestamp: new Date(),
        },
      ];
      saveAIChatMessages(updatedMessages);
    }

    // Update suggestions if available (only for AI chat)
    if (chatType === 'ai' && response.suggestions && response.suggestions.length > 0) {
      setSuggestions(response.suggestions);
    } else {
      // Update path and fetch next suggestions (only for AI chat)
      if (chatType === 'ai') {
        const newPath = currentPath ? `${currentPath}|${s}` : s;
        setCurrentPath(newPath);
        fetchSuggestions(newPath);
      } else {
        setSuggestions([]); // Hide suggestions for shop chat
      }
    }
  };

  // Handle send message (user typing)
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || chatLoading) return;
    
    // Check if shop chat is started
    if (chatType === 'shop' && !shopChatStarted) {
      return;
    }
    
    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message
    const userMessageText = `Bạn: ${userMessage}`;
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: userMessageText,
        isUser: true,
        timestamp: new Date(),
      },
    ]);

    // Save user message based on chat type
    if (chatType === 'shop') {
      await saveShopMessageToDatabase(userMessage, true);
    }

    // Send to appropriate chat API
    const response = chatType === 'ai' 
      ? await sendChatMessage(userMessage)
      : await sendShopMessage(userMessage);
    
    // Add bot response
    const botMessage = `Bot: ${response.reply}`;
    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        text: botMessage,
        isUser: false,
        timestamp: new Date(),
      },
    ]);

    // Save bot message based on chat type
    if (chatType === 'shop') {
      await saveShopMessageToDatabase(response.reply, false);
    } else {
      // Save AI messages to localStorage
      const updatedMessages = [
        ...messages,
        {
          id: Date.now().toString(),
          text: userMessageText,
          isUser: true,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          text: botMessage,
          isUser: false,
          timestamp: new Date(),
        },
      ];
      saveAIChatMessages(updatedMessages);
    }

    // Update suggestions if available (only for AI chat)
    if (chatType === 'ai' && response.suggestions && response.suggestions.length > 0) {
      setSuggestions(response.suggestions);
    } else {
      setSuggestions([]); // Hide suggestions when user chats freely
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Handle chat type change
  const handleChatTypeChange = (type: 'ai' | 'shop') => {
    setChatType(type);
    setSuggestions([]);
    setCurrentPath('');
    setShopChatStarted(false);
    setShopChatTimer(0);
    setCurrentChatSession(null);
    
    if (type === 'ai') {
      // Load AI chat messages from localStorage
      const savedMessages = loadAIChatMessages();
      setMessages(savedMessages);
      fetchSuggestions('');
    } else {
      setMessages([]); // Reset shop chat
    }
  };

  // Handle start shop chat
  const handleStartShopChat = async () => {
    setShopChatStarted(true);
    setShopChatTimer(0);
    
    // Create chat session
    const chatSession = await createChatSession();
    setCurrentChatSession(chatSession);
    
    // Add welcome message from shop
    const welcomeMessage = 'Shop: Xin chào! Cảm ơn bạn đã liên hệ với NIDAS. Nhân viên của chúng tôi sẽ hỗ trợ bạn trong thời gian sớm nhất. Bạn có thể gửi tin nhắn ngay bây giờ!';
    setMessages([
      {
        id: Date.now().toString(),
        text: welcomeMessage,
        isUser: false,
        timestamp: new Date(),
      },
    ]);

    // Save welcome message to database
    if (chatSession) {
      await saveShopMessageToDatabase(welcomeMessage, false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      <Collapse in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            width: { xs: 'calc(100vw - 40px)', sm: 400, md: 450 },
            height: { xs: 'calc(100vh - 120px)', sm: 500, md: 550 },
            maxWidth: { xs: 350, sm: 400, md: 450 },
            maxHeight: { xs: 'calc(100vh - 120px)', sm: 500, md: 550 },
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChatIcon fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                {chatType === 'ai' ? 'Trợ lý ảo' : 'Chat với shop'}
              </Typography>
              {chatType === 'shop' && shopChatStarted && (
                <Box
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    ml: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                    ⏱️ {Math.floor(shopChatTimer / 60)}:{(shopChatTimer % 60).toString().padStart(2, '0')}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Chat Type Toggle Buttons */}
              <Box
                sx={{
                  display: 'flex',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  p: 0.5,
                  gap: 0.5,
                }}
              >
                <Button
                  size="small"
                  onClick={() => handleChatTypeChange('ai')}
                  sx={{
                    color: chatType === 'ai' ? '#667eea' : 'white',
                    backgroundColor: chatType === 'ai' ? 'white' : 'transparent',
                    borderRadius: 1.5,
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: chatType === 'ai' ? 'white' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  AI
                </Button>
                <Button
                size="small"
                  onClick={() => handleChatTypeChange('shop')}
                  sx={{
                    color: chatType === 'shop' ? '#667eea' : 'white',
                    backgroundColor: chatType === 'shop' ? 'white' : 'transparent',
                    borderRadius: 1.5,
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: chatType === 'shop' ? 'white' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Shop
                </Button>
              </Box>
              <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Messages */}
            <Box
              sx={{
                flex: 1,
              minHeight: 0,
              maxHeight: '100%',
              overflowY: 'scroll',
              overscrollBehaviorY: 'contain',
                p: 2,
                backgroundColor: '#f8f9fa',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#bdbdbd',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f0f0f0',
              },
            }}
          >
            {messages.length === 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: chatType === 'ai' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <ChatIcon sx={{ color: 'white', fontSize: 30 }} />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 1,
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {chatType === 'ai' ? 'Chào bạn!' : 'Xin chào!'}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    lineHeight: 1.6,
                    maxWidth: 280,
                  }}
                >
                  {chatType === 'ai' 
                    ? 'Tôi là trợ lý AI của NIDAS. Hãy chọn một gợi ý bên dưới hoặc nhập câu hỏi của bạn!'
                    : 'Chào mừng bạn đến với NIDAS! Nhân viên của chúng tôi sẽ hỗ trợ bạn trong thời gian sớm nhất.'
                  }
                </Typography>
                {chatType === 'shop' && !shopChatStarted && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleStartShopChat}
                    sx={{
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 4px 20px rgba(255, 107, 107, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ff5252 0%, #d84315 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 25px rgba(255, 107, 107, 0.5)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    🚀 Bắt đầu chat với shop
                  </Button>
                )}
                {chatType === 'shop' && (
                  <Box
                    sx={{
                      backgroundColor: 'rgba(255, 107, 107, 0.1)',
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                      borderRadius: 2,
                      p: 2,
                      textAlign: 'left',
                      mt: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Thông tin liên hệ:
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      📞 Hotline: 0359731884
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      📧 Email: support@nidas.com
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      ⏰ Giờ làm việc: 8:00 - 22:00
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '85%',
                    alignItems: msg.isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                      backgroundColor: msg.isUser ? '#1976d2' : 'white',
                      color: msg.isUser ? 'white' : 'text.primary',
                        borderRadius: 2,
                      borderBottomLeftRadius: msg.isUser ? 2 : 0,
                      borderBottomRightRadius: msg.isUser ? 0 : 2,
                      boxShadow: msg.isUser 
                        ? '0 2px 8px rgba(25, 118, 210, 0.3)' 
                        : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        wordBreak: 'break-word',
                        lineHeight: 1.5,
                        fontSize: '0.875rem',
                      }}
                    >
                      {msg.text}
                      </Typography>
                    </Paper>
                    <Typography
                      variant="caption"
                    sx={{ 
                      mt: 0.5, 
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      opacity: 0.7,
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                    </Typography>
                  </Box>
                </Box>
              ))}
            {chatLoading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '85%',
                    alignItems: 'flex-start',
                  }}
                >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        backgroundColor: 'white',
                        borderRadius: 2,
                      borderBottomLeftRadius: 0,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        {chatType === 'ai' ? 'Bot đang trả lời...' : 'Đang gửi tin nhắn...'}
                      </Typography>
                    </Box>
                    </Paper>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

          {/* Suggestion Buttons */}
          {chatType === 'ai' && suggestions.length > 0 && (
            <Box
              sx={{
                p: 2,
                pt: 1,
                borderTop: '1px solid #eee',
                background: '#fafbfc',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                minHeight: 56,
                maxHeight: '40vh', // Tăng maxHeight để hiển thị nhiều hơn
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    Đang tải gợi ý...
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Suggestions Grid */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr', // Mobile: 1 cột
                        sm: 'repeat(auto-fit, minmax(200px, 1fr))', // Tablet: auto-fit
                        md: 'repeat(auto-fit, minmax(180px, 1fr))', // Desktop: auto-fit
                      },
                      gap: 1,
                      width: '100%',
                    }}
                  >
                    {suggestions.map((s, idx) => (
                      <Button
                        key={s + idx}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          px: 2,
                          py: 1.5,
                          minHeight: 48,
                          whiteSpace: 'normal', // Cho phép text wrap
                          wordBreak: 'break-word',
                          fontSize: '0.875rem',
                          lineHeight: 1.4,
                          borderColor: '#ddd',
                          color: '#333',
                          backgroundColor: '#fff',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            borderColor: '#1976d2',
                            color: '#1976d2',
                          },
                          '&:disabled': {
                            backgroundColor: '#f5f5f5',
                            color: '#999',
                            borderColor: '#ddd',
                          },
                        }}
                        onClick={() => handleSuggestionClick(s)}
                        disabled={chatLoading}
                      >
                        {s}
                      </Button>
                    ))}
                  </Box>
                  
                  {/* Scroll indicator */}
                  {suggestions.length > 6 && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 0.5,
                        pt: 1,
                        borderTop: '1px solid #eee',
                        mt: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Cuộn để xem thêm gợi ý
                      </Typography>
                      <Box
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: '#ccc',
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                            '100%': { opacity: 1 },
                          },
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}

          {/* Input Area */}
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
              backgroundColor: 'white',
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  size="small"
                placeholder={chatType === 'ai' ? 'Nhập tin nhắn...' : 'Nhập tin nhắn cho shop...'}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                disabled={chatLoading || (chatType === 'shop' && !shopChatStarted)}
                multiline
                maxRows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                disabled={!inputMessage.trim() || chatLoading || (chatType === 'shop' && !shopChatStarted)}
                  sx={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                  minWidth: 40,
                  height: 40,
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    transform: 'scale(1.05)',
                    },
                    '&:disabled': {
                      backgroundColor: '#e0e0e0',
                      color: '#9e9e9e',
                    transform: 'none',
                    },
                  transition: 'all 0.2s ease',
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
        </Paper>
      </Collapse>

      {/* Chat Button */}
      <Fab
        color="primary"
        onClick={() => setIsOpen((v) => !v)}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: { xs: 56, sm: 60 },
          height: { xs: 56, sm: 60 },
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </Box>
  );
};

export default ChatBox; 