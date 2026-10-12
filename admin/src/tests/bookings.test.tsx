import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthContext, { type AuthContextType } from '@/context/AuthContext';
import { BookingList } from '@/features/bookings/BookingList';
import { StatusTransitionActions } from '@/features/bookings/StatusTransitionActions';
import { BookingDetailModal } from '@/features/bookings/BookingDetailModal';
import { apiClient } from '@/lib/api-client';
import type { BookingDoc } from '@/types/bookings';
import type { Role, User } from '@/types/auth';

// Mock apiClient
vi.mock('@/lib/api-client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

function createMockAuth(role: Role = 'admin'): AuthContextType {
  const user: User = {
    id: 1,
    email: `${role}@xegheplientinh.vn`,
    fullName: `Người dùng ${role}`,
    role,
  };

  return {
    user,
    token: 'jwt-token-test',
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    hasRole: (roles: Role | Role[]) => {
      const list = Array.isArray(roles) ? roles : [roles];
      return list.includes(user.role);
    },
    refreshUser: vi.fn().mockResolvedValue(user),
  };
}


const mockBookings: BookingDoc[] = [
  {
    id: 1,
    bookingCode: 'BK-1001',
    customerName: 'Hoàng Văn Khách',
    customerPhone: '0962298293',
    serviceType: 'passenger',
    pickupLocation: 'Số 10 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    dropoffLocation: 'Bến xe Niệm Nghĩa, Hải Phòng',
    rideType: 'ghep',
    vehicleType: '5cho',
    passengerCount: 1,
    pickupDatetime: '2026-10-15T08:30:00Z',
    estimatedPrice: 200000,
    status: 'pending',
    note: 'Đón đúng giờ giúp em nhé',
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
  },
  {
    id: 2,
    bookingCode: 'BK-1002',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    serviceType: 'passenger',
    pickupLocation: 'Vincom Hạ Long',
    dropoffLocation: 'Sân bay Nội Bài',
    rideType: 'bao',
    vehicleType: '7cho',
    passengerCount: 4,
    pickupDatetime: '2026-10-16T10:00:00Z',
    estimatedPrice: 850000,
    status: 'confirmed',
    createdAt: '2026-10-10T09:00:00Z',
    updatedAt: '2026-10-10T09:00:00Z',
  },
  {
    id: 3,
    bookingCode: 'BK-1003',
    customerName: 'Phạm Quang Minh',
    customerPhone: '0987654321',
    serviceType: 'passenger',
    pickupLocation: 'Bắc Ninh',
    dropoffLocation: 'Hà Nội',
    rideType: 'ghep',
    vehicleType: '4cho',
    passengerCount: 2,
    pickupDatetime: '2026-10-15T14:00:00Z',
    estimatedPrice: 150000,
    status: 'in_progress',
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-10T10:00:00Z',
  },
  {
    id: 4,
    bookingCode: 'BK-1004',
    customerName: 'Lê Thu Trang',
    customerPhone: '0977889900',
    serviceType: 'passenger',
    pickupLocation: 'Hải Phòng',
    dropoffLocation: 'Hà Nội',
    rideType: 'ghep',
    vehicleType: '5cho',
    passengerCount: 1,
    pickupDatetime: '2026-10-15T07:00:00Z',
    estimatedPrice: 200000,
    status: 'in_progress',
    createdAt: '2026-10-10T06:00:00Z',
    updatedAt: '2026-10-10T07:10:00Z',
  },
  {
    id: 5,
    bookingCode: 'BK-1005',
    customerName: 'Đặng Tuấn Anh',
    customerPhone: '0933445566',
    serviceType: 'passenger',
    pickupLocation: 'Hà Nội',
    dropoffLocation: 'Hải Phòng',
    rideType: 'bao',
    vehicleType: '4cho',
    passengerCount: 1,
    pickupDatetime: '2026-10-10T08:00:00Z',
    estimatedPrice: 600000,
    finalPrice: 600000,
    paymentMethod: 'cash',
    status: 'completed',
    createdAt: '2026-10-10T05:00:00Z',
    updatedAt: '2026-10-10T09:30:00Z',
    statusHistory: [
      {
        from: 'in_progress',
        to: 'completed',
        at: '2026-10-10T09:30:00Z',
        note: 'Đã hoàn thành tốt',
      },
    ],
  },
];

describe('Bookings Module (Task T116 & T117)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BookingList Component & Phone Masking (Task T116)', () => {
    it('hiển thị danh sách đơn đặt xe và đầy đủ số điện thoại khi vai trò là dispatcher hoặc admin', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { docs: mockBookings, totalDocs: mockBookings.length },
      });

      render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth('dispatcher')}>
            <BookingList />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('BK-1001')).toBeDefined();
        expect(screen.getByText('Hoàng Văn Khách')).toBeDefined();
      });

      // Số điện thoại không bị mask
      const phoneSpan = screen.getByTestId('booking-phone-1');
      expect(phoneSpan.textContent).toBe('0962298293');
      expect(screen.getByText('0912345678')).toBeDefined();

      // Kiểm tra các cột khác
      expect(screen.getByText(/Số 10 Nguyễn Trãi/)).toBeDefined();
      expect(screen.getByText(/Bến xe Niệm Nghĩa/)).toBeDefined();
      expect(screen.getAllByText('200.000 ₫').length).toBeGreaterThanOrEqual(1);
    });

    it('che số điện thoại khách hàng (maskPhone) khi vai trò là editor', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { docs: mockBookings, totalDocs: mockBookings.length },
      });

      render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth('editor')}>
            <BookingList />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('BK-1001')).toBeDefined();
      });

      // Số điện thoại 0962298293 phải chuyển thành 0962***293
      const phoneSpan = screen.getByTestId('booking-phone-1');
      expect(phoneSpan.textContent).toBe('0962***293');
      expect(screen.queryByText('0962298293')).toBeNull();

      // Số 0912345678 chuyển thành 0912***678
      const phoneSpan2 = screen.getByTestId('booking-phone-2');
      expect(phoneSpan2.textContent).toBe('0912***678');
      expect(screen.queryByText('0912345678')).toBeNull();
    });

    it('lọc danh sách đơn theo trạng thái và tìm kiếm mã đơn', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { docs: mockBookings, totalDocs: mockBookings.length },
      });

      render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth('admin')}>
            <BookingList />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('BK-1001')).toBeDefined();
        expect(screen.getByText('BK-1002')).toBeDefined();
      });

      // Lọc theo trạng thái pending
      const statusFilter = screen.getByTestId('status-filter');
      fireEvent.change(statusFilter, { target: { value: 'pending' } });

      expect(screen.getByText('BK-1001')).toBeDefined();
      expect(screen.queryByText('BK-1002')).toBeNull();
      expect(screen.queryByText('BK-1003')).toBeNull();

      // Reset về all
      fireEvent.change(statusFilter, { target: { value: 'all' } });
      expect(screen.getByText('BK-1002')).toBeDefined();
    });

    it('hiển thị khối tóm tắt thống kê các đơn đặt xe', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { docs: mockBookings, totalDocs: mockBookings.length },
      });

      render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth('admin')}>
            <BookingList />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('stat-pending')).toBeDefined();
        expect(screen.getByTestId('stat-in-progress')).toBeDefined();
        expect(screen.getByTestId('stat-completed')).toBeDefined();
      });
    });
  });

  describe('StatusTransitionActions Component (Task T117)', () => {
    it('chỉ render nút hợp lệ cho trạng thái pending: Xác nhận đơn và Hủy đơn', () => {
      render(
        <StatusTransitionActions
          booking={mockBookings[0]} // pending
        />
      );

      expect(screen.getByTestId('action-confirm-booking')).toBeDefined();
      expect(screen.getByTestId('action-cancel-booking')).toBeDefined();
      expect(screen.queryByTestId('action-assign-driver')).toBeNull();
      expect(screen.queryByTestId('action-start-trip')).toBeNull();
      expect(screen.queryByTestId('action-complete-trip')).toBeNull();
    });

    it('chỉ render nút hợp lệ cho trạng thái confirmed: Bắt đầu chạy và Hủy đơn', () => {
      render(
        <StatusTransitionActions
          booking={mockBookings[1]} // confirmed
        />
      );

      expect(screen.getByTestId('action-start-trip')).toBeDefined();
      expect(screen.getByTestId('action-cancel-booking')).toBeDefined();
      expect(screen.queryByTestId('action-confirm-booking')).toBeNull();
      expect(screen.queryByTestId('action-complete-trip')).toBeNull();
    });

    it('chỉ render nút hợp lệ cho trạng thái in_progress: Hoàn thành chuyến đi và Hủy đơn', () => {
      render(
        <StatusTransitionActions
          booking={mockBookings[3]} // in_progress
        />
      );

      expect(screen.getByTestId('action-complete-trip')).toBeDefined();
      expect(screen.getByTestId('action-cancel-booking')).toBeDefined();
      expect(screen.queryByTestId('action-confirm-booking')).toBeNull();
      expect(screen.queryByTestId('action-assign-driver')).toBeNull();
      expect(screen.queryByTestId('action-start-trip')).toBeNull();
    });

    it('hiển thị thông báo kết thúc chuyến đi khi trạng thái là completed hoặc cancelled', () => {
      render(
        <StatusTransitionActions
          booking={mockBookings[4]} // completed
        />
      );

      expect(screen.getByTestId('terminal-status-notice')).toBeDefined();
      expect(screen.getByText('Chuyến đi đã kết thúc')).toBeDefined();
      expect(screen.queryByTestId('action-confirm-booking')).toBeNull();
      expect(screen.queryByTestId('action-cancel-booking')).toBeNull();
    });

    it('gọi PATCH /bookings/:id khi xác nhận đơn từ pending sang confirmed', async () => {
      const handleUpdated = vi.fn();
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { doc: { ...mockBookings[0], status: 'confirmed' } },
      });

      render(
        <StatusTransitionActions
          booking={mockBookings[0]}
          onStatusUpdated={handleUpdated}
        />
      );

      const confirmBtn = screen.getByTestId('action-confirm-booking');
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith('/bookings/1', {
          status: 'confirmed',
        });
        expect(handleUpdated).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'confirmed' })
        );
      });
    });

    it('bắt đầu chuyến đi khi bấm Bắt đầu chạy từ confirmed sang in_progress', async () => {
      const handleUpdated = vi.fn();
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { doc: { ...mockBookings[1], status: 'in_progress' } },
      });

      render(
        <StatusTransitionActions
          booking={mockBookings[1]} // confirmed
          onStatusUpdated={handleUpdated}
        />
      );

      const startBtn = screen.getByTestId('action-start-trip');
      fireEvent.click(startBtn);

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith('/bookings/2', {
          status: 'in_progress',
        });
        expect(handleUpdated).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'in_progress' })
        );
      });
    });

    it('hoàn thành chuyến đi yêu cầu finalPrice hợp lệ (> 0)', async () => {
      const handleUpdated = vi.fn();
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: {
          doc: {
            ...mockBookings[3],
            status: 'completed',
            finalPrice: 220000,
            paymentMethod: 'cash',
          },
        },
      });

      render(
        <StatusTransitionActions
          booking={mockBookings[3]} // in_progress
          onStatusUpdated={handleUpdated}
        />
      );

      // Bấm nút Hoàn thành chuyến đi
      fireEvent.click(screen.getByTestId('action-complete-trip'));

      const priceInput = screen.getByTestId('final-price-input');
      const submitBtn = screen.getByTestId('confirm-complete-btn');

      // Test validation: giá = 0
      fireEvent.change(priceInput, { target: { value: '0' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Cần nhập giá cuối cùng lớn hơn 0.')).toBeDefined();
      });
      expect(apiClient.patch).not.toHaveBeenCalled();

      // Nhập giá hợp lệ
      fireEvent.change(priceInput, { target: { value: '220000' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith('/bookings/4', {
          status: 'completed',
          finalPrice: 220000,
          paymentMethod: 'cash',
          note: undefined,
        });
        expect(handleUpdated).toHaveBeenCalled();
      });
    });

    it('hủy đơn mở modal chọn cancelReason và gọi PATCH /bookings/:id', async () => {
      const handleUpdated = vi.fn();
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: {
          doc: {
            ...mockBookings[0],
            status: 'cancelled',
            cancelReason: 'customer_cancel',
          },
        },
      });

      render(
        <StatusTransitionActions
          booking={mockBookings[0]}
          onStatusUpdated={handleUpdated}
        />
      );

      // Bấm nút Hủy đơn
      fireEvent.click(screen.getByTestId('action-cancel-booking'));

      expect(screen.getByRole('heading', { name: 'Hủy đơn đặt xe' })).toBeDefined();

      // Bấm nút Xác nhận hủy trong modal
      fireEvent.click(screen.getByTestId('confirm-cancel-btn'));

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith('/bookings/1', {
          status: 'cancelled',
          cancelReason: 'customer_cancel',
          note: undefined,
        });
      });
    });
  });

  describe('BookingDetailModal Component (Task T116)', () => {
    it('hiển thị đầy đủ thông tin chi tiết của đơn đặt xe và mask SĐT nếu là editor', () => {
      const handleClose = vi.fn();

      render(
        <AuthContext.Provider value={createMockAuth('editor')}>
          <BookingDetailModal
            booking={mockBookings[0]}
            isOpen={true}
            onClose={handleClose}
          />
        </AuthContext.Provider>
      );

      expect(screen.getByText('Chi tiết Đơn đặt xe #BK-1001')).toBeDefined();
      expect(screen.getByText('Hoàng Văn Khách')).toBeDefined();

      // SĐT bị mask với role editor
      const phoneElem = screen.getByTestId('detail-customer-phone');
      expect(phoneElem.textContent).toBe('0962***293');

      // Điểm đón trả
      expect(screen.getByText('Số 10 Nguyễn Trãi, Thanh Xuân, Hà Nội')).toBeDefined();
      expect(screen.getByText('Bến xe Niệm Nghĩa, Hải Phòng')).toBeDefined();

      // Ghi chú
      expect(screen.getByText('Đón đúng giờ giúp em nhé')).toBeDefined();
    });

    it('hiển thị đầy đủ số điện thoại trong modal chi tiết nếu role là dispatcher', () => {
      render(
        <AuthContext.Provider value={createMockAuth('dispatcher')}>
          <BookingDetailModal
            booking={mockBookings[0]}
            isOpen={true}
            onClose={vi.fn()}
          />
        </AuthContext.Provider>
      );

      const phoneElem = screen.getByTestId('detail-customer-phone');
      expect(phoneElem.textContent).toBe('0962298293');
    });

    it('hiển thị lịch sử chuyển trạng thái statusHistory', () => {
      render(
        <AuthContext.Provider value={createMockAuth('admin')}>
          <BookingDetailModal
            booking={mockBookings[4]} // completed with statusHistory
            isOpen={true}
            onClose={vi.fn()}
          />
        </AuthContext.Provider>
      );

      expect(screen.getByText(/Lịch sử chuyển trạng thái/)).toBeDefined();
      expect(screen.getByText('Đã hoàn thành tốt')).toBeDefined();
    });
  });
});
