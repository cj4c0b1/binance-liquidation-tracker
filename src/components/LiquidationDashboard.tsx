import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, Zap, Filter, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LiquidationData {
  id: string;
  symbol: string;
  side: string;
  price: string;
  quantity: string;
  time: string;
  timestamp: number;
}

const LiquidationDashboard = () => {
  // In-memory state management (simulates Redis)
  const [liquidations, setLiquidations] = useState<LiquidationData[]>([]);
  const [filteredData, setFilteredData] = useState<LiquidationData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [filterSymbol, setFilterSymbol] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [sortOrder, setSortOrder] = useState('desc');
  const streamRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxDataPoints = 1000;

  // Initialize WebSocket connection
  const startWebSocket = useCallback(() => {
    try {
      setConnectionError(null);
      console.log('🚀 Attempting to connect to WebSocket...');
      const ws = new WebSocket('wss://fstream.binance.com/ws/!forceOrder@arr');

      ws.onopen = () => {
        setIsConnected(true);
        console.log('✅ WebSocket connected successfully to Binance liquidation stream');
      };

      ws.onmessage = (event) => {
        console.log('📨 Received WebSocket message:', event.data.substring(0, 200) + '...');
        try {
          const data = JSON.parse(event.data);
          let eventsToProcess: any[] = [];

          // Handle both single objects and arrays
          if (Array.isArray(data)) {
            eventsToProcess = data;
            console.log(`📊 Processing ${data.length} liquidation events`);
          } else if (data && data.e === 'forceOrder') {
            eventsToProcess = [data];
            console.log(`📊 Processing 1 liquidation event`);
          } else {
            console.warn('⚠️ Received non-liquidation data:', data);
            return;
          }

          const newLiquidations: LiquidationData[] = eventsToProcess.map((item: any) => ({
            id: `${item.o.orderId}-${item.o.tradeId || item.E}-${Math.random()}`,
            symbol: item.o.s, // Corrected field name from 'symbol' to 's'
            side: item.o.S, // Corrected field name from 'side' to 'S'
            price: item.o.p, // Corrected field name from 'price' to 'p'
            quantity: item.o.q, // Corrected field name from 'origQty' to 'q'
            time: new Date(item.E).toLocaleTimeString('en-US', { hour12: false }),
            timestamp: item.E,
          }));

          setLiquidations((prev) => {
            const updated = [...newLiquidations, ...prev];
            return updated.slice(0, maxDataPoints);
          });
        } catch (error) {
          console.error('❌ Error processing WebSocket message:', error);
          setConnectionError('Failed to process liquidation data');
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error occurred:', error);
        setConnectionError('WebSocket connection error - check console for details');
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);

        // Attempt to reconnect after 5 seconds if not manually closed
        if (event.code !== 1000) {
          console.log('🔄 Attempting to reconnect in 5 seconds...');
          setConnectionError('Connection lost, attempting to reconnect...');
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Reconnecting to WebSocket...');
            startWebSocket();
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('❌ Failed to establish WebSocket connection:', err);
      setConnectionError('Failed to establish WebSocket connection');
      setIsConnected(false);
      // Alert for debugging
      alert('WebSocket connection failed. Check console for details.');
    }
  }, []);

  // Stop WebSocket connection
  const stopWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Initialize on mount
  useEffect(() => {
    startWebSocket();
    return () => stopWebSocket();
  }, [startWebSocket, stopWebSocket]);

  // Apply filtering and sorting
  useEffect(() => {
    let data = [...liquidations];

    // Filter by symbol
    if (filterSymbol) {
      data = data.filter((item) =>
        item.symbol.toLowerCase().includes(filterSymbol.toLowerCase())
      );
    }

    // Sort data
    data.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortBy) {
        case 'time':
          aVal = a.timestamp;
          bVal = b.timestamp;
          break;
        case 'price':
          aVal = parseFloat(a.price);
          bVal = parseFloat(b.price);
          break;
        case 'quantity':
          aVal = parseFloat(a.quantity);
          bVal = parseFloat(b.quantity);
          break;
        case 'symbol':
          aVal = a.symbol;
          bVal = b.symbol;
          break;
        default:
          aVal = a.timestamp;
          bVal = b.timestamp;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    setFilteredData(data);
  }, [liquidations, filterSymbol, sortBy, sortOrder]);

  // Retry connection
  const retryConnection = useCallback(() => {
    stopWebSocket();
    setLiquidations([]);
    setTimeout(() => startWebSocket(), 100);
  }, [startWebSocket, stopWebSocket]);

  const handleSortChange = (newSort: string) => {
    if (sortBy === newSort) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSort);
      setSortOrder('desc');
    }
  };

  const totalVolume = liquidations.reduce((acc, item) => acc + (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const bullishCount = liquidations.filter((item) => item.side === 'BUY').length;
  const bearishCount = liquidations.filter((item) => item.side === 'SELL').length;

  // Calculate totals by symbol for the chart
  const chartData = liquidations.reduce((acc, item) => {
    const symbol = item.symbol;
    const value = (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0);
    acc[symbol] = (acc[symbol] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  const chartDataArray = Object.entries(chartData)
    .map(([symbol, total]) => ({ symbol: symbol.replace('USDT', ''), total: parseFloat(total.toFixed(2)) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10); // Show top 10 symbols

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Zap className="text-yellow-400" size={32} />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Liquidation Monitor</h1>
            </div>
            <a 
              href="https://www.binance.com/activity/referral-entry/CPA?ref=CPA_00GDL9H1UU" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              title="Trade on Binance"
            >
              <img 
                src="/binance-logo.png" 
                alt="Binance" 
                className="h-10 w-auto"
              />
            </a>
          </div>
          <p className="text-slate-300 text-sm sm:text-base">Real-time Binance futures liquidation stream</p>
        </div>

        {/* Status Bar */}
        <div className="mb-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected to Binance Stream' : 'Disconnected'}
              </span>
            </div>
            <div className="text-slate-400 text-xs sm:text-sm">
              Events: <span className="text-white font-semibold">{liquidations.length}</span>
            </div>
          </div>
          {connectionError && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm">{connectionError}</p>
                <button
                  onClick={retryConnection}
                  className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs rounded transition"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Total Volume</p>
            <p className="text-xl sm:text-2xl font-bold text-white">${totalVolume}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Bullish (Buy)</p>
            <p className="text-xl sm:text-2xl font-bold text-green-400">{bullishCount}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Bearish (Sell)</p>
            <p className="text-xl sm:text-2xl font-bold text-red-400">{bearishCount}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Ratio</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-400">
              {liquidations.length > 0 ? ((bullishCount / liquidations.length) * 100).toFixed(0) : '0'}%
            </p>
          </div>
        </div>

        {/* Chart */}
        {chartDataArray.length > 0 && (
          <div className="mb-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Total Volume by Symbol</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataArray}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="symbol" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Value']}
                />
                <Bar dataKey="total" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-slate-300 mb-2">
                <Filter size={16} className="inline mr-1" />
                Filter Symbol
              </label>
              <input
                type="text"
                placeholder="e.g., BTC, ETH"
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:items-end">
              <button
                onClick={() => handleSortChange('time')}
                className={`px-3 py-2 rounded text-sm transition flex items-center gap-1 ${
                  sortBy === 'time'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <ArrowUpDown size={14} />
                Time
              </button>
              <button
                onClick={() => handleSortChange('price')}
                className={`px-3 py-2 rounded text-sm transition flex items-center gap-1 ${
                  sortBy === 'price'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <ArrowUpDown size={14} />
                Price
              </button>
              <button
                onClick={() => handleSortChange('quantity')}
                className={`px-3 py-2 rounded text-sm transition flex items-center gap-1 ${
                  sortBy === 'quantity'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <ArrowUpDown size={14} />
                Qty
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Time</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Symbol</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Side</th>
                  <th className="px-4 py-3 text-right text-slate-300 font-semibold">Price</th>
                  <th className="px-4 py-3 text-right text-slate-300 font-semibold">Quantity</th>
                  <th className="px-4 py-3 text-right text-slate-300 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50 transition"
                    >
                      <td className="px-4 py-3 text-slate-300 text-xs">{item.time}</td>
                      <td className="px-4 py-3 text-white font-semibold">{item.symbol.replace('USDT', '')}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-fit ${
                            item.side === 'BUY'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {item.side === 'BUY' ? '▲' : '▼'} {item.side}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300">${(parseFloat(item.price) || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-300">{(parseFloat(item.quantity) || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-300">${((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0)).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      {liquidations.length === 0
                        ? 'Waiting for liquidation data...'
                        : 'No data matches your filters'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Live Binance futures liquidation data • WebSocket connection • Mobile optimized</p>
        </div>
      </div>
    </div>
  );
};

export default LiquidationDashboard;
