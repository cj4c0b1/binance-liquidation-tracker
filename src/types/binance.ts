export interface LiquidationOrder {
  s: string; // Symbol
  S: 'BUY' | 'SELL'; // Side
  o: 'LIMIT' | 'MARKET' | 'STOP'; // Order type
  f: 'GTC' | 'IOC' | 'FOK' | 'GTX'; // Time in force
  q: string; // Original quantity
  p: string; // Price
  ap: string; // Average price
  X: 'NEW' | 'FILLED' | 'CANCELED'; // Current order status
  l: string; // Order last filled quantity
  z: string; // Order filled accumulated quantity
  T: number; // Order trade time
}

export interface LiquidationEvent {
  e: string; // Event type
  E: number; // Event time
  o: LiquidationOrder;
}
