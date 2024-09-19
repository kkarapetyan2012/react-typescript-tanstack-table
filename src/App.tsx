// src/App.tsx
import React from 'react';
import ProductTable from './components/ProductTable';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1 className="text-center text-2xl font-bold my-4">Product Listing</h1>
      <ProductTable />
    </div>
  );
};

export default App;
