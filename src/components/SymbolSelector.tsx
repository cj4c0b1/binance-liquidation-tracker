const COMMON_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'DOTUSDT',
  'SHIBUSDT',
  'MATICUSDT',
];

interface SymbolSelectorProps {
  value: string;
  onChange: (symbol: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SymbolSelector({ 
  value, 
  onChange, 
  disabled = false, 
  className = '' 
}: SymbolSelectorProps) {
  return (
    <div className={className}>
      <label htmlFor="symbol-select" className="block text-sm font-medium text-slate-300 mb-1">
        Select Trading Pair
      </label>
      <select
        id="symbol-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full max-w-xs px-3 py-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <option value="">Choose a symbol</option>
        {COMMON_SYMBOLS.map((symbol) => (
          <option key={symbol} value={symbol}>
            {symbol}
          </option>
        ))}
      </select>
    </div>
  );
}
