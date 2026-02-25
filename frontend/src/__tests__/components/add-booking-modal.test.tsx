import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddBookingModal } from '@/components/calendar/add-booking-modal';

// Mock hooks
const mockCreateBooking = jest.fn();
const mockTimeSlots = [
  { id: 'slot-1', name: 'Mañana', startTime: '08:00', endTime: '13:00', isActive: true },
  { id: 'slot-2', name: 'Tarde', startTime: '14:00', endTime: '19:00', isActive: true },
];
const mockChildren = {
  data: [
    { id: 'child-1', firstName: 'Lucas', lastName: 'Pérez' },
    { id: 'child-2', firstName: 'María', lastName: 'González' },
  ],
};

jest.mock('@/hooks/use-admin', () => ({
  useTimeSlots: () => ({ data: mockTimeSlots, isLoading: false }),
  useAdminChildren: () => ({ data: mockChildren, isLoading: false }),
  useCreateBooking: () => ({
    mutate: mockCreateBooking,
    mutateAsync: mockCreateBooking,
    isPending: false,
    isSuccess: false,
  }),
}));

jest.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({ accessToken: 'mock-token' }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('AddBookingModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    selectedDate: new Date('2024-03-15'),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render modal when open', () => {
      render(
        <Wrapper>
          <AddBookingModal {...defaultProps} />
        </Wrapper>
      );

      expect(screen.getByText('Agregar Reserva')).toBeInTheDocument();
    });

    it('should not render modal when closed', () => {
      render(
        <Wrapper>
          <AddBookingModal {...defaultProps} open={false} />
        </Wrapper>
      );

      expect(screen.queryByText('Agregar Reserva')).not.toBeInTheDocument();
    });

    it('should display selected date', () => {
      render(
        <Wrapper>
          <AddBookingModal {...defaultProps} />
        </Wrapper>
      );

      // The date should be formatted and displayed - look for "Crear reserva para el"
      expect(screen.getByText(/Crear reserva para el/)).toBeInTheDocument();
    });
  });

  describe('form elements', () => {
    it('should render child select', () => {
      render(
        <Wrapper>
          <AddBookingModal {...defaultProps} />
        </Wrapper>
      );

      expect(screen.getByText('Niño/a')).toBeInTheDocument();
    });

    it('should render time slot select', () => {
      render(
        <Wrapper>
          <AddBookingModal {...defaultProps} />
        </Wrapper>
      );

      expect(screen.getByText('Horario')).toBeInTheDocument();
    });

    it('should render notes input', () => {
      render(
        <Wrapper>
          <AddBookingModal {...defaultProps} />
        </Wrapper>
      );

      expect(screen.getByText(/Notas/)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(
        <Wrapper>
          <AddBookingModal {...defaultProps} />
        </Wrapper>
      );

      expect(screen.getByText('Crear Reserva')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onOpenChange when cancel is clicked', async () => {
      render(
        <Wrapper>
          <AddBookingModal {...defaultProps} />
        </Wrapper>
      );

      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should allow typing in notes field', async () => {
      render(
        <Wrapper>
          <AddBookingModal {...defaultProps} />
        </Wrapper>
      );

      const notesInput = screen.getByPlaceholderText(/Niño extra/i);
      await userEvent.type(notesInput, 'Test notes');

      expect(notesInput).toHaveValue('Test notes');
    });
  });

  describe('without selected date', () => {
    it('should handle null selectedDate gracefully', () => {
      render(
        <Wrapper>
          <AddBookingModal {...defaultProps} selectedDate={null} />
        </Wrapper>
      );

      expect(screen.getByText('Agregar Reserva')).toBeInTheDocument();
    });
  });
});
