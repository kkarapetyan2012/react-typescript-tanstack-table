// src/components/ProductTable.test.tsx
import { render, screen } from '@testing-library/react';
import ProductTable from './ProductTable';

test('renders ProductTable', () => {
  render(<ProductTable />);
  expect(screen.getByText(/Product Listing/i)).toBeInTheDocument();
});
