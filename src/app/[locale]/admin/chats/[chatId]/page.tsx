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
  Chat as ChatIcon,
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

      // Get user role to determine correct endpoint
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      console.log('👤 User data:', user);
      console.log('🏷️ User role:', user?.role);
      
      // Handle demo chat sessions for admin users
      if (user?.role === 'admin' && typeof chatId === 'string' && chatId.startsWith('admin-demo-')) {
        console.log('📝 Loading demo chat session for admin user...');
        const mockSession: ChatSession = {
          _id: 'mock-session-1',
          chatId: chatId,
          userId: 'demo-user-001',
          userName: chatId === 'admin-demo-001' ? 'Nguyễn Văn A' : 
                   chatId === 'admin-demo-002' ? 'Trần Thị B' : 'Lê Minh C',
          status: chatId === 'admin-demo-002' ? 'closed' : 
                  chatId === 'admin-demo-003' ? 'pending' : 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSession(mockSession);
        return;
      }
      
      const endpoint = user?.role === 'admin' ? 'admin' : 'manager';
      let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/chats/${chatId}`;
      
      // Try admin endpoint first, fallback to manager if needed
      let response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // If admin endpoint doesn't exist, try manager endpoint
      if (response.status === 404 && endpoint === 'admin') {
        console.log('🔄 Admin endpoint not found, trying manager endpoint...');
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${chatId}`;
        response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Handle 403 for admin users
      if (response.status === 403 && user?.role === 'admin') {
        console.log('🔒 Admin user cannot access manager endpoint, redirecting to chat list...');
        setError('Admin không có quyền truy cập chi tiết chat này. Quay lại danh sách chat.');
        setTimeout(() => {
          router.push('/admin/chats');
        }, 3000);
        return;
      }

      if (response.status === 404) {
        setError('Chat session không tồn tại hoặc đã bị xóa.');
        // Redirect back to chat sessions list after a delay
        setTimeout(() => {
          router.push('/admin/chats');
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

      // Get user role to determine correct endpoint
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      // Handle demo chat sessions for admin users
      if (user?.role === 'admin' && typeof chatId === 'string' && chatId.startsWith('admin-demo-')) {
        console.log('📝 Loading demo messages for admin user...');
        const mockMessages: Message[] = [
          {
            _id: 'msg-1',
            content: chatId === 'admin-demo-001' ? 'Xin chào! Tôi cần hỗ trợ về sản phẩm giày thể thao.' :
                     chatId === 'admin-demo-002' ? 'Xin chào! Sản phẩm có size nào?' : 
                     'Xin chào! Tôi muốn đổi size áo.',
            sender: 'user',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            senderName: chatId === 'admin-demo-001' ? 'Nguyễn Văn A' : 
                        chatId === 'admin-demo-002' ? 'Trần Thị B' : 'Lê Minh C',
          },
          {
            _id: 'msg-2',
            content: 'Xin chào! Cảm ơn bạn đã liên hệ. Tôi sẽ hỗ trợ bạn ngay.',
            sender: 'manager',
            timestamp: new Date(Date.now() - 240000).toISOString(),
            senderName: 'Admin Support',
          },
          {
            _id: 'msg-3',
            content: chatId === 'admin-demo-001' ? 'Tôi muốn tìm giày chạy bộ size 42.' :
                     chatId === 'admin-demo-002' ? 'Cảm ơn bạn đã hỗ trợ! Sản phẩm rất tốt.' :
                     'Cụ thể là tôi đã mua áo size M nhưng hơi rộng.',
            sender: 'user',
            timestamp: new Date(Date.now() - 180000).toISOString(),
            senderName: chatId === 'admin-demo-001' ? 'Nguyễn Văn A' : 
                        chatId === 'admin-demo-002' ? 'Trần Thị B' : 'Lê Minh C',
          }
        ];
        
        setMessages(mockMessages);
        setLoading(false);
        return;
      }
      
      const endpoint = user?.role === 'admin' ? 'admin' : 'manager';
      
      let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/chats/${chatId}/messages`;
      
      // Try admin endpoint first, fallback to manager if needed
      let response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // If admin endpoint doesn't exist, try manager endpoint
      if (response.status === 404 && endpoint === 'admin') {
        console.log('🔄 Admin endpoint not found, trying manager endpoint...');
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${chatId}/messages`;
        response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Handle 403 for admin users
      if (response.status === 403 && user?.role === 'admin') {
        console.log('🔒 Admin user cannot access manager messages');
        setMessages([]);
        setLoading(false);
        return;
      }

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

      // Get user role to determine correct endpoint
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      // Handle demo chat sessions for admin users
      if (user?.role === 'admin' && typeof chatId === 'string' && chatId.startsWith('admin-demo-')) {
        console.log('📝 Simulating message send for admin demo chat...');
        const mockMessage: Message = {
          _id: `msg-${Date.now()}`,
          content: messageContent,
          sender: 'manager',
          timestamp: new Date().toISOString(),
          senderName: 'Admin Support',
        };
        
        setMessages(prev => [...prev, mockMessage]);
        setSuccess('Tin nhắn demo đã được gửi!');
        setSending(false);
        return;
      }
      
      const endpoint = user?.role === 'admin' ? 'admin' : 'manager';
      
      let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/chats/${chatId}/messages`;
      
      // Try admin endpoint first, fallback to manager if needed
      let response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: messageContent }),
      });

      // If admin endpoint doesn't exist, try manager endpoint
      if (response.status === 404 && endpoint === 'admin') {
        console.log('🔄 Admin endpoint not found, trying manager endpoint...');
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${chatId}/messages`;
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: messageContent }),
        });
      }

      // Handle 403 for admin users
      if (response.status === 403 && user?.role === 'admin') {
        console.log('🔒 Admin user cannot send messages via manager endpoint');
        setError('Admin không có quyền gửi tin nhắn trong chat này.');
        setInputMessage(messageContent);
        setSending(false);
        return;
      }

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

      // Get user role to determine correct endpoint
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      // Handle demo chat sessions for admin users
      if (user?.role === 'admin' && typeof chatId === 'string' && chatId.startsWith('admin-demo-')) {
        console.log('📝 Simulating chat close for admin demo chat...');
        setSuccess('Demo chat session đã được đóng!');
        setCloseDialogOpen(false);

        // Update session status
        if (session) {
          setSession({ ...session, status: 'closed' });
        }

        // Redirect after a delay
        setTimeout(() => {
          router.push('/admin/chats');
        }, 2000);
        return;
      }
      
      const endpoint = user?.role === 'admin' ? 'admin' : 'manager';
      
      let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/chats/${chatId}/close`;
      
      // Try admin endpoint first, fallback to manager if needed
      let response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // If admin endpoint doesn't exist, try manager endpoint
      if (response.status === 404 && endpoint === 'admin') {
        console.log('🔄 Admin endpoint not found, trying manager endpoint...');
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/manager/chats/${chatId}/close`;
        response = await fetch(apiUrl, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Handle 403 for admin users
      if (response.status === 403 && user?.role === 'admin') {
        console.log('🔒 Admin user cannot close chat via manager endpoint');
        setError('Admin không có quyền đóng chat này.');
        return;
      }

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
        router.push('/admin/chats');
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
  }, [chatId, isAuthenticated, getToken, fetchChatSession, fetchMessages]);

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
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(17, 17, 27, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
          : 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
          backdropFilter: 'blur(10px)',
          border: (theme) => theme.palette.mode === 'dark'
            ? '1px solid rgba(25, 118, 210, 0.3)'
            : '1px solid rgba(25, 118, 210, 0.2)',
          borderRadius: 0,
          boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => router.push('/admin/chats')}
            sx={{
              backgroundColor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(25, 118, 210, 0.1)'
                : 'rgba(25, 118, 210, 0.05)',
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography 
              variant="h6" 
              fontWeight={700}
              sx={{
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #90caf9 30%, #42a5f5 90%)'
                  : 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Chat với {session?.userName || 'Khách hàng'}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }}
            >
              ID: {chatId}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {session && (
            <Chip
              label={getStatusText(session.status)}
              color={getStatusColor(session.status) as 'success' | 'default' | 'warning'}
              size="small"
              sx={{
                fontWeight: 600,
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }}
            />
          )}
          <IconButton 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{
              backgroundColor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(25, 118, 210, 0.1)'
                : 'rgba(25, 118, 210, 0.05)',
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <SettingsIcon />
          </IconButton>
          {session?.status === 'active' && (
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => setCloseDialogOpen(true)}
              startIcon={<CloseIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                py: 1,
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
                boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #d32f2f 30%, #c62828 90%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 10px 4px rgba(244, 67, 54, .3)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
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
              p: 3,
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(20, 20, 30, 0.9) 0%, rgba(10, 10, 20, 0.9) 100%)'
                : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(240, 242, 247, 0.9) 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              '&::-webkit-scrollbar': {
                width: 8,
              },
              '&::-webkit-scrollbar-track': {
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.1)',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'primary.main',
                borderRadius: 4,
                '&:hover': {
                  background: 'primary.dark',
                },
              },
            }}
          >
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }
                }}
              >
                {error}
              </Alert>
            )}

            {/* Admin Demo Notice */}
            {mounted && (() => {
              const userStr = localStorage.getItem('user');
              const user = userStr ? JSON.parse(userStr) : null;
              return user?.role === 'admin' && typeof chatId === 'string' && chatId.startsWith('admin-demo-');
            })() && (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }
                }}
              >
                🚀 <strong>Admin Demo Mode:</strong> Đây là chat demo. Tin nhắn và thao tác chỉ mang tính chất mô phỏng.
              </Alert>
            )}

            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <CircularProgress />
                <Typography 
                  variant="body2"
                  sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}
                >
                  Đang tải tin nhắn...
                </Typography>
              </Box>
            ) : !Array.isArray(messages) || messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <ChatIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    fontWeight: 600
                  }}
                >
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
                      maxWidth: '75%',
                      alignItems: message.sender === 'manager' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        backgroundColor: message.sender === 'manager' 
                          ? (theme) => theme.palette.mode === 'dark'
                            ? 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)'
                            : 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)'
                          : (theme) => theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
                        color: message.sender === 'manager' ? 'white' : 'text.primary',
                        borderRadius: 3,
                        borderBottomLeftRadius: message.sender === 'manager' ? 3 : 6,
                        borderBottomRightRadius: message.sender === 'manager' ? 6 : 3,
                        backdropFilter: 'blur(10px)',
                        border: message.sender === 'manager' 
                          ? 'none'
                          : (theme) => theme.palette.mode === 'dark'
                            ? '1px solid rgba(25, 118, 210, 0.3)'
                            : '1px solid rgba(25, 118, 210, 0.2)',
                        boxShadow: message.sender === 'manager'
                          ? '0 8px 32px rgba(25, 118, 210, 0.3)'
                          : '0 4px 16px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          wordBreak: 'break-word',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        }}
                      >
                        {message.content}
                      </Typography>
                    </Paper>
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 1,
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        opacity: 0.8,
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
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
              p: 3,
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
              backdropFilter: 'blur(10px)',
              borderTop: (theme) => theme.palette.mode === 'dark'
                ? '1px solid rgba(25, 118, 210, 0.3)'
                : '1px solid rgba(25, 118, 210, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
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
                    borderRadius: 3,
                    background: (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: (theme) => theme.palette.mode === 'dark'
                      ? '1px solid rgba(25, 118, 210, 0.3)'
                      : '1px solid rgba(25, 118, 210, 0.2)',
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                  },
                }}
              />
              <IconButton
                onClick={sendMessage}
                disabled={!inputMessage.trim() || sending || session?.status === 'closed'}
                sx={{
                  minWidth: 48,
                  height: 48,
                  borderRadius: 3,
                  background: 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)',
                  color: 'white',
                  boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #0d47a1 90%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 10px 4px rgba(25, 118, 210, .3)',
                  },
                  '&:disabled': {
                    backgroundColor: '#e0e0e0',
                    color: '#9e9e9e',
                    transform: 'none',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              </IconButton>
            </Box>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                mt: 1, 
                display: 'block',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }}
            >
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
            width: 350,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 350,
              boxSizing: 'border-box',
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
              backdropFilter: 'blur(10px)',
              border: (theme) => theme.palette.mode === 'dark'
                ? '1px solid rgba(25, 118, 210, 0.3)'
                : '1px solid rgba(25, 118, 210, 0.2)',
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                fontWeight: 700,
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #90caf9 30%, #42a5f5 90%)'
                  : 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Công cụ
            </Typography>

            {/* Quick Templates */}
            <Typography
              variant="subtitle1"
              sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 600,
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }}
            >
              <TemplateIcon fontSize="small" />
              Mẫu tin nhắn nhanh
            </Typography>
            <List dense>
              {quickTemplates.map(template => (
                <ListItem key={template.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => insertTemplate(template)}
                    sx={{ 
                      borderRadius: 2, 
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(25, 118, 210, 0.3)'
                        : '1px solid rgba(25, 118, 210, 0.2)',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(25, 118, 210, 0.1)'
                          : 'rgba(25, 118, 210, 0.05)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ListItemText
                      primary={template.title}
                      secondary={template.content.substring(0, 50) + '...'}
                      primaryTypographyProps={{ 
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                      secondaryTypographyProps={{ 
                        fontSize: '0.75rem',
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 3 }} />

            {/* Notes */}
            <Typography
              variant="subtitle1"
              sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 600,
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }}
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
                  borderRadius: 2,
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: (theme) => theme.palette.mode === 'dark'
                    ? '1px solid rgba(25, 118, 210, 0.3)'
                    : '1px solid rgba(25, 118, 210, 0.2)',
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                },
              }}
            />
          </Box>
        </Drawer>
      </Box>

      {/* Close Dialog - keeping existing styling */}
      <Dialog 
        open={closeDialogOpen} 
        onClose={() => setCloseDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(244, 67, 54, 0.3)'
              : '1px solid rgba(244, 67, 54, 0.2)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(244, 67, 54, 0.3)',
          }
        }}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }
          }
        }}
      >
        <DialogTitle sx={{
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(60, 30, 30, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
          borderBottom: (theme) => theme.palette.mode === 'dark'
            ? '1px solid rgba(244, 67, 54, 0.3)'
            : '1px solid rgba(244, 67, 54, 0.2)',
          py: 3,
          px: 4,
        }}>
          <Typography variant="h6" sx={{
            fontWeight: 700,
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
            color: 'text.primary'
          }}>
            Xác nhận đóng chat
          </Typography>
        </DialogTitle>
        <DialogContent sx={{
          p: 4,
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(35, 20, 20, 0.8) 0%, rgba(30, 15, 15, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(255, 252, 252, 0.8) 0%, rgba(252, 245, 245, 0.8) 100%)',
        }}>
          <Typography sx={{
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
          }}>
            Bạn có chắc chắn muốn đóng chat session này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(60, 30, 30, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
          borderTop: (theme) => theme.palette.mode === 'dark'
            ? '1px solid rgba(244, 67, 54, 0.3)'
            : '1px solid rgba(244, 67, 54, 0.2)',
          px: 4,
          py: 3,
          gap: 2,
        }}>
          <Button 
            onClick={() => setCloseDialogOpen(false)}
            variant="outlined"
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              '&:hover': {
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={closeChatSession} 
            variant="contained"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
              boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #c62828 90%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 10px 4px rgba(244, 67, 54, .3)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
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
