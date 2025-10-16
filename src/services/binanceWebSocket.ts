import { LiquidationEvent } from '../types/binance';

type LiquidationCallback = (data: LiquidationEvent) => void;

class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private callbacks: LiquidationCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second
  private isConnected = false;
  private symbol: string;

  constructor(symbol: string = 'btcusdt') {
    this.symbol = symbol.toLowerCase();
    this.connect();
  }

  private getWebSocketUrl(): string {
    return `wss://fstream.binance.com/ws/${this.symbol}@forceOrder`;
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(this.getWebSocketUrl());
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data: LiquidationEvent = JSON.parse(event.data);
        this.callbacks.forEach(callback => callback(data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.ws?.close();
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  public subscribe(callback: LiquidationCallback): void {
    if (!this.callbacks.includes(callback)) {
      this.callbacks.push(callback);
    }
  }

  public unsubscribe(callback: LiquidationCallback): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  public changeSymbol(symbol: string): void {
    this.symbol = symbol.toLowerCase();
    if (this.ws) {
      this.ws.close();
      this.connect();
    }
  }

  public close(): void {
    if (this.ws) {
      this.ws.close();
      this.callbacks = [];
    }
  }
}

export default BinanceWebSocket;
