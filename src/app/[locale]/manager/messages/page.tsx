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
  Fade,
  Tooltip,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Menu as MenuIcon,
  PlayArrow as PlayIcon,
  AttachFile as AttachFileIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import websocketService from '@/services/websocket';

interface ChatSession {
  _id: string;
  chatId: string;
  userId: string;
  userName: string;
  lastMessage: string | { content: string };
  messageCount: number;
  status: 'open' | 'closed' | 'pending';
  unreadCount?: number;
  lastMessageAt?: string;
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
  attachments?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }>;
  messageType?: 'text' | 'file' | 'image';
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
  const [joinLoading, setJoinLoading] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarManagerOpen, setSidebarManagerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const router = useRouter();

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
          `${process.env.NEXT_PUBLIC_API_URL}/manager/chats?limit=50&status=open`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        setSessions(data.data || []);

        // Check manager status for each session
        data.data?.forEach((session: ChatSession) => {
          checkManagerJoined(session.chatId);
        });
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
          `${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${selectedChat.chatId}/messages`,
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

  // WebSocket connection and message handling
  useEffect(() => {
    // Subscribe to connection changes
    const unsubscribe = websocketService.onConnectionChange(() => {
      setIsConnected(websocketService.isConnected());
    });

    // Initial connection status
    setIsConnected(websocketService.isConnected());

    // Set up periodic refresh of sessions list
    const refreshInterval = setInterval(() => {
      const refreshSessions = async () => {
        try {
          const token = getToken();
          if (!token) {
            console.error('No token available for API call');
            return;
          }

          console.log('Fetching sessions from:', `${process.env.NEXT_PUBLIC_API_URL}/manager/chats?limit=50&status=open`);
          
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/manager/chats?limit=50&status=open`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          console.log('Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Sessions data:', data);
          setSessions(data.data || []);
        } catch (error) {
          console.error('Error refreshing sessions:', error);
          // Don't show error to user for background refresh
        }
      };
      refreshSessions();
    }, 5000); // Refresh every 5 seconds

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [getToken]);

  // Subscribe to chat when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      // Subscribe to WebSocket chat for all selected chats
      websocketService.subscribeToChat(selectedChat.chatId, message => {
        if (message.type === 'message' && message.content) {
          // Check if message already exists to avoid duplicates
          setMessages(prev => {
            const messageExists = prev.some(
              msg =>
                msg.content === (message.content ?? '') &&
                Math.abs(
                  new Date(msg.timestamp).getTime() -
                    new Date(message.timestamp || Date.now()).getTime()
                ) < 5000 // Within 5 seconds
            );

            if (messageExists) {
              return prev; // Don't add duplicate
            }

            const newMessage: Message = {
              _id: Date.now().toString(),
              content: message.content ?? '',
              role: message.role as 'user' | 'manager' | 'bot',
              timestamp: new Date(message.timestamp || Date.now()).toISOString(),
              senderName: message.role === 'manager' ? 'Manager' : 'User',
              attachments: message.attachments,
              messageType: message.messageType,
            };
            return [...prev, newMessage];
          });

          // If manager receives a user message, mark as joined
          if (message.role === 'user') {
            setManagerJoined(prev => new Set(prev).add(selectedChat.chatId));
          }

          // Update sessions list when new message is received
          const refreshSessions = async () => {
            try {
              const token = getToken();
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/manager/chats?limit=50&status=open`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              const data = await response.json();
              setSessions(data.data || []);
            } catch (err) {
              console.error('Error refreshing sessions:', err);
            }
          };
          refreshSessions();
        } else if (message.type === 'typing') {
          if (message.isTyping) {
            setTypingUsers(prev => new Set(prev).add(message.userId || ''));
          } else {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(message.userId || '');
              return newSet;
            });
          }
        }
      });

      return () => {
        websocketService.unsubscribeFromChat(selectedChat.chatId);
      };
    }
  }, [selectedChat, getToken]);

  // Upload files to server
  const uploadFiles = async (files: File[]): Promise<unknown[]> => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/chat-files`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const data = await response.json();
      return data.data.files as Array<{
        filename: string;
        originalName: string;
        mimetype: string;
        size: number;
        url: string;
      }>;
    } catch {
      console.error('Error uploading files');
      throw new Error('Failed to upload files');
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    event.target.value = ''; // Reset input
  };

  // Remove selected file
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Gửi tin nhắn
  const sendMessage = async () => {
    if ((!inputMessage.trim() && selectedFiles.length === 0) || !selectedChat || sending) return;
    setSending(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let uploadedFiles: any[] = [];

    // Upload files if any
    if (selectedFiles.length > 0) {
      try {
        setUploadingFiles(true);
        uploadedFiles = await uploadFiles(selectedFiles);
      } catch {
        console.error('Failed to upload files');
        setError('Không thể upload file.');
        return;
      } finally {
        setUploadingFiles(false);
      }
    }

    const messageContent = inputMessage.trim() || (uploadedFiles.length > 0 ? '📎 File(s)' : '');
    setInputMessage('');
    setSelectedFiles([]);

    try {
      // Always send via WebSocket for realtime chat if connected
      if (websocketService.isConnected()) {
        // Add message to UI immediately
        const newMessage: Message = {
          _id: Date.now().toString(),
          content: messageContent,
          role: 'manager',
          timestamp: new Date().toISOString(),
          senderName: 'Manager',
          attachments: uploadedFiles,
          messageType:
            uploadedFiles.length > 0
              ? uploadedFiles.some(f => f.mimetype.startsWith('image/'))
                ? 'image'
                : 'file'
              : 'text',
        };
        setMessages(prev => [...prev, newMessage]);

        // Send via WebSocket
        websocketService.sendMessage(
          selectedChat.chatId,
          messageContent || '📎 File(s)',
          'manager',
          uploadedFiles,
          uploadedFiles.length > 0
            ? uploadedFiles.some(f => f.mimetype.startsWith('image/'))
              ? 'image'
              : 'file'
            : 'text'
        );
      } else {
        // Send via REST API if WebSocket not connected
        const token = getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${selectedChat.chatId}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: messageContent,
              attachments: uploadedFiles,
            }),
          }
        );
        if (!response.ok) throw new Error('Send failed');
        const result: ApiResponse<Message> = await response.json();
        setMessages(prev => [...prev, result.data]);
      }

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

  // Kết thúc phiên chat
  const handleEndSession = async (chatId: string) => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token available for close session');
        return;
      }

      console.log('Closing session:', chatId);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${chatId}/close`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            note: 'Session closed by manager'
          }),
        }
      );

      console.log('Close session response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Close session error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Close session result:', result);

      // Refresh sessions list
      const refreshSessions = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/manager/chats?limit=50&status=open`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            setSessions(data.data || []);
          }
        } catch (error) {
          console.error('Error refreshing sessions after close:', error);
        }
      };
      
      refreshSessions();
    } catch (error) {
      console.error('Error ending session:', error);
      // You can add a toast notification here
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

  // Function để manager tham gia chat
  const handleJoinChat = async (chatId: string) => {
    try {
      setJoinLoading(chatId);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setError('Không tìm thấy token xác thực');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/chats/${chatId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tham gia chat');
      }

      const data = await response.json();

      if (data.success) {
        setManagerJoined(prev => new Set(prev).add(chatId));
        // Refresh messages to show manager joined status
        if (selectedChat?.chatId === chatId) {
          // The fetchMessages function is already called in the useEffect for selectedChat
          // This call is redundant if the useEffect is sufficient.
          // However, if the intent is to refetch messages for the *current* selectedChat,
          // this might need adjustment depending on how fetchMessages is triggered.
          // For now, keeping it as is, assuming fetchMessages is sufficient.
        }
      }
    } catch {
      console.error('Error joining chat');
      setError('Không thể tham gia chat');
    } finally {
      setJoinLoading(null);
    }
  };

  // Function để kiểm tra manager đã tham gia chat chưa
  const checkManagerJoined = async (chatId: string) => {
    try {
      const token = getToken();

      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${chatId}/join-status`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data.isJoined) {
          setManagerJoined(prev => new Set(prev).add(chatId));
        }
      }
    } catch {
      console.error('Error checking manager status');
    }
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
          
          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
              {error}
            </Alert>
          )}
          {loadingSessions ? (
            <CircularProgress />
          ) : (
            <List sx={{ p: 0, m: 0 }}>
              {sessions
                .sort((a, b) => {
                  // Sort by lastMessageAt if available, otherwise by updatedAt
                  const aTime = a.lastMessageAt
                    ? new Date(a.lastMessageAt).getTime()
                    : new Date(a.updatedAt).getTime();
                  const bTime = b.lastMessageAt
                    ? new Date(b.lastMessageAt).getTime()
                    : new Date(b.updatedAt).getTime();
                  return bTime - aTime; // Newest first
                })
                .map(chat => (
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
                          {chat.unreadCount && chat.unreadCount > 0 && (
                            <Chip
                              label={chat.unreadCount}
                              size="small"
                              color="error"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                minWidth: '20px',
                                bgcolor: '#f44336',
                                color: '#fff',
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="#b0b3b8" noWrap>
                          {getLastMessage(chat.lastMessage)}
                        </Typography>
                        <Typography variant="caption" color="#888">
                          {chat.lastMessageAt
                            ? new Date(chat.lastMessageAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : new Date(chat.updatedAt).toLocaleTimeString('vi-VN', {
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
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Tin nhắn với {selectedChat.userName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {isConnected && managerJoined.has(selectedChat.chatId) && (
                        <Chip label="Realtime" color="primary" size="small" />
                      )}
                      {!managerJoined.has(selectedChat.chatId) && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleJoinChat(selectedChat.chatId)}
                          disabled={joinLoading === selectedChat.chatId}
                          startIcon={
                            joinLoading === selectedChat.chatId ? (
                              <CircularProgress size={16} />
                            ) : (
                              <PersonAddIcon />
                            )
                          }
                        >
                          {joinLoading === selectedChat.chatId
                            ? 'Đang tham gia...'
                            : 'Tham gia chat'}
                        </Button>
                      )}
                      {managerJoined.has(selectedChat.chatId) && (
                        <Chip
                          label="Đã tham gia"
                          color="success"
                          icon={<CheckCircleIcon />}
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
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

                          {/* Display attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {msg.attachments.map((attachment, index) => (
                                <Box key={index} sx={{ mb: 0.5 }}>
                                  {attachment.mimetype.startsWith('image/') ? (
                                    <img
                                      src={attachment.url}
                                      alt={attachment.originalName}
                                      style={{
                                        maxWidth: '200px',
                                        maxHeight: '200px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                      }}
                                      onClick={() => window.open(attachment.url, '_blank')}
                                      onError={e => {
                                        console.error('Failed to load image:', attachment.url);
                                        e.currentTarget.style.display = 'none';
                                      }}
                                      onLoad={() => {
                                        // Image loaded
                                      }}
                                    />
                                  ) : (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<AttachFileIcon />}
                                      onClick={() => window.open(attachment.url, '_blank')}
                                      sx={{
                                        textTransform: 'none',
                                        fontSize: '0.75rem',
                                        color: msg.role === 'manager' ? 'white' : '#1976d2',
                                        borderColor: msg.role === 'manager' ? 'white' : '#1976d2',
                                        '&:hover': {
                                          backgroundColor:
                                            msg.role === 'manager'
                                              ? 'rgba(255,255,255,0.1)'
                                              : 'rgba(25,118,210,0.1)',
                                        },
                                      }}
                                    >
                                      {attachment.originalName}
                                    </Button>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          )}
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

                  {/* End Session Button - chỉ hiện khi manager đã tham gia */}
                  {managerJoined.has(selectedChat.chatId) && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<StopIcon />}
                        onClick={() => handleEndSession(selectedChat.chatId)}
                        disabled={sending}
                        sx={{
                          px: 3,
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          borderColor: '#f44336',
                          color: '#f44336',
                          '&:hover': {
                            borderColor: '#d32f2f',
                            backgroundColor: 'rgba(244, 67, 54, 0.04)',
                          },
                        }}
                      >
                        ⏹️ Kết thúc phiên chat
                      </Button>
                    </Box>
                  )}
                </>
              )}
              <Box ref={messagesEndRef} />
              {typingUsers.size > 0 && (
                <Box sx={{ p: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                  {Array.from(typingUsers).join(', ')} đang nhập tin nhắn...
                </Box>
              )}
            </Box>
            {/* Quick Reply Suggestions */}
            {managerJoined.has(selectedChat.chatId) && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: '#23272f' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#fff', fontWeight: 600 }}>
                  💬 Tin nhắn gợi ý
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {[
                    'Xin chào! Tôi có thể giúp gì cho bạn?',
                    'Cảm ơn bạn đã liên hệ với chúng tôi!',
                    'Bạn cần hỗ trợ về sản phẩm nào?',
                    'Tôi sẽ kiểm tra và phản hồi ngay!',
                    'Bạn có thể cho tôi biết thêm chi tiết không?',
                    'Tôi hiểu vấn đề của bạn, để tôi hỗ trợ!',
                    'Cảm ơn bạn đã kiên nhẫn chờ đợi!',
                    'Tôi sẽ chuyển thông tin cho bộ phận liên quan.',
                    'Bạn có câu hỏi gì khác không?',
                    'Chúng tôi hỗ trợ giao hàng toàn quốc. Thời gian giao hàng từ 1-3 ngày (nội thành) và 3-7 ngày (ngoại thành). Miễn phí giao hàng cho đơn từ 500.000đ trở lên.',
                    'Chúng tôi đã tiếp nhận yêu cầu của bạn và sẽ phản hồi trong thời gian sớm nhất (tối đa 24h). Cảm ơn bạn đã liên hệ với NIDAS.',
                    'Chúc bạn một ngày tốt lành!',
                    'Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi sớm nhất.',
                  ].map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setInputMessage(suggestion);
                        // Auto send immediately
                        setTimeout(() => {
                          sendMessage();
                        }, 100);
                      }}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        borderColor: '#444',
                        color: '#fff',
                        '&:hover': {
                          borderColor: '#1976d2',
                          color: '#1976d2',
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                        },
                        maxWidth: '200px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {/* Selected Files Display */}
            {selectedFiles.length > 0 && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: '#23272f' }}>
                <Typography variant="caption" sx={{ mb: 1, display: 'block', color: '#fff' }}>
                  📎 Files selected ({selectedFiles.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedFiles.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => removeSelectedFile(index)}
                      size="small"
                      sx={{
                        fontSize: '0.75rem',
                        bgcolor: '#444',
                        color: '#fff',
                        '& .MuiChip-deleteIcon': {
                          color: '#fff',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Input */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Nhập tin nhắn..."
                  value={inputMessage}
                  onChange={e => {
                    setInputMessage(e.target.value);
                    // Send typing indicator
                    if (selectedChat && managerJoined.has(selectedChat.chatId)) {
                      websocketService.sendTyping(selectedChat.chatId, true);
                      // Clear typing indicator after 3 seconds
                      setTimeout(() => {
                        websocketService.sendTyping(selectedChat.chatId, false);
                      }, 3000);
                    }
                  }}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={sending || uploadingFiles}
                />

                {/* File Upload Button */}
                <Tooltip title="Gửi file/ảnh">
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending || uploadingFiles}
                    sx={{
                      backgroundColor: '#4caf50',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#388e3c',
                      },
                      '&:disabled': {
                        backgroundColor: '#666',
                        color: '#999',
                      },
                    }}
                  >
                    <AttachFileIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <IconButton
                  onClick={sendMessage}
                  disabled={
                    (!inputMessage.trim() && selectedFiles.length === 0) ||
                    sending ||
                    uploadingFiles
                  }
                  color="primary"
                >
                  {sending || uploadingFiles ? <CircularProgress size={20} /> : <SendIcon />}
                </IconButton>
              </Box>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
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
