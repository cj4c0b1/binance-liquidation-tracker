import { LiquidationEvent } from '../types/binance';

interface RecentLiquidationsProps {
  liquidations: LiquidationEvent[];
  maxItems?: number;
}

export function RecentLiquidations({ liquidations, maxItems = 10 }: RecentLiquidationsProps) {
  if (liquidations.length === 0) {
    return (
      <p className="text-slate-400 text-center py-4">
        No liquidation data available yet
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Symbol</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Side</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Price (USDT)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Quantity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Total Value</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Time</th>
          </tr>
        </thead>
        <tbody className="bg-slate-800 divide-y divide-slate-700">
          {liquidations.slice(0, maxItems).map((event, index) => {
            const { o: order } = event;
            const isBuy = order.S === 'BUY';
            const price = parseFloat(order.p).toFixed(2);
            const quantity = parseFloat(order.q).toFixed(4);
            const total = (parseFloat(order.p) * parseFloat(order.q)).toFixed(2);
            const time = new Date(order.T).toLocaleTimeString();

            return (
              <tr key={index} className="hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-white">{order.s}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isBuy ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                    {isBuy ? 'LONG' : 'SHORT'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">${price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">${total}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{time}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
