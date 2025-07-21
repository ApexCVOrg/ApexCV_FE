interface WebSocketMessage {
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
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private connectionHandlers: Map<string, () => void> = new Map();
  private unreadCountHandlers: Map<string, (count: number) => void> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No auth token found for WebSocket connection');
        return;
      }

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      this.ws = new WebSocket(`${wsUrl}?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.connectionHandlers.forEach(handler => handler());
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting to WebSocket... Attempt ${this.reconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(message: WebSocketMessage) {
    // Handle unread count updates
    if (message.type === 'unread_count' && message.unreadCount !== undefined) {
      this.unreadCountHandlers.forEach(handler => handler(message.unreadCount!));
      return;
    }

    // Handle chat-specific messages
    const handler = this.messageHandlers.get(message.chatId);
    if (handler) {
      handler(message);
    }
  }

  // Subscribe to chat messages
  subscribeToChat(chatId: string, handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.set(chatId, handler);
    
    // Send join message
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'join',
        chatId
      }));
    }
  }

  // Unsubscribe from chat messages
  unsubscribeFromChat(chatId: string) {
    this.messageHandlers.delete(chatId);
    
    // Send leave message
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'leave',
        chatId
      }));
    }
  }

  // Send message
  sendMessage(chatId: string, content: string, role: 'user' | 'manager', attachments?: any[], messageType?: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        chatId,
        content,
        role,
        timestamp: new Date(),
        attachments,
        messageType
      }));
    }
  }

  // Mark messages as read
  markAsRead(chatId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'read',
        chatId
      }));
    }
  }

  // Request unread count
  requestUnreadCount() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unread_count'
      }));
    }
  }

  // Subscribe to unread count updates
  onUnreadCountChange(handler: (count: number) => void) {
    const id = Date.now().toString();
    this.unreadCountHandlers.set(id, handler);
    return () => {
      this.unreadCountHandlers.delete(id);
    };
  }

  // Send typing indicator
  sendTyping(chatId: string, isTyping: boolean) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing',
        chatId,
        isTyping
      }));
    }
  }

  // Subscribe to connection events
  onConnectionChange(handler: () => void) {
    const id = Date.now().toString();
    this.connectionHandlers.set(id, handler);
    return () => {
      this.connectionHandlers.delete(id);
    };
  }

  // Check connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Disconnect
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService; 