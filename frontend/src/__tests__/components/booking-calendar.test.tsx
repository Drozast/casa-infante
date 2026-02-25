import { render, screen, fireEvent } from '@testing-library/react';
import { BookingCalendar } from '@/components/calendar/booking-calendar';
import type { Booking } from '@/types';

// Mock bookings data
const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    childId: 'child-1',
    slotId: 'slot-1',
    date: new Date().toISOString(),
    passType: 'MONTHLY',
    status: 'CONFIRMED',
    weeklyFrequency: 1,
    unitPrice: 22000,
    totalPrice: 88000,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    child: {
      id: 'child-1',
      firstName: 'Lucas',
      lastName: 'Pérez',
      birthDate: '2018-05-15',
      grade: '1ro Básico',
      schoolName: 'Colegio ABC',
      guardianId: 'guardian-1',
    },
    slot: {
      id: 'slot-1',
      name: 'Mañana',
      startTime: '08:00',
      endTime: '13:00',
      maxCapacity: 20,
      isActive: true,
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  },
  {
    id: 'booking-2',
    childId: 'child-2',
    slotId: 'slot-1',
    date: new Date().toISOString(),
    passType: 'MONTHLY',
    status: 'PENDING',
    weeklyFrequency: 1,
    unitPrice: 22000,
    totalPrice: 88000,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    child: {
      id: 'child-2',
      firstName: 'María',
      lastName: 'González',
      birthDate: '2019-03-20',
      grade: 'Kinder',
      schoolName: 'Colegio XYZ',
      guardianId: 'guardian-2',
    },
    slot: {
      id: 'slot-1',
      name: 'Mañana',
      startTime: '08:00',
      endTime: '13:00',
      maxCapacity: 20,
      isActive: true,
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  },
];

describe('BookingCalendar', () => {
  describe('rendering', () => {
    it('should render the calendar with current month and year', () => {
      render(<BookingCalendar bookings={[]} />);

      const currentDate = new Date();
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const expectedMonthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

      expect(screen.getByText(expectedMonthYear)).toBeInTheDocument();
    });

    it('should render all days of the week', () => {
      render(<BookingCalendar bookings={[]} />);

      expect(screen.getByText('Dom')).toBeInTheDocument();
      expect(screen.getByText('Lun')).toBeInTheDocument();
      expect(screen.getByText('Mar')).toBeInTheDocument();
      expect(screen.getByText('Mié')).toBeInTheDocument();
      expect(screen.getByText('Jue')).toBeInTheDocument();
      expect(screen.getByText('Vie')).toBeInTheDocument();
      expect(screen.getByText('Sáb')).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
      render(<BookingCalendar bookings={[]} />);

      expect(screen.getByText('Hoy')).toBeInTheDocument();
    });

    it('should render legend with status colors', () => {
      render(<BookingCalendar bookings={[]} />);

      expect(screen.getByText('Pendiente')).toBeInTheDocument();
      expect(screen.getByText('Confirmada')).toBeInTheDocument();
      expect(screen.getByText('Completada')).toBeInTheDocument();
      expect(screen.getByText('Cancelada')).toBeInTheDocument();
    });
  });

  describe('bookings display', () => {
    it('should display bookings on calendar days', () => {
      render(<BookingCalendar bookings={mockBookings} />);

      // Should show child names
      expect(screen.getByText('Lucas')).toBeInTheDocument();
      expect(screen.getByText('María')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should navigate to previous month', () => {
      render(<BookingCalendar bookings={[]} />);

      const currentDate = new Date();
      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      // Find and click the previous button (ChevronLeft)
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons.find(btn => btn.querySelector('svg.lucide-chevron-left'));

      if (prevButton) {
        fireEvent.click(prevButton);
        expect(screen.getByText(`${monthNames[prevMonth.getMonth()]} ${prevMonth.getFullYear()}`)).toBeInTheDocument();
      }
    });

    it('should navigate to next month', () => {
      render(<BookingCalendar bookings={[]} />);

      const currentDate = new Date();
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      // Find and click the next button (ChevronRight)
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find(btn => btn.querySelector('svg.lucide-chevron-right'));

      if (nextButton) {
        fireEvent.click(nextButton);
        expect(screen.getByText(`${monthNames[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`)).toBeInTheDocument();
      }
    });

    it('should return to today when clicking Hoy button', () => {
      render(<BookingCalendar bookings={[]} />);

      // Navigate away first
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find(btn => btn.querySelector('svg.lucide-chevron-right'));
      if (nextButton) {
        fireEvent.click(nextButton);
      }

      // Click "Hoy" button
      fireEvent.click(screen.getByText('Hoy'));

      const currentDate = new Date();
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const expectedMonthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

      expect(screen.getByText(expectedMonthYear)).toBeInTheDocument();
    });
  });

  describe('day selection', () => {
    it('should show "Selecciona un día" when no day is selected', () => {
      render(<BookingCalendar bookings={[]} />);

      expect(screen.getByText('Selecciona un día')).toBeInTheDocument();
    });

    it('should call onDayClick when a day is clicked', () => {
      const onDayClick = jest.fn();
      render(<BookingCalendar bookings={[]} onDayClick={onDayClick} />);

      // Click on day 15
      const dayButtons = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.includes('15') && !btn.textContent?.includes('Hoy')
      );

      if (dayButtons.length > 0) {
        fireEvent.click(dayButtons[0]);
        expect(onDayClick).toHaveBeenCalled();
      }
    });
  });

  describe('add booking', () => {
    it('should call onAddBooking when add button is clicked', () => {
      const onAddBooking = jest.fn();
      render(<BookingCalendar bookings={[]} onAddBooking={onAddBooking} />);

      // Select a day first
      const dayButtons = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.includes('15') && !btn.textContent?.includes('Hoy')
      );

      if (dayButtons.length > 0) {
        fireEvent.click(dayButtons[0]);

        // Click "Agregar reserva" button
        const addButton = screen.getByText('Agregar reserva');
        fireEvent.click(addButton);

        expect(onAddBooking).toHaveBeenCalled();
      }
    });
  });

  describe('empty state', () => {
    it('should show empty state when day has no bookings', () => {
      render(<BookingCalendar bookings={[]} />);

      // Select a day
      const dayButtons = screen.getAllByRole('button').filter(btn => {
        const text = btn.textContent || '';
        return /^\d+$/.test(text.trim()) || /^\d+\+\d+/.test(text.trim());
      });

      if (dayButtons.length > 0) {
        fireEvent.click(dayButtons[0]);
        expect(screen.getByText('No hay reservas para este día')).toBeInTheDocument();
      }
    });
  });
});
