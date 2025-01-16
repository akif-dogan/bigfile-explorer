import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import BlockDetailsComponent from './components/BlockDetails';
import TransactionDetails from './components/TransactionDetails';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function App() {
  const basename = process.env.NODE_ENV === 'production' 
    ? '/bigfile-explorer'
    : '';

  return (
    <QueryClientProvider client={queryClient}>
      <Router basename={basename}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/block/:hashOrHeight" element={<BlockDetailsComponent />} />
            <Route path="/tx/:id" element={<TransactionDetails />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;