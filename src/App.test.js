import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home navigation buttons', () => {
  render(<App />);
  expect(screen.getByText(/add skill/i)).toBeInTheDocument();
  expect(screen.getByText(/add project/i)).toBeInTheDocument();
});
