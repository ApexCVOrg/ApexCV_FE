'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  Avatar,
  CircularProgress,
  TextField,
  IconButton,
  Paper,
  // Divider,
  Fade,
  Tooltip,
  Button,
  Chip,
} from '@mui/material';
import { Send as SendIcon, Menu as MenuIcon, PlayArrow as PlayIcon } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import { useRouter } from 'next/navigation';

interface ChatSession {
  _id: string;
  chatId: string;
  userId: string;
  userName: string;
  lastMessage: string | { content: string };
  messageCount: number;
  status: 'open' | 'closed' | 'pending';
  createdAt: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  content: string;
  role: 'user' | 'manager' | 'bot';
  timestamp: string;
  senderName?: string;
  isBotMessage?: boolean; // Flag to identify bot messages
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export default function MessagesPage() {
  // Add CSS to override admin layout styles
  useEffect(() => {
    // Override admin layout padding for this page
    const style = document.createElement('style');
    style.textContent = `
      body {
        overflow: hidden !important;
      }
      .admin-layout-override {
        padding-top: 0 !important;
        margin-top: 0 !important;
      }
      /* Hide red indicator for this page */
      .MuiTabs-indicator {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managerJoined, setManagerJoined] = useState<Set<string>>(new Set());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarManagerOpen, setSidebarManagerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lắng nghe mở/đóng sidebar layout manager
  useEffect(() => {
    const handleOpen = () => setSidebarManagerOpen(true);
    const handleClose = () => setSidebarManagerOpen(false);
    window.addEventListener('open-manager-sidebar', handleOpen);
    window.addEventListener('close-manager-sidebar', handleClose);
    return () => {
      window.removeEventListener('open-manager-sidebar', handleOpen);
      window.removeEventListener('close-manager-sidebar', handleClose);
    };
  }, []);

  // Fetch chat sessions
  useEffect(() => {
    const fetchSessions = async () => {
      setLoadingSessions(true);
      setError(null);
      try {
        const token = getToken();
        
        // Get user role to determine correct endpoint
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        console.log('👤 Messages page - User role:', user?.role);
        
        // Check if admin user accessing this page
        const isAdminUser = user?.role === 'admin' || user?.role === 'ADMIN' || window.location.pathname.includes('/admin/');
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/manager/chats?limit=50&status=open`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          // Handle 403 for admin users - provide demo data
          if (response.status === 403 && isAdminUser) {
            console.log('🔒 Admin user got 403 on messages page, providing demo data...');
            const mockSessions: ChatSession[] = [
              {
                _id: 'mock-session-1',
                chatId: 'admin-demo-001',
                userId: 'user-001',
                userName: 'Nguyễn Văn A',
                lastMessage: 'Xin chào! Tôi cần hỗ trợ về sản phẩm giày thể thao.',
                messageCount: 5,
                status: 'open',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                _id: 'mock-session-2',
                chatId: 'admin-demo-003',
                userId: 'user-003',
                userName: 'Lê Minh C',
                lastMessage: 'Tôi muốn đổi size áo...',
                messageCount: 8,
                status: 'open',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date(Date.now() - 7200000).toISOString(),
              }
            ];
            setSessions(mockSessions);
            setError('🚀 Demo Mode: Đang hiển thị dữ liệu demo cho Admin.');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setSessions(data.data || []);
      } catch {
        setError('Không thể tải danh sách chat.');
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchSessions();
  }, [getToken]);

  // Fetch messages khi chọn chat
  useEffect(() => {
    if (!selectedChat) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      setError(null);
      try {
        const token = getToken();
        
        // Check if this is a demo chat session
        if (selectedChat.chatId.startsWith('admin-demo-')) {
          console.log('📝 Loading demo messages for admin user...');
          const mockMessages: Message[] = [
            {
              _id: 'msg-1',
              content: selectedChat.chatId === 'admin-demo-001' 
                ? 'Xin chào! Tôi cần hỗ trợ về sản phẩm giày thể thao.' 
                : 'Xin chào! Tôi muốn đổi size áo.',
              role: 'user',
              timestamp: new Date(Date.now() - 300000).toISOString(),
              senderName: selectedChat.userName,
            },
            {
              _id: 'msg-2',
              content: 'Bot: Xin chào! Cảm ơn bạn đã liên hệ với NIDAS. Tôi là bot hỗ trợ tự động. Nhân viên sẽ hỗ trợ bạn ngay.',
              role: 'bot',
              timestamp: new Date(Date.now() - 240000).toISOString(),
              isBotMessage: true,
            },
            {
              _id: 'msg-3',
              content: selectedChat.chatId === 'admin-demo-001' 
                ? 'Tôi muốn tìm giày chạy bộ size 42.' 
                : 'Cụ thể là tôi đã mua áo size M nhưng hơi rộng.',
              role: 'user',
              timestamp: new Date(Date.now() - 180000).toISOString(),
              senderName: selectedChat.userName,
            }
          ];
          
          setMessages(mockMessages);
          setLoadingMessages(false);
          return;
        }
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${selectedChat.chatId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const messagesData = Array.isArray(data.data) ? data.data : [];
        setMessages(messagesData);

        // Check if manager has already joined this chat (real manager, not bot)
        const hasRealManagerMessage = messagesData.some(
          (msg: Message) => msg.role === 'manager' && !msg.isBotMessage
        );
        if (hasRealManagerMessage) {
          setManagerJoined(prev => new Set(prev).add(selectedChat.chatId));
        }
      } catch {
        setError('Không thể tải tin nhắn.');
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedChat, getToken]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gửi tin nhắn
  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedChat) return;
    setSending(true);
    const messageContent = inputMessage.trim();
    setInputMessage('');
    try {
      // Handle demo chat sessions
      if (selectedChat.chatId.startsWith('admin-demo-')) {
        console.log('📝 Sending demo message for admin user...');
        const mockMessage: Message = {
          _id: `msg-${Date.now()}`,
          content: messageContent,
          role: 'manager',
          timestamp: new Date().toISOString(),
          senderName: 'Admin Support',
        };
        
        setMessages(prev => [...prev, mockMessage]);
        setManagerJoined(prev => new Set(prev).add(selectedChat.chatId));
        setSending(false);
        return;
      }
      
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${selectedChat.chatId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: messageContent }),
        }
      );
      if (!response.ok) throw new Error('Send failed');
      const result: ApiResponse<Message> = await response.json();
      setMessages(prev => [...prev, result.data]);

      // Mark that manager has joined this chat
      setManagerJoined(prev => new Set(prev).add(selectedChat.chatId));
    } catch {
      setError('Không thể gửi tin nhắn.');
      setInputMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  // Bắt đầu chat (manager tham gia)
  const startChat = async () => {
    if (!selectedChat) return;

    const welcomeMessage =
      'Xin chào! Tôi là nhân viên hỗ trợ của NIDAS. Tôi sẽ hỗ trợ bạn ngay bây giờ. Bạn cần hỗ trợ gì ạ?';

    try {
      // Handle demo chat sessions
      if (selectedChat.chatId.startsWith('admin-demo-')) {
        console.log('📝 Starting demo chat for admin user...');
        const mockMessage: Message = {
          _id: `msg-${Date.now()}`,
          content: welcomeMessage,
          role: 'manager',
          timestamp: new Date().toISOString(),
          senderName: 'Admin Support',
        };
        
        setMessages(prev => [...prev, mockMessage]);
        setManagerJoined(prev => new Set(prev).add(selectedChat.chatId));
        return;
      }
      
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${selectedChat.chatId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: welcomeMessage }),
        }
      );
      if (!response.ok) throw new Error('Send failed');
      const result: ApiResponse<Message> = await response.json();
      setMessages(prev => [...prev, result.data]);

      // Mark that manager has joined this chat
      setManagerJoined(prev => new Set(prev).add(selectedChat.chatId));
    } catch {
      setError('Không thể bắt đầu chat.');
    }
  };

  // Helper lấy nội dung lastMessage
  const getLastMessage = (msg: string | { content: string }): string => {
    if (typeof msg === 'string') return msg;
    if (msg && typeof msg === 'object' && 'content' in msg) return msg.content;
    return '';
  };

  // Check if chat needs manager intervention (only bot messages)
  const needsManagerIntervention = (chat: ChatSession) => {
    return !managerJoined.has(chat.chatId) && chat.messageCount > 0;
  };

  // Gửi event để mở sidebar layout manager
  const openManagerSidebar = () => {
    window.dispatchEvent(new CustomEvent('open-manager-sidebar'));
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 112, // Account for admin AppBar + tabs height
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 112px)', // Subtract AppBar height
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#18191a' : '#f5f5f5',
        display: 'flex',
        zIndex: 1200,
        // Remove any potential red borders
        border: 'none',
        outline: 'none',
        // Ensure no red styling from parent
        '&::before, &::after': {
          display: 'none',
        },
        // Override admin layout padding
        margin: 0,
        padding: 0,
        // Remove any red indicator styling
        '& .MuiTabs-indicator': {
          display: 'none',
        },
      }}
    >
      {/* Sidebar chat chỉ hiện khi không mở sidebar manager trên mobile, hoặc luôn hiện trên desktop */}
      {(!isMobile || (isMobile && !sidebarManagerOpen)) && (
        <Box
          sx={{
            width: 360,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#23272f' : '#ffffff',
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
            p: 2,
            overflowY: 'auto',
            borderRight: (theme) => theme.palette.mode === 'dark' 
              ? '1.5px solid #23272f' 
              : '1.5px solid #e0e0e0',
            boxShadow: 3,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Nút 3 gạch dọc */}
          {isMobile && (
            <IconButton
              onClick={openManagerSidebar}
              sx={{ 
                position: 'absolute', 
                top: 8, 
                left: 8, 
                zIndex: 10, 
                color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
              }}
            >
              <MenuIcon fontSize="medium" />
            </IconButton>
          )}
          {/* XÓA nút back ở đây */}
          <Typography
            variant="h6"
            sx={{ 
              mb: 2, 
              fontWeight: 700, 
              letterSpacing: 1, 
              pl: isMobile ? 5 : 0,
              color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
            }}
          >
            Đoạn chat
          </Typography>
          {error && (
            <Typography 
              color={error.includes('Demo Mode') ? 'warning' : 'error'} 
              variant="body2" 
              sx={{ 
                mb: 2,
                bgcolor: (theme) => error.includes('Demo Mode') 
                  ? theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)'
                  : theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)',
                p: 1,
                borderRadius: 1,
                border: error.includes('Demo Mode') ? '1px solid #ff9800' : '1px solid #f44336',
                color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
              }}
            >
              {error}
            </Typography>
          )}
          {loadingSessions ? (
            <CircularProgress />
          ) : (
            <List sx={{ p: 0, m: 0 }}>
              {sessions.map(chat => (
                <Fade in key={chat.chatId}>
                  <ListItemButton
                    selected={selectedChat?.chatId === chat.chatId}
                    onClick={() => setSelectedChat(chat)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      alignItems: 'flex-start',
                      transition: 'background 0.2s',
                      bgcolor: (theme) => selectedChat?.chatId === chat.chatId 
                        ? theme.palette.mode === 'dark' ? '#31343b' : '#f0f0f0'
                        : 'transparent',
                      '&:hover': { 
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2a2d34' : '#e8e8e8' 
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        mr: 2,
                        mt: 0.5,
                        width: 44,
                        height: 44,
                        fontWeight: 700,
                        bgcolor: '#1976d2',
                      }}
                    >
                      {chat.userName?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                              <Typography 
                        fontWeight={700} 
                        noWrap
                        sx={{
                          color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                        }}
                      >
                        {chat.userName}
                      </Typography>
                        {needsManagerIntervention(chat) && (
                          <Chip
                            label="Cần hỗ trợ"
                            size="small"
                            color="warning"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: '#ff9800',
                              color: '#fff',
                            }}
                          />
                        )}
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: (theme) => theme.palette.mode === 'dark' ? '#b0b3b8' : '#666',
                        }}
                        noWrap
                      >
                        {getLastMessage(chat.lastMessage)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: (theme) => theme.palette.mode === 'dark' ? '#888' : '#999',
                        }}
                      >
                        {new Date(chat.updatedAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </Fade>
              ))}
            </List>
          )}
        </Box>
      )}
      {/* Nội dung chat */}
      <Box
        sx={{
          flex: 1,
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#18191a' : '#f5f5f5',
          color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {selectedChat ? (
          <>
            {/* Header */}
            <Box
              sx={{
                px: 4,
                py: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderBottom: (theme) => theme.palette.mode === 'dark' 
                  ? '1.5px solid #23272f' 
                  : '1.5px solid #e0e0e0',
                minHeight: 80,
                // Ensure proper spacing and no overflow
                position: 'relative',
                zIndex: 1,
                // Remove any potential red styling
                '&::before, &::after': {
                  display: 'none',
                },
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#23272f' : '#ffffff',
              }}
            >
              <Avatar sx={{ width: 48, height: 48, fontWeight: 700, bgcolor: '#1976d2' }}>
                {selectedChat.userName?.[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{
                    color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                  }}
                >
                  {selectedChat.userName}
                </Typography>
                {needsManagerIntervention(selectedChat) && (
                  <Typography
                    variant="caption"
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      color: '#ff9800',
                    }}
                  >
                    ⚠️ Chưa có nhân viên hỗ trợ
                  </Typography>
                )}
              </Box>
            </Box>
            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: 4,
                py: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                '::-webkit-scrollbar': { width: 0 },
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#18191a' : '#f5f5f5',
              }}
            >
              {loadingMessages ? (
                <CircularProgress />
              ) : messages.length === 0 ? (
                <Typography 
                  sx={{ 
                    color: (theme) => theme.palette.mode === 'dark' ? '#b0b3b8' : '#666',
                  }}
                >
                  Chưa có tin nhắn nào
                </Typography>
              ) : (
                <>
                  {messages.map(msg => (
                    <Box
                      key={msg._id}
                      sx={{
                        display: 'flex',
                        justifyContent: msg.role === 'manager' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Tooltip
                        title={msg.senderName || (msg.role === 'bot' ? 'Bot' : '')}
                        placement="left"
                        arrow
                        disableInteractive
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            backgroundColor:
                              msg.role === 'manager'
                                ? '#1976d2'
                                : msg.role === 'bot'
                                  ? '#4caf50'
                                  : '#23272f',
                            color: '#fff',
                            borderRadius: 3,
                            maxWidth: '60%',
                            minWidth: 60,
                            boxShadow:
                              msg.role === 'manager'
                                ? '0 2px 8px rgba(25, 118, 210, 0.15)'
                                : msg.role === 'bot'
                                  ? '0 2px 8px rgba(76, 175, 80, 0.15)'
                                  : '0 2px 8px rgba(0,0,0,0.08)',
                            fontSize: '1rem',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: 'pre-wrap', fontSize: '1rem' }}
                          >
                            {msg.role === 'bot' ? `Bot: ${msg.content}` : msg.content}
                          </Typography>
                        </Paper>
                      </Tooltip>
                      <Typography
                        variant="caption"
                        sx={{ 
                          ml: 1, 
                          alignSelf: 'flex-end', 
                          color: (theme) => theme.palette.mode === 'dark' ? '#b0b3b8' : '#666',
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                  ))}

                  {/* Start Chat Button - chỉ hiện khi chưa có manager tham gia */}
                  {needsManagerIntervention(selectedChat) && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<PlayIcon />}
                        onClick={startChat}
                        sx={{
                          bgcolor: '#ff9800',
                          color: '#fff',
                          px: 3,
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: '#f57c00',
                          },
                        }}
                      >
                        🚀 Bắt đầu hỗ trợ khách hàng
                      </Button>
                    </Box>
                  )}
                </>
              )}
              <Box ref={messagesEndRef} />
            </Box>
            {/* Input */}
            <Box
              sx={{
                px: 4,
                py: 2,
                borderTop: (theme) => theme.palette.mode === 'dark' 
                  ? '1.5px solid #23272f' 
                  : '1.5px solid #e0e0e0',
                display: 'flex',
                gap: 1,
                alignItems: 'flex-end',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#23272f' : '#ffffff',
              }}
            >
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Nhập tin nhắn..."
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                disabled={sending}
                inputProps={{ maxLength: 1000 }}
                sx={{
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#23272f' : '#f8f9fa',
                  borderRadius: 2,
                  input: { 
                    color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                  },
                  textarea: { 
                    color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                  },
                  '& .MuiOutlinedInput-root': { 
                    border: 'none',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2a2d34' : '#f0f0f0',
                    },
                  },
                }}
              />
              <IconButton
                onClick={sendMessage}
                disabled={!inputMessage.trim() || sending}
                sx={{
                  bgcolor: '#1976d2',
                  color: '#fff',
                  borderRadius: 2,
                  height: 44,
                  width: 44,
                  ml: 1,
                  boxShadow: 2,
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography 
              sx={{ 
                fontSize: 22, 
                fontWeight: 500, 
                textAlign: 'center',
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b3b8' : '#666',
              }}
            >
              Chọn một đoạn chat để xem nội dung
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
