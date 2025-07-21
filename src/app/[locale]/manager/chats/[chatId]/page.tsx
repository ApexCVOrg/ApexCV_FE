'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  FormatListBulleted as TemplateIcon,
  Note as NoteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  _id: string;
  content: string;
  sender: 'user' | 'manager';
  timestamp: string;
  senderName?: string;
}

interface ChatSession {
  _id: string;
  chatId: string;
  userId: string;
  userName: string;
  status: 'active' | 'closed' | 'pending';
  createdAt: string;
  updatedAt: string;
}

interface QuickTemplate {
  id: string;
  title: string;
  content: string;
}

const ChatDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, getToken } = useAuth();
  const chatId = params.chatId as string;

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // State
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [notes, setNotes] = useState('');
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Quick templates
  const quickTemplates: QuickTemplate[] = [
    {
      id: '1',
      title: 'Chào hỏi',
      content: 'Xin chào! Cảm ơn bạn đã liên hệ với NIDAS. Tôi có thể giúp gì cho bạn?',
    },
    {
      id: '2',
      title: 'Hỏi thông tin',
      content: 'Bạn có thể cho tôi biết thêm thông tin về vấn đề này không?',
    },
    {
      id: '3',
      title: 'Chuyển tiếp',
      content:
        'Tôi sẽ chuyển thông tin này cho bộ phận chuyên môn và sẽ liên hệ lại với bạn sớm nhất.',
    },
    {
      id: '4',
      title: 'Kết thúc',
      content:
        'Cảm ơn bạn đã liên hệ với NIDAS. Nếu cần hỗ trợ thêm, đừng ngần ngại liên hệ lại nhé!',
    },
    {
      id: '5',
      title: 'Xin lỗi',
      content: 'Xin lỗi vì sự bất tiện này. Chúng tôi đang xử lý và sẽ cập nhật cho bạn sớm nhất.',
    },
  ];

  // Fetch chat session details
  const fetchChatSession = async () => {
    if (!isAuthenticated || !chatId) return;

    try {
      const token = getToken();
      if (!token) {
        setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        setError('Chat session không tồn tại hoặc đã bị xóa.');
        // Redirect back to chat sessions list after a delay
        setTimeout(() => {
          router.push('/manager/chats');
        }, 3000);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatSession = await response.json();
      setSession(data);
    } catch (err) {
      console.error('Error fetching chat session:', err);
      setError('Không thể tải thông tin chat session.');
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    if (!isAuthenticated || !chatId) return;

    try {
      const token = getToken();
      if (!token) {
        setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${chatId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 404) {
        setError('Chat session không tồn tại hoặc đã bị xóa.');
        setMessages([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Ensure data is an array
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Không thể tải tin nhắn.');
      setMessages([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || sending || !chatId) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      const token = getToken();
      if (!token) {
        setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        setInputMessage(messageContent); // Restore message
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${chatId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: messageContent }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newMessage: Message = await response.json();
      setMessages(prev => [...prev, newMessage]);
      setSuccess('Tin nhắn đã được gửi thành công!');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
      setInputMessage(messageContent); // Restore message
    } finally {
      setSending(false);
    }
  };

  // Close chat session
  const closeChatSession = async () => {
    if (!chatId) return;

    try {
      const token = getToken();
      if (!token) {
        setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${chatId}/close`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSuccess('Chat session đã được đóng thành công!');
      setCloseDialogOpen(false);

      // Update session status
      if (session) {
        setSession({ ...session, status: 'closed' });
      }

      // Redirect after a delay
      setTimeout(() => {
        router.push('/manager/chats');
      }, 2000);
    } catch (err) {
      console.error('Error closing chat session:', err);
      setError('Không thể đóng chat session. Vui lòng thử lại.');
    }
  };

  // Insert template
  const insertTemplate = (template: QuickTemplate) => {
    setInputMessage(prev => prev + (prev ? '\n' : '') + template.content);
    // Focus the input field
    const inputElement = inputRef.current?.querySelector('textarea');
    inputElement?.focus();
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch data on mount
  useEffect(() => {
    if (chatId) {
      fetchChatSession();
      fetchMessages();
    }
  }, [chatId, isAuthenticated, getToken]);

  // Handle key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'closed':
        return 'default';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'closed':
        return 'Đã đóng';
      case 'pending':
        return 'Chờ phản hồi';
      default:
        return status;
    }
  };

  if (!mounted) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">Bạn cần đăng nhập để truy cập trang này.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.push('/manager/chats')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Chat với {session?.userName || 'Khách hàng'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {chatId}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {session && (
            <Chip
              label={getStatusText(session.status)}
              color={getStatusColor(session.status) as any}
              size="small"
            />
          )}
          <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
            <SettingsIcon />
          </IconButton>
          {session?.status === 'active' && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => setCloseDialogOpen(true)}
              startIcon={<CloseIcon />}
            >
              Đóng chat
            </Button>
          )}
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Chat Window */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              backgroundColor: '#f8f9fa',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <CircularProgress />
              </Box>
            ) : !Array.isArray(messages) || messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Chưa có tin nhắn nào
                </Typography>
              </Box>
            ) : (
              messages.map(message => (
                <Box
                  key={message._id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'manager' ? 'flex-end' : 'flex-start',
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      maxWidth: '70%',
                      alignItems: message.sender === 'manager' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        backgroundColor: message.sender === 'manager' ? '#1976d2' : 'white',
                        color: message.sender === 'manager' ? 'white' : 'text.primary',
                        borderRadius: 2,
                        borderBottomLeftRadius: message.sender === 'manager' ? 2 : 0,
                        borderBottomRightRadius: message.sender === 'manager' ? 0 : 2,
                        boxShadow:
                          message.sender === 'manager'
                            ? '0 2px 8px rgba(25, 118, 210, 0.3)'
                            : '0 2px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: 'break-word',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {message.content}
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
                      {formatDate(message.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
            <Box ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                ref={inputRef}
                fullWidth
                multiline
                maxRows={4}
                placeholder="Nhập tin nhắn..."
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending || session?.status === 'closed'}
                inputProps={{ maxLength: 1000 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <IconButton
                onClick={sendMessage}
                disabled={!inputMessage.trim() || sending || session?.status === 'closed'}
                sx={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  minWidth: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                  '&:disabled': {
                    backgroundColor: '#e0e0e0',
                    color: '#9e9e9e',
                  },
                }}
              >
                {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {inputMessage.length}/1000 ký tự
            </Typography>
          </Box>
        </Box>

        {/* Sidebar */}
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          anchor="right"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{
            width: 300,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 300,
              boxSizing: 'border-box',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Công cụ
            </Typography>

            {/* Quick Templates */}
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <TemplateIcon fontSize="small" />
              Mẫu tin nhắn nhanh
            </Typography>
            <List dense>
              {quickTemplates.map(template => (
                <ListItem key={template.id} disablePadding>
                  <ListItemButton
                    onClick={() => insertTemplate(template)}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemText
                      primary={template.title}
                      secondary={template.content.substring(0, 50) + '...'}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Notes */}
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <NoteIcon fontSize="small" />
              Ghi chú nội bộ
            </Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="Ghi chú về cuộc trò chuyện này..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>
        </Drawer>
      </Box>

      {/* Close Dialog */}
      <Dialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)}>
        <DialogTitle>Xác nhận đóng chat</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn đóng chat session này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialogOpen(false)}>Hủy</Button>
          <Button onClick={closeChatSession} color="error" variant="contained">
            Đóng chat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatDetailPage;
