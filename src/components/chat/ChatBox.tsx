"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Fab,
  Collapse,
} from '@mui/material';
import {
  Send as SendIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
} from '@mui/icons-material';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBoxProps {
  userId?: string; // truyền từ ngoài vào, không fix cứng
  apiUrl?: string; // endpoint BE, mặc định lấy từ env
}

const ChatBox: React.FC<ChatBoxProps> = ({
  userId,
  apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/chat`,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi có thể giúp gì cho bạn?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gửi tin nhắn và fetch từ BE
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !userId) return; // phải có userId mới gửi
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text, userId }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      const { success, data } = await response.json();
      let botText = '';
      if (success && Array.isArray(data?.docs) && data.docs.length > 0) {
        botText = data.docs.map(
          (doc: { id: string; title: string; snippet: string; score?: number }) =>
            `• ${doc.title}: ${doc.snippet}${doc.score !== undefined ? ` (score: ${doc.score})` : ''}`
        ).join('\n\n');
      } else if (data?.reply) {
        botText = data.reply;
      } else {
        botText = 'Xin lỗi, mình chưa tìm thấy thông tin phù hợp.';
      }
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
      {/* Chat Window */}
      <Collapse in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            width: 350,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            mb: 2,
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid rgba(0, 0, 0, 0.1)',
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
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <ChatIcon fontSize="small" />
              </Avatar>
              <Typography variant="subtitle1" fontWeight={600}>
                Trợ lý ảo
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={toggleMinimize}
                sx={{ color: 'white' }}
              >
                <MinimizeIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={toggleChat}
                sx={{ color: 'white' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Messages */}
          <Collapse in={!isMinimized}>
            <Box
              tabIndex={0}
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
                outline: 'none',
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
                '&:focus': {
                  boxShadow: '0 0 0 2px #1976d2',
                },
              }}
              onClick={e => {
                (e.currentTarget as HTMLDivElement).focus();
              }}
            >
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '80%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: message.isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        backgroundColor: message.isUser ? '#1976d2' : 'white',
                        color: message.isUser ? 'white' : 'text.primary',
                        borderRadius: 2,
                        borderTopLeftRadius: message.isUser ? 2 : 0,
                        borderTopRightRadius: message.isUser ? 0 : 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {message.text}
                      </Typography>
                    </Paper>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, fontSize: '0.7rem' }}
                    >
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                  <Box sx={{ maxWidth: '80%' }}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        backgroundColor: 'white',
                        borderRadius: 2,
                        borderTopRightRadius: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Đang nhập...
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                backgroundColor: 'white',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  ref={inputRef}
                  fullWidth
                  size="small"
                  placeholder="Nhập tin nhắn..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  sx={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                    '&:disabled': {
                      backgroundColor: '#e0e0e0',
                      color: '#9e9e9e',
                    },
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Collapse>
        </Paper>
      </Collapse>

      {/* Chat Button */}
      <Fab
        color="primary"
        onClick={toggleChat}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          },
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </Box>
  );
};

export default ChatBox; 