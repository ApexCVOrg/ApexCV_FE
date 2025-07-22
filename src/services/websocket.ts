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

interface WebSocketServiceInterface {
  connect(): void;
  disconnect(): void;
  isConnected(): boolean;
  sendMessage(
    chatId: string,
    content: string,
    role: 'user' | 'manager',
    attachments?: Array<{
      filename: string;
      originalName: string;
      mimetype: string;
      size: number;
      url: string;
    }>,
    messageType?: string
  ): void;
  markAsRead(chatId: string): void;
  requestUnreadCount(): void;
  subscribeToChat(chatId: string, handler: (message: WebSocketMessage) => void): () => void;
  unsubscribeFromChat(chatId: string): void;
  onUnreadCountChange(handler: (count: number) => void): () => void;
  sendTyping(chatId: string, isTyping: boolean): void;
  onConnectionChange(handler: () => void): () => void;
}

class WebSocketService implements WebSocketServiceInterface {
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

  connect() {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        console.warn('localStorage not available (SSR environment)');
        return;
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No auth token found for WebSocket connection');
        return;
      }

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://nidas-be.onrender.com';
      this.ws = new WebSocket(`${wsUrl}?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.connectionHandlers.forEach(handler => handler());
      };

      this.ws.onmessage = event => {
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

      this.ws.onerror = error => {
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
    console.log('WebSocket received message:', message);
    
    // Handle unread count updates
    if (message.type === 'unread_count' && message.unreadCount !== undefined) {
      console.log('Handling unread count update:', message.unreadCount);
      this.unreadCountHandlers.forEach(handler => handler(message.unreadCount!));
      return;
    }

    // Handle chat-specific messages
    const handler = this.messageHandlers.get(message.chatId);
    if (handler) {
      console.log('Found handler for chatId:', message.chatId);
      handler(message);
    } else {
      console.log('No handler found for chatId:', message.chatId);
      console.log('Available handlers for:', Array.from(this.messageHandlers.keys()));
    }
  }

  // Subscribe to chat messages
  subscribeToChat(chatId: string, handler: (message: WebSocketMessage) => void): () => void {
    this.messageHandlers.set(chatId, handler);

    // Send join message
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'join',
          chatId,
        })
      );
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribeFromChat(chatId);
    };
  }

  // Unsubscribe from chat messages
  unsubscribeFromChat(chatId: string) {
    this.messageHandlers.delete(chatId);

    // Send leave message
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'leave',
          chatId,
        })
      );
    }
  }

  sendMessage(
    chatId: string,
    content: string,
    role: 'user' | 'manager',
    attachments?: Array<{
      filename: string;
      originalName: string;
      mimetype: string;
      size: number;
      url: string;
    }>,
    messageType?: string
  ) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'message',
          chatId,
          content,
          role,
          timestamp: new Date(),
          attachments,
          messageType,
        })
      );
    }
  }

  // Mark messages as read
  markAsRead(chatId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'read',
          chatId,
        })
      );
    }
  }

  // Request unread count
  requestUnreadCount() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'unread_count',
        })
      );
    }
  }

  // Subscribe to unread count updates
  onUnreadCountChange(handler: (count: number) => void): () => void {
    const id = Date.now().toString();
    this.unreadCountHandlers.set(id, handler);
    return () => {
      this.unreadCountHandlers.delete(id);
    };
  }

  // Send typing indicator
  sendTyping(chatId: string, isTyping: boolean) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'typing',
          chatId,
          isTyping,
        })
      );
    }
  }

  // Subscribe to connection events
  onConnectionChange(handler: () => void): () => void {
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

  public getWebSocket() {
    return this.ws;
  }
}

// Create singleton instance with lazy initialization
let websocketServiceInstance: WebSocketServiceInterface | null = null;

const getWebSocketService = (): WebSocketServiceInterface => {
  if (typeof window === 'undefined') {
    // Return a mock service for SSR
    return {
      connect: () => {},
      disconnect: () => {},
      isConnected: () => false,
      sendMessage: () => {},
      markAsRead: () => {},
      requestUnreadCount: () => {},
      subscribeToChat: () => () => {},
      unsubscribeFromChat: () => {},
      onUnreadCountChange: () => () => {},
      sendTyping: () => {},
      onConnectionChange: () => () => {},
    };
  }

  if (!websocketServiceInstance) {
    websocketServiceInstance = new WebSocketService();
  }
  return websocketServiceInstance;
};

export default getWebSocketService();
