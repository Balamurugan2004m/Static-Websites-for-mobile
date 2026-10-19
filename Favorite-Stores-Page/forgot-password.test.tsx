import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from './forgot-password';
import { BrowserRouter } from 'react-router';
import { requestPasswordReset } from '../../services/auth';
import { paths } from '../../constants/paths';

// -------------------- MOCKS --------------------
jest.mock('../../services/auth', () => ({
  requestPasswordReset: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

// -------------------- SETUP --------------------
const setup = () =>
  render(
    <BrowserRouter>
      <ForgotPassword />
    </BrowserRouter>
  );

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockNavigate.mockClear();
  });

  // -------------------- RENDER --------------------
  it('renders ForgotPassword form correctly', () => {
    setup();

    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reset link/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });

  // -------------------- VALIDATION --------------------
  it('shows required field error when username is empty', async () => {
    setup();

    fireEvent.click(
      screen.getByRole('button', { name: /reset link/i })
    );

    await waitFor(() => {
      expect(screen.getByText('*Required field')).toBeInTheDocument();
    });
  });

  it('clears error when user starts typing', async () => {
    setup();

    fireEvent.click(
      screen.getByRole('button', { name: /reset link/i })
    );

    expect(screen.getByText('*Required field')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' },
    });

    await waitFor(() => {
      expect(
        screen.queryByText('*Required field')
      ).not.toBeInTheDocument();
    });
  });

  // -------------------- LOADING STATE --------------------
  it('shows loading spinner and disables button while submitting', async () => {
    (requestPasswordReset as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    setup();

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' },
    });

    const button = screen.getByRole('button', {
      name: /reset link/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      const sendingButton = screen.getByRole('button', { name: /sending reset link/i });
      expect(sendingButton).toBeInTheDocument();
      expect(sendingButton).toBeDisabled();
    });
  });

  it('does not send duplicate requests when button is clicked while loading', async () => {
    (requestPasswordReset as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    setup();

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' },
    });

    const button = screen.getByRole('button', {
      name: /reset link/i,
    });

    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => {
      expect(requestPasswordReset).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------- SUCCESS FLOW --------------------
  it('shows success popup when API returns email', async () => {
    (requestPasswordReset as jest.Mock).mockResolvedValueOnce({
      Email: 'test@example.com',
    });
  
    setup();
  
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' },
    });
  
    fireEvent.click(
      screen.getByRole('button', { name: /reset link/i })
    );
  
    expect(
      await screen.findByText(/check your email/i)
    ).toBeInTheDocument();
  });

  it('closes success popup when clicking Back to login', async () => {
    (requestPasswordReset as jest.Mock).mockResolvedValueOnce({
      Email: 'test@example.com',
    });

    setup();

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /reset link/i })
    );

    const backToLoginButton = await screen.findByRole('button', {
      name: /back to login/i,
    });
    
    fireEvent.click(backToLoginButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/check your email/i)
      ).not.toBeInTheDocument();
    });
  });

  // -------------------- FAILURE PATHS --------------------
  it('shows success popup when API returns no email', async () => {
    (requestPasswordReset as jest.Mock).mockResolvedValue({});
  
    setup();
  
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' },
    });
  
    fireEvent.click(
      screen.getByRole('button', { name: /reset link/i })
    );
  
    expect(
      await screen.findByText(/check your email/i)
    ).toBeInTheDocument();
  });

  it('shows error when API throws exception', async () => {
    (requestPasswordReset as jest.Mock).mockRejectedValueOnce(
      new Error('API Error')
    );

    setup();

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /reset link/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText('Invalid username. Please try again!')
      ).toBeInTheDocument();
    });
  });

  // -------------------- ERROR ICON --------------------
  it('shows error icon when error exists', async () => {
    setup();

    fireEvent.click(
      screen.getByRole('button', { name: /reset link/i })
    );

    await waitFor(() => {
      expect(
        screen.getByAltText('Warning')
      ).toBeInTheDocument();
    });
  });

  // -------------------- NAVIGATION --------------------
  it('navigates back to login when clicking Back to Login', () => {
    setup();

    fireEvent.click(screen.getByText(/back to login/i));

    expect(mockNavigate).toHaveBeenCalledWith(
      paths.LOGIN.pathName
    );
  });
  it('calls requestPasswordReset with entered username', async () => {
    (requestPasswordReset as jest.Mock).mockResolvedValueOnce({
      Email: 'test@test.com',
    });
  
    setup();
  
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: '   testuser   ' },
    });
  
    fireEvent.click(
      screen.getByRole('button', { name: /reset link/i })
    );
  
    await waitFor(() => {
      expect(requestPasswordReset).toHaveBeenCalledWith(
        '   testuser   '
      );
      expect(requestPasswordReset).toHaveBeenCalledTimes(1);
    });
  });
  
  it('shows sending reset link text while loading', async () => {
    (requestPasswordReset as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
  
    setup();
  
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' },
    });
  
    fireEvent.click(
      screen.getByRole('button', { name: /reset link/i })
    );
  
    expect(
      screen.getByText(/sending reset link/i)
    ).toBeInTheDocument();
  });
  
  it('clears incorrect username error when typing again', async () => {
    (requestPasswordReset as jest.Mock).mockRejectedValueOnce(
      new Error('API Error')
    );
  
    setup();
  
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'baduser' },
    });
  
    fireEvent.click(
      screen.getByRole('button', { name: /reset link/i })
    );
  
    await screen.findByText('Invalid username. Please try again!');
  
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'newuser' },
    });
  
    await waitFor(() => {
      expect(
        screen.queryByText('Invalid username. Please try again!')
      ).not.toBeInTheDocument();
    });
  });
  
  it('navigates to login from success popup', async () => {
    (requestPasswordReset as jest.Mock).mockResolvedValueOnce({
      Email: 'abc@test.com',
    });
  
    setup();
  
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'user1' },
    });
  
    fireEvent.click(
      screen.getByRole('button', { name: /reset link/i })
    );
  
    await screen.findByText(/check your email/i);
  
    fireEvent.click(
      screen.getAllByRole('button', {
        name: /back to login/i,
      })[0]
    );
  
    expect(mockNavigate).toHaveBeenCalledWith(
      paths.LOGIN.pathName
    );
  });
  
  it('renders mde logo', () => {
    setup();
  
    expect(
      screen.getByAltText(/mde4vets/i)
    ).toBeInTheDocument();
  });
  
  it('renders footer links', () => {
    setup();
  
    expect(
      screen.getByText(/terms of service/i)
    ).toBeInTheDocument();
  
    expect(
      screen.getByText(/privacy policy/i)
    ).toBeInTheDocument();
  
    expect(
      screen.getByText(/about us/i)
    ).toBeInTheDocument();
  });
  
  it('does not call api when username contains only spaces', async () => {
    setup();
  
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: '     ' },
    });
  
    fireEvent.click(
      screen.getByRole('button', { name: /reset link/i })
    );
  
    await waitFor(() => {
      expect(requestPasswordReset).not.toHaveBeenCalled();
    });
  });
  
  it('keeps dialog closed initially', () => {
    setup();
  
    expect(
      screen.queryByText(/check your email/i)
    ).not.toBeInTheDocument();
  });
  
  it('removes loading spinner after successful request', async () => {
    (requestPasswordReset as jest.Mock).mockResolvedValueOnce({
      Email: 'test@test.com',
    });
  
    setup();
  
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'user' },
    });
  
    fireEvent.click(
      screen.getByRole('button', { name: /reset link/i })
    );
  
    await screen.findByText(/check your email/i);
  
    expect(
      screen.queryByRole('progressbar')
    ).not.toBeInTheDocument();
  });
  
  it('removes loading state after failed request', async () => {
    (requestPasswordReset as jest.Mock).mockRejectedValueOnce(
      new Error('error')
    );
  
    setup();
  
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'user' },
    });
  
    fireEvent.click(
      screen.getByRole('button', { name: /reset link/i })
    );
  
    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /reset link/i,
        })
      ).not.toBeDisabled();
    });
  });
});
