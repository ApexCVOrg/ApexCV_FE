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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/manager/chats?limit=50&status=open`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/manager/chats/${selectedChat.chatId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
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
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/manager/chats/${selectedChat.chatId}/messages`,
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
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/manager/chats/${selectedChat.chatId}/messages`,
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
        top: 64, // offset đúng với AppBar height
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 64px)',
        bgcolor: '#18191a',
        display: 'flex',
        zIndex: 1200,
      }}
    >
      {/* Sidebar chat chỉ hiện khi không mở sidebar manager trên mobile, hoặc luôn hiện trên desktop */}
      {(!isMobile || (isMobile && !sidebarManagerOpen)) && (
        <Box
          sx={{
            width: 360,
            bgcolor: '#23272f',
            color: '#fff',
            p: 2,
            overflowY: 'auto',
            borderRight: '1.5px solid #23272f',
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
              sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10, color: '#fff' }}
            >
              <MenuIcon fontSize="medium" />
            </IconButton>
          )}
          {/* XÓA nút back ở đây */}
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 700, letterSpacing: 1, pl: isMobile ? 5 : 0 }}
          >
            Đoạn chat
          </Typography>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
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
                      bgcolor: selectedChat?.chatId === chat.chatId ? '#31343b' : 'transparent',
                      '&:hover': { bgcolor: '#2a2d34' },
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
                        <Typography fontWeight={700} noWrap>
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
                      <Typography variant="body2" color="#b0b3b8" noWrap>
                        {getLastMessage(chat.lastMessage)}
                      </Typography>
                      <Typography variant="caption" color="#888">
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
          bgcolor: '#18191a',
          color: '#fff',
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
                borderBottom: '1.5px solid #23272f',
                minHeight: 80,
              }}
            >
              <Avatar sx={{ width: 48, height: 48, fontWeight: 700, bgcolor: '#1976d2' }}>
                {selectedChat.userName?.[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700}>
                  {selectedChat.userName}
                </Typography>
                {needsManagerIntervention(selectedChat) && (
                  <Typography
                    variant="caption"
                    color="#ff9800"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
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
              }}
            >
              {loadingMessages ? (
                <CircularProgress />
              ) : messages.length === 0 ? (
                <Typography color="#b0b3b8">Chưa có tin nhắn nào</Typography>
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
                        sx={{ ml: 1, alignSelf: 'flex-end', color: '#b0b3b8' }}
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
                borderTop: '1.5px solid #23272f',
                display: 'flex',
                gap: 1,
                alignItems: 'flex-end',
                bgcolor: '#23272f',
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
                  bgcolor: '#23272f',
                  borderRadius: 2,
                  input: { color: '#fff' },
                  textarea: { color: '#fff' },
                  '& .MuiOutlinedInput-root': { border: 'none' },
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
            <Typography color="#b0b3b8" sx={{ fontSize: 22, fontWeight: 500, textAlign: 'center' }}>
              Chọn một đoạn chat để xem nội dung
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
