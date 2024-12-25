import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import BlockDetails from './components/BlockDetails';
import TransactionDetails from './components/TransactionDetails';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/block/:hash" element={<BlockDetails />} />
            <Route path="/tx/:id" element={<TransactionDetails />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;