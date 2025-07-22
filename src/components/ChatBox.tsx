'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Collapse,
  Button,
  Chip,
  CircularProgress,
  Fab,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  // Image as ImageIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import websocketService from '@/services/websocket';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  attachments?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }>;
  messageType?: 'text' | 'file' | 'image';
}

interface StoredMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  attachments?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }>;
  messageType?: 'text' | 'file' | 'image';
}

interface ChatSession {
  chatId: string;
  userId: string;
  status: 'active' | 'closed' | 'pending';
  unreadCount?: number;
  lastMessage?: string;
  lastMessageAt?: Date;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AI_CHAT_STORAGE_KEY = 'nidas_ai_chat_messages';
const SHOP_CHAT_STORAGE_KEY = 'nidas_shop_chat_session';

// Debug API URL
console.log('API_URL:', API_URL);

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
  const [managerJoined, setManagerJoined] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [recentlySentMessages, setRecentlySentMessages] = useState<Set<string>>(new Set()); // Track recently sent messages
  const [sessionEnded, setSessionEnded] = useState<boolean>(false); // Track if session is ended
  const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date()); // Track last activity
  const [autoEndTimer, setAutoEndTimer] = useState<NodeJS.Timeout | null>(null); // Auto end timer
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Load AI chat messages from localStorage
  const loadAIChatMessages = (): Message[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(AI_CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((msg: StoredMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
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

  // Save shop chat session to localStorage
  const saveShopChatSession = (session: { messages: Message[]; chatSession: ChatSession; ended: boolean }) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SHOP_CHAT_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving shop chat session:', error);
    }
  };

  // Load shop chat session from localStorage
  const loadShopChatSession = () => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(SHOP_CHAT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading shop chat session:', error);
    }
    return null;
  };

  // Create chat session for shop chat
  const createChatSession = async (): Promise<ChatSession | null> => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No authentication token found');
        return null;
      }

      const url = `${API_URL}/user/chats`;
      console.log('Creating chat session at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Create chat session response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create chat session:', response.status, errorText);
        return null;
      }

      const data = await response.json();
      console.log('Chat session created:', data);
      
      return {
        chatId: data.data.chatId,
        userId: String((currentUser as { id?: string })?.id || 'unknown'),
        status: 'active',
      };
    } catch (error) {
      console.error('Error creating chat session:', error);
      return null;
    }
  };

  // Upload files to server
  const uploadFiles = async (files: File[]): Promise<Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }>> => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_URL}/upload/chat-files`, {
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
      return data.data.files;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  };

  // Save shop message to database
  const saveShopMessageToDatabase = async (
    message: string,
    isUserMessage: boolean,
    attachments?: Array<{
      filename: string;
      originalName: string;
      mimetype: string;
      size: number;
      url: string;
    }>
  ) => {
    if (!currentChatSession) {
      console.log('No current chat session, skipping database save');
      return;
    }

    if (!currentChatSession.chatId) {
      console.error('Chat session has no chatId');
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const url = `${API_URL}/user/chats/${currentChatSession.chatId}/messages`;
      console.log('Sending message to:', url);
      console.log('Message data:', {
        content: message,
        role: isUserMessage ? 'user' : 'bot',
        isBotMessage: !isUserMessage,
        attachments,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: message,
          role: isUserMessage ? 'user' : 'bot', // Bot messages saved as bot role
          isBotMessage: !isUserMessage, // Flag to identify bot messages
          attachments,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save shop message to database:', response.status, errorText);
        
        // If it's a 404, try to recreate the chat session
        if (response.status === 404) {
          console.log('Chat session not found, attempting to recreate...');
          const newSession = await createChatSession();
          if (newSession) {
            setCurrentChatSession(newSession);
            console.log('Recreated chat session:', newSession);
          }
        }
      } else {
        console.log('Message saved successfully');
      }
    } catch (error) {
      console.error('Error saving shop message to database:', error);
    }
  };

  // Load shop chat messages from database
  const loadShopChatMessages = async (chatId: string) => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${API_URL}/user/chats/${chatId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to load shop chat messages');
        return;
      }

      const data = await response.json();
      const dbMessages = data.data || [];

      // Convert database messages to local format
      const convertedMessages: Message[] = dbMessages.map((msg: {
        _id: string;
        content: string;
        role: string;
        createdAt: string;
      }) => ({
        id: msg._id,
        text:
          msg.role === 'manager'
            ? `Manager: ${msg.content}`
            : msg.role === 'bot'
              ? `Bot: ${msg.content}`
              : msg.content,
        isUser: msg.role === 'user',
        timestamp: new Date(msg.createdAt),
      }));

      setMessages(prev => {
        // Loại bỏ các message đã có (dựa vào text + timestamp gần đúng)
        return [
          ...prev,
          ...convertedMessages.filter(
            m =>
              !prev.some(
                p =>
                  p.text === m.text &&
                  Math.abs(new Date(p.timestamp).getTime() - new Date(m.timestamp).getTime()) < 5000 // 5s
              )
          ),
        ];
      });
    } catch (error) {
      console.error('Error loading shop chat messages:', error);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (chatId: string) => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      await fetch(`${API_URL}/user/chats/${chatId}/read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Also mark as read via WebSocket
      websocketService.markAsRead(chatId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Get unread count
  const getUnreadCount = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${API_URL}/user/chats/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to get unread count');
        return;
      }

      const data = await response.json();
      setUnreadCount(data.data.unreadCount || 0);
    } catch (error) {
      console.error('Error getting unread count:', error);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestions, isOpen]);

  // Handle end session
  const handleEndSession = () => {
    if (chatType === 'shop') {
      setSessionEnded(true);
      setShopChatStarted(false);
      setShopChatTimer(0);
      setCurrentChatSession(null);
      setManagerJoined(false);

      // Add end session message
      const endMessage = 'Shop: Phiên chat đã kết thúc. Cảm ơn bạn đã liên hệ với NIDAS!';
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: endMessage,
          isUser: false,
          timestamp: new Date(),
        },
      ]);

      // Save end message to database
      if (currentChatSession) {
        saveShopMessageToDatabase(endMessage, false);
      }

      // Clear auto end timer
      if (autoEndTimer) {
        clearTimeout(autoEndTimer);
        setAutoEndTimer(null);
      }

      // Clear shop chat session from localStorage
      localStorage.removeItem(SHOP_CHAT_STORAGE_KEY);
    } else {
      // AI chat - clear messages and localStorage
      setMessages([]);
      localStorage.removeItem(AI_CHAT_STORAGE_KEY);
    }
  };

  // Auto end session after 5 minutes of inactivity
  useEffect(() => {
    if (isOpen && chatType === 'shop' && shopChatStarted && !sessionEnded) {
      // Clear existing timer
      if (autoEndTimer) {
        clearTimeout(autoEndTimer);
      }

      // Set new timer for 5 minutes
      const timer = setTimeout(
        () => {
          handleEndSession();
        },
        5 * 60 * 1000
      ); // 5 minutes

      setAutoEndTimer(timer);

      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [isOpen, chatType, shopChatStarted, sessionEnded, lastActivityTime]);

  // Update last activity time when user interacts
  const updateLastActivity = () => {
    if (chatType === 'shop' && shopChatStarted && !sessionEnded) {
      setLastActivityTime(new Date());
    }
  };

  // WebSocket connection and message handling
  useEffect(() => {
    const unsubscribeConnection = websocketService.onConnectionChange(() => {
      setIsConnected(true);
    });

    const unsubscribeUnreadCount = websocketService.onUnreadCountChange(count => {
      setUnreadCount(count);
    });

    // Get initial unread count
    getUnreadCount();

    return () => {
      unsubscribeConnection();
      unsubscribeUnreadCount();
    };
  }, []);

  // Fetch root suggestions when open
  useEffect(() => {
    if (isOpen) {
      if (chatType === 'ai') {
        // Load AI chat messages from localStorage
        const savedMessages = loadAIChatMessages();
        setMessages(savedMessages);
      } else {
        // Load shop chat session from localStorage
        const savedSession = loadShopChatSession();
        if (savedSession && !savedSession.ended) {
          setMessages(savedSession.messages || []);
          setShopChatStarted(true);
          setCurrentChatSession(savedSession.chatSession);
          setSessionEnded(false);
        } else {
          setMessages([]); // Reset shop chat
          setShopChatStarted(false);
          setSessionEnded(false);
        }
      }
      fetchSuggestions('');
      setCurrentPath('');
      setShopChatTimer(0);
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
            const notificationMessage =
              'Shop: Cảm ơn bạn đã chat với chúng tôi! Nhân viên sẽ liên hệ lại trong thời gian sớm nhất. Bạn có thể tiếp tục gửi tin nhắn nếu cần hỗ trợ thêm.';
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
      // Gọi API để lấy suggestions từ backend
      const res = await fetch(`${API_URL}/suggestions?path=${encodeURIComponent(path)}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else {
        // Fallback suggestions nếu API không trả về dữ liệu
        const fallbackSuggestions = [
          'Xin chào! Tôi cần hỗ trợ',
          'Tôi muốn mua sản phẩm',
          'Tôi có câu hỏi về đơn hàng',
          'Tôi muốn đổi trả sản phẩm',
          'Tôi cần tư vấn về size',
          'Tôi muốn biết thông tin khuyến mãi',
        ];
        setSuggestions(fallbackSuggestions);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      // Fallback suggestions khi có lỗi
      const fallbackSuggestions = [
        'Xin chào! Tôi cần hỗ trợ',
        'Tôi muốn mua sản phẩm',
        'Tôi có câu hỏi về đơn hàng',
        'Tôi muốn đổi trả sản phẩm',
        'Tôi cần tư vấn về size',
        'Tôi muốn biết thông tin khuyến mãi',
      ];
      setSuggestions(fallbackSuggestions);
    } finally {
      setLoading(false);
    }
  };

  // Send message to chat API
  const sendChatMessage = async (message: string) => {
    setChatLoading(true);
    try {
      // Gọi API để lấy phản hồi từ backend
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
          suggestions: data.data.suggestions || [],
        };
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (err) {
      console.error('Chat API Error:', err);
      return {
        reply: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        suggestions: [],
      };
    } finally {
      setChatLoading(false);
    }
  };

  // Send message to shop chat
  const sendShopMessage = async () => {
    setChatLoading(true);
    try {
      // Thực sự gửi tin nhắn đến manager thông qua WebSocket
      if (currentChatSession && websocketService.isConnected()) {
        // Gửi tin nhắn qua WebSocket để manager có thể nhận được
        websocketService.sendMessage(
          currentChatSession.chatId,
          messages[messages.length - 1]?.text || '',
          'user'
        );

        // Đợi một chút để manager có thể phản hồi
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Kiểm tra xem manager đã phản hồi chưa
        const managerResponse = await checkManagerStatus(currentChatSession.chatId);
        
        if (managerResponse) {
          return {
            reply: `Manager: ${managerResponse}`,
            suggestions: [],
          };
        } else {
          // Nếu manager chưa phản hồi, trả về thông báo chờ
          return {
            reply: 'Tin nhắn đã được gửi đến manager. Vui lòng chờ phản hồi.',
            suggestions: [],
          };
        }
      } else {
        // Fallback nếu WebSocket không kết nối
        const shopResponses = [
          'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
          'Xin chào! Nhân viên của chúng tôi sẽ hỗ trợ bạn ngay.',
          'Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ liên hệ lại.',
          'Xin chào! Bạn cần hỗ trợ gì ạ? Chúng tôi sẵn sàng giúp đỡ.',
          'Cảm ơn bạn đã quan tâm! Nhân viên sẽ phản hồi trong 5-10 phút.',
        ];

        const randomResponse = shopResponses[Math.floor(Math.random() * shopResponses.length)];

        return {
          reply: randomResponse,
          suggestions: [],
        };
      }
    } catch (err) {
      console.error('Shop Chat Error:', err);
      return {
        reply: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        suggestions: [],
      };
    } finally {
      setChatLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = async (s: string) => {
    // Update last activity for shop chat
    if (chatType === 'shop' && shopChatStarted && !sessionEnded) {
      updateLastActivity();
    }

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
    const response = chatType === 'ai' ? await sendChatMessage(s) : await sendShopMessage();

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

  // Handle send message (user typing)
  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && selectedFiles.length === 0) || chatLoading) return;

    // Check if shop chat is started
    if (chatType === 'shop' && !shopChatStarted) {
      return;
    }

    // Check if session is ended
    if (sessionEnded) {
      return;
    }

    // Update last activity for shop chat
    if (chatType === 'shop' && shopChatStarted && !sessionEnded) {
      updateLastActivity();
    }

    const messageContent = inputMessage.trim();
    let uploadedFiles: Array<{
      filename: string;
      originalName: string;
      mimetype: string;
      size: number;
      url: string;
    }> = [];

    // Upload files if any
    if (selectedFiles.length > 0) {
      try {
        setUploadingFiles(true);
        uploadedFiles = await uploadFiles(selectedFiles);
      } catch (error) {
        console.error('Failed to upload files:', error);
        return;
      } finally {
        setUploadingFiles(false);
      }
    }

    // Generate unique message ID
    const messageId = Date.now().toString();

    // Add user message to UI
    const userMessage: Message = {
      id: messageId,
      text:
        messageContent || (uploadedFiles.length > 0 ? `📎 ${uploadedFiles.length} file(s)` : ''),
      isUser: true,
      timestamp: new Date(),
      attachments: uploadedFiles,
      messageType:
        uploadedFiles.length > 0
          ? uploadedFiles.some(f => f.mimetype.startsWith('image/'))
            ? 'image'
            : 'file'
          : 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedFiles([]);

    // Add to recently sent messages to avoid duplicate
    setRecentlySentMessages(prev => new Set([...prev, messageId]));

    // Remove from recently sent messages after 5 seconds
    setTimeout(() => {
      setRecentlySentMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }, 5000);

    // Save shop chat session to localStorage
    if (chatType === 'shop' && currentChatSession) {
      saveShopChatSession({
        messages: [...messages, userMessage],
        chatSession: currentChatSession,
        ended: false,
      });
    }

    // Handle message based on chat type and manager status
    if (chatType === 'shop') {
      if (currentChatSession && currentChatSession.chatId) {
        // Always save to database first
        await saveShopMessageToDatabase(messageContent || '📎 File(s)', true, uploadedFiles);

        // Send via WebSocket for realtime chat if connected
        if (websocketService.isConnected()) {
          console.log('Sending WebSocket message:', {
            chatId: currentChatSession.chatId,
            content: messageContent || '📎 File(s)',
            role: 'user',
            attachments: uploadedFiles,
            messageType:
              uploadedFiles.length > 0
                ? uploadedFiles.some(f => f.mimetype.startsWith('image/'))
                  ? 'image'
                  : 'file'
                : 'text',
          });

          websocketService.sendMessage(
            currentChatSession.chatId,
            messageContent || '📎 File(s)',
            'user',
            uploadedFiles,
            uploadedFiles.length > 0
              ? uploadedFiles.some(f => f.mimetype.startsWith('image/'))
                ? 'image'
                : 'file'
              : 'text'
          );
        }

        // Generate bot response if manager hasn't joined
        if (!managerJoined) {
          setTimeout(() => {
            generateBotResponse();
          }, 1000);
        }
      } else {
        console.error('No valid chat session found for shop chat');
        // Try to create a new chat session
        const newSession = await createChatSession();
        if (newSession) {
          setCurrentChatSession(newSession);
          console.log('Created new chat session:', newSession);
        }
      }
    } else {
      // AI chat - save to localStorage
      const updatedMessages = [...messages, userMessage];
      saveAIChatMessages(updatedMessages);

      // Send to AI API
      const response = await sendChatMessage(messageContent);

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `AI: ${response.reply}`,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update suggestions
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      } else {
        setSuggestions([]);
      }
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
    setCurrentPath('');
    setShopChatStarted(false);
    setShopChatTimer(0);
    setCurrentChatSession(null);

    if (type === 'ai') {
      // Load AI chat messages from localStorage
      const savedMessages = loadAIChatMessages();
      setMessages(savedMessages);

      // Load initial suggestions for AI chat
      if (savedMessages.length === 0) {
        // Nếu chưa có tin nhắn, gọi API để lấy suggestions ban đầu
        fetchSuggestions('');
      } else {
        // Nếu đã có tin nhắn, gọi API với context của cuộc trò chuyện
        const lastMessage = savedMessages[savedMessages.length - 1];
        if (lastMessage && !lastMessage.isUser) {
          // Sử dụng nội dung tin nhắn cuối cùng làm context
          fetchSuggestions(lastMessage.text);
        } else {
          setSuggestions([]);
        }
      }
    } else {
      setMessages([]); // Reset shop chat
      setSuggestions([]); // Hide suggestions for shop chat
    }
  };

  // Handle start shop chat
  const handleStartShopChat = async () => {
    console.log('Starting shop chat...');
    setShopChatStarted(true);
    setShopChatTimer(0);

    try {
      // Create chat session
      console.log('Creating chat session...');
      const chatSession = await createChatSession();
      console.log('Created chat session:', chatSession);
      
      if (!chatSession) {
        console.error('Failed to create chat session');
        return;
      }

      if (!chatSession.chatId) {
        console.error('Chat session has no chatId');
        return;
      }

      setCurrentChatSession(chatSession);
      console.log('Set current chat session:', chatSession);

      // Add welcome message from shop
      const welcomeMessage =
        'Shop: Xin chào! Cảm ơn bạn đã liên hệ với NIDAS. Nhân viên của chúng tôi sẽ hỗ trợ bạn trong thời gian sớm nhất. Bạn có thể gửi tin nhắn ngay bây giờ!';
      
      const welcomeMessageObj = {
        id: Date.now().toString(),
        text: welcomeMessage,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages([welcomeMessageObj]);
      console.log('Set welcome message');

      // Save welcome message to database
      console.log('Saving welcome message to database...');
      await saveShopMessageToDatabase(welcomeMessage, false);

      // Save shop chat session to localStorage
      saveShopChatSession({
        messages: [welcomeMessageObj],
        chatSession: chatSession,
        ended: false,
      });

      console.log('Shop chat started successfully');
    } catch (error) {
      console.error('Error starting shop chat:', error);
    }
  };

  // Check if manager has joined the chat
  const checkManagerStatus = async (chatId: string) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/user/chats/${chatId}/join-status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setManagerJoined(data.data.isJoined);
        return data.data.isJoined ? 'Xin chào! Nhân viên của chúng tôi sẽ hỗ trợ bạn ngay.' : null;
      }
    } catch (error) {
      console.error('Error checking manager status:', error);
    }
    return null;
  };

  // Subscribe to chat when session changes
  useEffect(() => {
    if (currentChatSession) {
      console.log('Subscribing to chat:', currentChatSession.chatId);
      
      // Subscribe to WebSocket chat for all sessions
      websocketService.subscribeToChat(currentChatSession.chatId, (message: {
        type: 'message' | 'join' | 'leave' | 'typing' | 'read' | 'unread_count';
        chatId: string;
        userId?: string;
        managerId?: string;
        content?: string;
        role?: 'user' | 'manager';
        timestamp?: Date;
        isTyping?: boolean;
        unreadCount?: number;
        attachments?: Array<{
          filename: string;
          originalName: string;
          mimetype: string;
          size: number;
          url: string;
        }>;
        messageType?: 'text' | 'file' | 'image';
      }) => {
        console.log('Received WebSocket message:', message);
        
        if (message.type === 'message' && message.content) {
          console.log('Processing message:', {
            content: message.content,
            role: message.role,
            timestamp: message.timestamp
          });
          
          // Check if message already exists to avoid duplicates
          setMessages(prev => {
            // Check if this is a message we just sent by checking recently sent messages
            const isOwnMessage =
              message.role === 'user' &&
              prev.some(msg => {
                if (!msg.isUser) return false;

                // Check if this message ID is in recently sent messages
                if (recentlySentMessages.has(msg.id)) {
                  return true;
                }

                // Fallback: Check timestamp and content/attachments
                const timeDiff = Math.abs(
                  new Date(msg.timestamp).getTime() -
                    new Date(message.timestamp || Date.now()).getTime()
                );
                if (timeDiff > 3000) return false;

                // For file messages, check attachments
                if (message.attachments && message.attachments.length > 0) {
                  if (!msg.attachments || msg.attachments.length !== message.attachments.length)
                    return false;

                  // Compare attachment URLs
                  return msg.attachments.every((att, index) => {
                    const newAtt = message.attachments?.[index];
                    return newAtt && att.url === newAtt.url;
                  });
                }

                // For text messages, check content
                return msg.text === message.content;
              });

            if (isOwnMessage) {
              console.log('Own message detected, skipping');
              return prev; // Don't add our own message back
            }

            const messageExists = prev.some(msg => {
              // Check timestamp first
              const timeMatch =
                Math.abs(
                  new Date(msg.timestamp).getTime() -
                    new Date(message.timestamp || Date.now()).getTime()
                ) < 3000;
              if (!timeMatch) return false;

              // For messages with attachments, check attachments first
              if (message.attachments && message.attachments.length > 0) {
                if (!msg.attachments || msg.attachments.length !== message.attachments.length) {
                  return false;
                }

                // Compare attachment URLs
                const attachmentMatch = msg.attachments.every((att, index) => {
                  const newAtt = message.attachments?.[index];
                  return newAtt && att.url === newAtt.url;
                });

                if (!attachmentMatch) return false;

                // For file messages, content might be different, so we rely on attachments
                return true;
              }

              // For text messages, check content
              const contentMatch =
                msg.text ===
                (message.role === 'manager' ? `Shop: ${message.content}` : message.content);
              return contentMatch;
            });

            if (messageExists) {
              console.log('Duplicate message detected, skipping');
              return prev; // Don't add duplicate
            }

            console.log('Adding new message to chat');
            const newMessage: Message = {
              id: Date.now().toString(),
              text:
                message.role === 'manager'
                  ? `Shop: ${message.content ?? ''}`
                  : (message.content ?? ''),
              isUser: message.role === 'user',
              timestamp: new Date(message.timestamp ?? Date.now()),
              attachments: message.attachments,
              messageType: message.messageType,
            };

            const updatedMessages = [...prev, newMessage];

            // Save shop chat session to localStorage
            if (chatType === 'shop' && currentChatSession) {
              saveShopChatSession({
                messages: updatedMessages,
                chatSession: currentChatSession,
                ended: false,
              });
            }

            return updatedMessages;
          });

          // Mark messages as read when receiving new messages
          markMessagesAsRead(currentChatSession.chatId);

          // Update last activity when receiving messages
          updateLastActivity();

          // If manager sends a message, mark as joined
          if (message.role === 'manager') {
            console.log('Manager message received, setting managerJoined to true');
            setManagerJoined(true);
          }
        }
      });

      // Mark messages as read when joining chat
      markMessagesAsRead(currentChatSession.chatId);

      return () => {
        console.log('Unsubscribing from chat:', currentChatSession.chatId);
        websocketService.unsubscribeFromChat(currentChatSession.chatId);
      };
    }
  }, [currentChatSession]);

  // Load shop chat messages when session is created
  useEffect(() => {
    if (currentChatSession && chatType === 'shop') {
      loadShopChatMessages(currentChatSession.chatId);
    }
  }, [currentChatSession, chatType]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && currentChatSession && chatType === 'shop') {
      markMessagesAsRead(currentChatSession.chatId);
    }
  }, [isOpen, currentChatSession, chatType]);

  // Check manager status when chat session changes
  useEffect(() => {
    if (currentChatSession) {
      checkManagerStatus(currentChatSession.chatId);
    }
  }, [currentChatSession]);

  // Bot response logic
  const generateBotResponse = async () => {
    if (managerJoined) {
      // Manager has joined, don't send bot response
      return;
    }

    const botResponses = [
      'Xin chào! Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ sớm phản hồi.',
      'Cảm ơn bạn đã gửi tin nhắn. Nhân viên hỗ trợ sẽ liên hệ với bạn sớm nhất.',
      'Xin chào! Nhân viên của chúng tôi sẽ hỗ trợ bạn ngay khi có thể.',
      'Cảm ơn bạn đã liên hệ! Chúng tôi đang xử lý yêu cầu của bạn.',
      'Xin chào! Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi sớm.',
    ];

    const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

    // Add bot message to UI
    const botMessage: Message = {
      id: Date.now().toString(),
      text: `Bot: ${randomResponse}`,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);

    // Save bot message to database
    await saveShopMessageToDatabase(randomResponse, false);
  };

  // Only show ChatBox for users with role 'user'
  if (!isAuthenticated || userRole !== 'user') {
    return null;
  }

  return (
    <Box
      suppressHydrationWarning
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
          suppressHydrationWarning
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
            suppressHydrationWarning
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
                    ⏱️ {Math.floor(shopChatTimer / 60)}:
                    {(shopChatTimer % 60).toString().padStart(2, '0')}
                  </Typography>
                </Box>
              )}
              {managerJoined && (
                <Chip label="Shop đã tham gia" color="success" size="small" sx={{ ml: 1 }} />
              )}
              {isConnected && managerJoined && (
                <Chip label="Realtime" color="primary" size="small" sx={{ ml: 1 }} />
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
                  onClick={() => {
                    handleChatTypeChange('ai');
                    // Update last activity when changing chat type
                    updateLastActivity();
                  }}
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
                  onClick={() => {
                    handleChatTypeChange('shop');
                    // Update last activity when changing chat type
                    updateLastActivity();
                  }}
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

              {/* End Session Button - only show when chat is active */}
              {((chatType === 'shop' && shopChatStarted && !sessionEnded) ||
                (chatType === 'ai' && messages.length > 0)) && (
                <Tooltip title="Kết thúc phiên chat">
                  <IconButton
                    size="small"
                    onClick={() => {
                      handleEndSession();
                      // Update last activity when ending session
                      updateLastActivity();
                    }}
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(255, 0, 0, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 0, 0, 0.3)',
                      },
                    }}
                  >
                    <StopIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <IconButton
                size="small"
                onClick={() => {
                  setIsOpen(false);
                  // Update last activity when closing chat
                  updateLastActivity();
                }}
                sx={{ color: 'white' }}
              >
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
            onScroll={() => {
              // Update last activity when scrolling
              updateLastActivity();
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
                    background:
                      chatType === 'ai'
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
                    : 'Chào mừng bạn đến với NIDAS! Nhân viên của chúng tôi sẽ hỗ trợ bạn trong thời gian sớm nhất.'}
                </Typography>
                {chatType === 'shop' && !shopChatStarted && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => {
                      handleStartShopChat();
                      // Update last activity when starting shop chat
                      updateLastActivity();
                    }}
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
            {messages.map(msg => (
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
                      backgroundColor: msg.isUser
                        ? '#1976d2'
                        : msg.text.startsWith('Bot:')
                          ? '#4caf50'
                          : 'white',
                      color: msg.isUser
                        ? 'white'
                        : msg.text.startsWith('Bot:')
                          ? 'white'
                          : 'text.primary',
                      borderRadius: 2,
                      borderBottomLeftRadius: msg.isUser ? 2 : 0,
                      borderBottomRightRadius: msg.isUser ? 0 : 2,
                      boxShadow: msg.isUser
                        ? '0 2px 8px rgba(25, 118, 210, 0.3)'
                        : msg.text.startsWith('Bot:')
                          ? '0 2px 8px rgba(76, 175, 80, 0.3)'
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
                                  color: msg.isUser ? 'white' : 'primary.main',
                                  borderColor: msg.isUser ? 'white' : 'primary.main',
                                  '&:hover': {
                                    backgroundColor: msg.isUser
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
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      opacity: 0.7,
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
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
            <Box ref={messagesEndRef} />
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
                        onClick={() => {
                          handleSuggestionClick(s);
                          // Update last activity when clicking suggestion
                          updateLastActivity();
                        }}
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

          {/* Selected Files Display */}
          {selectedFiles.length > 0 && (
            <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)', bgcolor: '#f5f5f5' }}>
              <Typography
                variant="caption"
                sx={{ mb: 1, display: 'block', color: 'text.secondary' }}
              >
                📎 Files selected ({selectedFiles.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => removeSelectedFile(index)}
                    size="small"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
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
                onChange={e => {
                  setInputMessage(e.target.value);
                  // Update last activity for shop chat when typing
                  if (chatType === 'shop' && shopChatStarted && !sessionEnded) {
                    updateLastActivity();
                  }
                }}
                onKeyPress={handleKeyPress}
                disabled={
                  chatLoading || uploadingFiles || (chatType === 'shop' && !shopChatStarted)
                }
                multiline
                maxRows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />

              {/* File Upload Button */}
              <Tooltip title="Gửi file/ảnh">
                <IconButton
                  onClick={() => {
                    fileInputRef.current?.click();
                    // Update last activity for shop chat
                    if (chatType === 'shop' && shopChatStarted && !sessionEnded) {
                      updateLastActivity();
                    }
                  }}
                  disabled={
                    chatLoading || uploadingFiles || (chatType === 'shop' && !shopChatStarted)
                  }
                  sx={{
                    backgroundColor: '#4caf50',
                    color: 'white',
                    minWidth: 40,
                    height: 40,
                    '&:hover': {
                      backgroundColor: '#388e3c',
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
                  <AttachFileIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* Send Button */}
              <IconButton
                onClick={() => {
                  handleSendMessage();
                  // Update last activity for shop chat
                  if (chatType === 'shop' && shopChatStarted && !sessionEnded) {
                    updateLastActivity();
                  }
                }}
                disabled={
                  (!inputMessage.trim() && selectedFiles.length === 0) ||
                  chatLoading ||
                  uploadingFiles ||
                  (chatType === 'shop' && !shopChatStarted)
                }
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
                {uploadingFiles ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendIcon fontSize="small" />
                )}
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
        </Paper>
      </Collapse>

      {/* Chat Button */}
      <Badge
        badgeContent={unreadCount > 0 ? unreadCount : undefined}
        color="error"
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.75rem',
            minWidth: '20px',
            height: '20px',
          },
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
        }}
      >
        <Fab
          color="primary"
          onClick={() => {
            setIsOpen(v => !v);
            // Update last activity when opening/closing chat
            updateLastActivity();
          }}
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
      </Badge>
    </Box>
  );
};

export default ChatBox;
