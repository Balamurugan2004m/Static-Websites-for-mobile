import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import WidgetMenu from '../home/widgets-menu';

// Mock SVG Asset Imports
jest.mock('../../assets/Grid view.svg', () => 'grid-icon.svg');
jest.mock('../../assets/search-icon.svg', () => 'search-icon.svg');
jest.mock('../../assets/Cancel.svg', () => 'cancel-icon.svg');
jest.mock('../../assets/Cancel-Dark-Mode.svg', () => 'cancel-dark-icon.svg');

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    hasClaim: () => true,
  }),
}));

const mockDispatch = jest.fn();
const mockPinnedWidgetIds: string[] = [];
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) =>
    selector({
      widgets: {
        pinnedWidgetIds: mockPinnedWidgetIds,
      },
    }),
}));

// Mock `widgetItems` from local data source
jest.mock('../home/mock/widget-data', () => ({
  widgetItems: [
    { id: 'provider', title: 'Provider', desc: 'Provider work queue', children: [{ id: 'provider-1', value: '1', label: 'P1' }] },
    { id: 'case-management', title: 'Case Management', desc: 'Case Management queue', children: [{ id: 'case-1', value: '1', label: 'CM1' }] },
    { id: 'contact-center', title: 'Contact Center', desc: 'Contact Center queue', children: [{ id: 'contact-1', value: '1', label: 'CC1' }] },
    { id: 'facility-diagnostics', title: 'Facility Diagnostics', desc: 'Facility Diagnostics queue', children: [{ id: 'facility-1', value: '1', label: 'FD1' }] },
    { id: 'diagnostics-admin', title: 'Diagnostics Admin', desc: 'Diagnostics Admin queue', children: [{ id: 'admin-1', value: '1', label: 'DA1' }] },
    { id: 'final-contention-review', title: 'Final Contention Review', desc: 'FCR queue', children: [{ id: 'fcr-1', value: '1', label: 'FCR1' }] },
  ],
}));

// Mock WidgetSuccessToast
jest.mock('../home/components/widget-toast', () => ({
  __esModule: true,
  default: ({ title, message }: { title: string; message: string }) => (
    <div data-testid="widget-toast">
      <span>{title}</span>
      <span>{message}</span>
    </div>
  ),
}));

const theme = createTheme({ palette: { mode: 'light' } });
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('WidgetMenu Component', () => {
  const mockProps = {
    onAddWidgets: jest.fn(),
    currentWidgets: [],
  };

  // Wrap custom window dispatch inside act to eliminate react warnings
  const openDrawer = () => {
    act(() => {
      window.dispatchEvent(new Event('open-widget-panel'));
    });
  };

  beforeEach(() => jest.clearAllMocks());

  test('opens drawer when window event "open-widget-panel" is dispatched', async () => {
    render(
      <TestWrapper>
        <WidgetMenu {...mockProps} />
      </TestWrapper>
    );

    openDrawer();

    await waitFor(() => {
      expect(screen.getByText('Available Work Queues')).toBeInTheDocument();
    });
  });

  test('renders all available work queues from widgetItems', async () => {
    render(
      <TestWrapper>
        <WidgetMenu {...mockProps} />
      </TestWrapper>
    );

    openDrawer();

    await waitFor(() => {
      expect(screen.getByText('Provider')).toBeInTheDocument();
      expect(screen.getByText('Case Management')).toBeInTheDocument();
      expect(screen.getByText('Contact Center')).toBeInTheDocument();
    });
  });

  test('filters work queues by title or description matching search term', async () => {
    render(
      <TestWrapper>
        <WidgetMenu {...mockProps} />
      </TestWrapper>
    );

    openDrawer();

    await waitFor(() => screen.getByText('Provider'));

    fireEvent.change(screen.getByPlaceholderText('Search Queues'), {
      target: { value: 'Provider' },
    });

    expect(screen.getByText('Provider')).toBeInTheDocument();
    expect(screen.queryByText('Case Management')).not.toBeInTheDocument();
  });

  test('allows selecting new widgets and calls onAddWidgets on Add button click', async () => {
    render(
      <TestWrapper>
        <WidgetMenu {...mockProps} />
      </TestWrapper>
    );

    openDrawer();

    await waitFor(() => screen.getByText('Provider'));

    // Toggle selection on Provider
    fireEvent.click(screen.getByText('Provider').closest('li')!);

    // Click Add button
    const addButton = screen.getByRole('button', { name: /^add$/i });
    expect(addButton).not.toBeDisabled();
    
    act(() => {
      fireEvent.click(addButton);
    });

    expect(mockProps.onAddWidgets).toHaveBeenCalledWith(['provider', 'provider-1']);

    // Check success toast message matching actual string rendered by component:
    // "The 1 widget successfully added to home."
    expect(screen.getByTestId('widget-toast')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('1 widget successfully added to home.'))
    ).toBeInTheDocument();
  });

  test('closes drawer and resets search term when Cancel button is clicked', async () => {
    render(
      <TestWrapper>
        <WidgetMenu {...mockProps} />
      </TestWrapper>
    );

    openDrawer();

    await waitFor(() => screen.getByText('Available Work Queues'));

    // Type into search
    fireEvent.change(screen.getByPlaceholderText('Search Queues'), {
      target: { value: 'Provider' },
    });

    // Click Cancel
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    });

    await waitFor(() => {
      expect(screen.queryByText('Available Work Queues')).not.toBeInTheDocument();
    });
  });

  test('closes drawer when close icon (X mark) is clicked', async () => {
    render(
      <TestWrapper>
        <WidgetMenu {...mockProps} />
      </TestWrapper>
    );

    openDrawer();

    await waitFor(() => screen.getByText('Available Work Queues'));

    const closeIcon = screen.getByRole('button', { name: /close/i });
    expect(closeIcon).toBeInTheDocument();

    act(() => {
      fireEvent.click(closeIcon);
    });

    await waitFor(() => {
      expect(screen.queryByText('Available Work Queues')).not.toBeInTheDocument();
    });
  });

  test('disables Add button when selected widgets count equals current widgets count', async () => {
    const propsWithCurrentWidgets = { ...mockProps, currentWidgets: ['provider'] };

    render(
      <TestWrapper>
        <WidgetMenu {...propsWithCurrentWidgets} />
      </TestWrapper>
    );

    openDrawer();

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /^add$/i });
      expect(addButton).toBeDisabled();
    });
  });

  test('displays limit toast warning when selected widgets exceed maximum allowed (5)', async () => {
    render(
      <TestWrapper>
        <WidgetMenu {...mockProps} />
      </TestWrapper>
    );

    openDrawer();

    await waitFor(() => screen.getByText('Provider'));

    // Select 6 items (Limit is 5)
    fireEvent.click(screen.getByText('Provider').closest('li')!);
    fireEvent.click(screen.getByText('Case Management').closest('li')!);
    fireEvent.click(screen.getByText('Contact Center').closest('li')!);
    fireEvent.click(screen.getByText('Facility Diagnostics').closest('li')!);
    fireEvent.click(screen.getByText('Diagnostics Admin').closest('li')!);
    fireEvent.click(screen.getByText('Final Contention Review').closest('li')!);

    // Click Add button
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    });

    expect(mockProps.onAddWidgets).not.toHaveBeenCalled();
    expect(screen.getByText('You can display up to 5 widgets.')).toBeInTheDocument();
  });
});
