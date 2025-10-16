import { LiquidationEvent } from '../types/binance';

interface LiquidationFeedProps {
  liquidation: LiquidationEvent | null;
  isConnected: boolean;
}

export function LiquidationFeed({ liquidation, isConnected }: LiquidationFeedProps) {
  if (!isConnected) {
    return (
      <div className="p-4 mb-4 bg-slate-800 rounded-lg border border-slate-700">
        <p className="text-slate-400 text-center">
          Connecting to Binance WebSocket...
        </p>
      </div>
    );
  }

  if (!liquidation) {
    return (
      <div className="p-4 mb-4 bg-slate-800 rounded-lg border border-slate-700">
        <p className="text-center text-slate-400">Waiting for liquidation data...</p>
      </div>
    );
  }

  const { o: order } = liquidation;
  const isBuy = order.S === 'BUY';
  const price = parseFloat(order.p).toFixed(2);
  const quantity = parseFloat(order.q).toFixed(4);
  const total = (parseFloat(order.p) * parseFloat(order.q)).toFixed(2);
  const time = new Date(order.T).toLocaleTimeString();
  const borderColor = isBuy ? 'border-l-green-500' : 'border-l-red-500';

  return (
    <div className={`p-4 mb-4 bg-slate-800 rounded-lg border-l-4 ${borderColor} border-slate-700 hover:shadow-lg transition-shadow`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white">
            {order.s}
          </h3>
          <p className="text-xs text-slate-400">
            {time}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isBuy ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
          {isBuy ? 'LONG LIQUIDATED' : 'SHORT LIQUIDATED'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="flex flex-col items-center">
          <p className="text-xs text-slate-400">
            Price
          </p>
          <p className="text-lg font-bold text-blue-400">
            ${price}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xs text-slate-400">
            Quantity
          </p>
          <p className="text-lg font-bold text-slate-300">
            {quantity}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xs text-slate-400">
            Total Value
          </p>
          <p className="text-lg font-bold text-white">
            ${total}
          </p>
        </div>
      </div>
      
      {!isConnected && (
        <p className="text-red-400 text-sm mt-2">
          Connection lost. Attempting to reconnect...
        </p>
      )}
    </div>
  );
}
