import { useEffect, useRef, useState } from 'react';
import { LiquidationEvent } from '../types/binance';
import BinanceWebSocket from '../services/binanceWebSocket';

export const useLiquidationStream = (symbol: string = 'btcusdt') => {
  const [liquidation, setLiquidation] = useState<LiquidationEvent | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const wsRef = useRef<BinanceWebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new BinanceWebSocket(symbol);
    
    const handleLiquidation = (data: LiquidationEvent) => {
      setLiquidation(data);
    };

    wsRef.current.subscribe(handleLiquidation);
    setIsConnected(true);

    return () => {
      if (wsRef.current) {
        wsRef.current.unsubscribe(handleLiquidation);
        wsRef.current.close();
        wsRef.current = null;
        setIsConnected(false);
      }
    };
  }, [symbol]);

  const changeSymbol = (newSymbol: string) => {
    if (wsRef.current) {
      wsRef.current.changeSymbol(newSymbol);
      setLiquidation(null);
    }
  };

  return { liquidation, isConnected, changeSymbol };
};
