# Binance Liquidation Tracker
<img width="1404" height="1239" alt="image" src="https://github.com/user-attachments/assets/656f6351-f7ab-4873-99ae-5cef6a6bead4" />

A real-time dashboard for monitoring Binance futures liquidations using WebSocket connections. Track live liquidation events with filtering, sorting, and visualization capabilities.

![Real-time liquidation monitoring](https://img.shields.io/badge/Status-Live-green) 
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.1-blue)

## Features

- **Real-time Data Stream**: Live connection to Binance futures liquidation WebSocket
- **Interactive Dashboard**: Modern, responsive UI with dark theme
- **Data Visualization**: Bar charts showing liquidation volume by symbol
- **Advanced Filtering**: Filter liquidations by trading symbol
- **Flexible Sorting**: Sort by time, price, quantity, or symbol
- **Live Statistics**: Real-time metrics including total volume and bull/bear ratios
- **Mobile Optimized**: Fully responsive design for all devices
- **Auto-reconnection**: Automatic WebSocket reconnection on connection loss

## Screenshots

The dashboard provides:
- Live liquidation feed with real-time updates
- Volume statistics and bull/bear sentiment indicators
- Interactive charts powered by Recharts
- Symbol-based filtering and multi-column sorting
- Connection status monitoring with error handling

## Tech Stack

- **Frontend**: React 19.2.0 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for modern iconography
- **Data Source**: Binance WebSocket API (`wss://fstream.binance.com/ws/!forceOrder@arr`)
- **Build Tool**: Create React App

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd binance-liquidation-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The application will automatically connect to Binance's liquidation WebSocket stream and begin displaying real-time data.

## Available Scripts

### `npm start`
Runs the app in development mode with hot reloading enabled.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production with optimized bundles and minification.

## Data Structure

The app processes Binance liquidation events with the following structure:

```typescript
interface LiquidationData {
  id: string;           // Unique identifier
  symbol: string;       // Trading pair (e.g., "BTCUSDT")
  side: 'BUY' | 'SELL'; // Liquidation side
  price: string;        // Liquidation price
  quantity: string;     // Liquidation quantity
  time: string;         // Formatted timestamp
  timestamp: number;    // Unix timestamp
}
```

## Key Features Explained

### Real-time WebSocket Connection
- Connects to `wss://fstream.binance.com/ws/!forceOrder@arr`
- Handles both single events and batch arrays
- Implements automatic reconnection with exponential backoff
- Processes liquidation events continuously without a fixed limit

### Data Processing
- Filters liquidations by symbol (partial string matching)
- Sorts by time, price, quantity, or symbol (ascending/descending)
- Calculates aggregate statistics (volume, counts, ratios)
- Generates chart data for top 10 symbols by volume

### User Interface
- Dark theme optimized for trading environments
- Responsive grid layout for mobile and desktop
- Live connection status indicators
- Interactive sorting buttons with visual feedback

## Performance Considerations

- Efficient React state updates using functional updates
- Memoized calculations for chart data generation
- Optimized WebSocket message processing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

### Production Build
```bash
npm run build
```

The build folder contains optimized static files ready for deployment to any static hosting service.

### Netlify Deployment
This project is configured for Netlify deployment with automatic builds from your git repository.

## License

This project is open source and available under the MIT License.

## Disclaimer

This tool is for educational and informational purposes only. Always conduct your own research before making trading decisions. Liquidation data is provided by Binance and subject to their terms of service.
