import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthContext, { type AuthContextType } from '@/context/AuthContext';
import { Sidebar } from '@/components/common/Sidebar';
import { Header } from '@/components/common/Header';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import type { User, Role } from '@/types/auth';

function createMockAuth(overrides?: Partial<AuthContextType>): AuthContextType {
  const defaultUser: User = {
    id: 1,
    email: 'admin@xegheplientinh.vn',
    fullName: 'Nguyễn Văn Admin',
    role: 'admin',
  };

  const user = overrides?.user !== undefined ? overrides.user : defaultUser;

  const hasRoleFn = (roles: Role | Role[]): boolean => {
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  };

  return {
    user,
    token: 'jwt-test-token',
    isLoading: false,
    isAuthenticated: !!user,
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    hasRole: hasRoleFn,
    refreshUser: vi.fn().mockResolvedValue(user),
    ...overrides,
  };
}

describe('Sidebar Component & RBAC Navigation', () => {
  it('hiển thị đầy đủ tất cả menu cho tài khoản Admin', () => {
    const adminAuth = createMockAuth({
      user: {
        id: 1,
        email: 'admin@test.vn',
        fullName: 'Tổng Quản Trị',
        role: 'admin',
      },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthContext.Provider value={adminAuth}>
          <Sidebar />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Kiểm tra tên thương hiệu
    expect(screen.getByText('Xe Ghép Liên Tỉnh')).toBeDefined();
    expect(screen.getByText('Admin CMS')).toBeDefined();

    // Menu chung & Admin
    expect(screen.getByText('Tổng quan')).toBeDefined();
    expect(screen.getByText('Đơn đặt xe')).toBeDefined();
    expect(screen.getByText('Tuyến đường & Giá')).toBeDefined();
    expect(screen.getByText('Bài viết')).toBeDefined();
    expect(screen.getByText('Trang nội dung')).toBeDefined();
    expect(screen.getByText('Thư viện Media')).toBeDefined();
    expect(screen.queryByText('Tài xế')).toBeNull();
    expect(screen.getByText('Bảng giá phụ')).toBeDefined();
    expect(screen.getByText('Chuyển hướng 301')).toBeDefined();
    expect(screen.getByText('Cấu hình chung')).toBeDefined();
    expect(screen.getByText('Quản lý tài khoản')).toBeDefined();

    // Badge vai trò tiếng Việt
    expect(screen.getByText('Quản trị viên')).toBeDefined();
  });

  it('lọc chính xác các menu cho tài khoản Editor (chỉ hiển thị nội dung, ẩn đơn hàng, tài xế, cấu hình)', () => {
    const editorAuth = createMockAuth({
      user: {
        id: 2,
        email: 'editor@test.vn',
        fullName: 'Biên Tập Viên A',
        role: 'editor',
      },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthContext.Provider value={editorAuth}>
          <Sidebar />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Menu được phép truy cập
    expect(screen.getByText('Tổng quan')).toBeDefined();
    expect(screen.getByText('Tuyến đường & Giá')).toBeDefined();
    expect(screen.getByText('Bài viết')).toBeDefined();
    expect(screen.getByText('Trang nội dung')).toBeDefined();
    expect(screen.getByText('Thư viện Media')).toBeDefined();
    expect(screen.getByText('Chuyển hướng 301')).toBeDefined();

    // Menu bị ẩn
    expect(screen.queryByText('Đơn đặt xe')).toBeNull();
    expect(screen.queryByText('Tài xế')).toBeNull();
    expect(screen.queryByText('Bảng giá phụ')).toBeNull();
    expect(screen.queryByText('Cấu hình chung')).toBeNull();
    expect(screen.queryByText('Quản lý tài khoản')).toBeNull();

    // Badge vai trò
    expect(screen.getByText('Biên tập viên')).toBeDefined();
  });

  it('lọc chính xác các menu cho tài khoản Dispatcher (chỉ hiển thị đơn hàng & tài xế, ẩn nội dung)', () => {
    const dispatcherAuth = createMockAuth({
      user: {
        id: 3,
        email: 'dispatcher@test.vn',
        fullName: 'Điều Phối Viên B',
        role: 'dispatcher',
      },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthContext.Provider value={dispatcherAuth}>
          <Sidebar />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Menu được phép
    expect(screen.getByText('Tổng quan')).toBeDefined();
    expect(screen.getByText('Đơn đặt xe')).toBeDefined();
    expect(screen.getByText('Bảng giá phụ')).toBeDefined();

    // Menu bị ẩn hoặc đã bị loại bỏ
    expect(screen.queryByText('Tài xế')).toBeNull();
    expect(screen.queryByText('Tuyến đường & Giá')).toBeNull();
    expect(screen.queryByText('Bài viết')).toBeNull();
    expect(screen.queryByText('Trang nội dung')).toBeNull();
    expect(screen.queryByText('Thư viện Media')).toBeNull();
    expect(screen.queryByText('Chuyển hướng 301')).toBeNull();
    expect(screen.queryByText('Cấu hình chung')).toBeNull();
    expect(screen.queryByText('Quản lý tài khoản')).toBeNull();

    // Badge vai trò
    expect(screen.getByText('Điều phối viên')).toBeDefined();
  });

  it('hỗ trợ mở/đóng sidebar trên mobile và đóng khi nhấp backdrop', () => {
    const adminAuth = createMockAuth();
    const handleClose = vi.fn();

    const { rerender } = render(
      <MemoryRouter>
        <AuthContext.Provider value={adminAuth}>
          <Sidebar isOpen={false} onClose={handleClose} />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('sidebar-mobile-backdrop')).toBeNull();

    rerender(
      <MemoryRouter>
        <AuthContext.Provider value={adminAuth}>
          <Sidebar isOpen={true} onClose={handleClose} />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const backdrop = screen.getByTestId('sidebar-mobile-backdrop');
    expect(backdrop).toBeDefined();

    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe('Header Component', () => {
  it('hiển thị thông tin người dùng, vai trò tiếng Việt và tiêu đề trang hiện tại', () => {
    const mockAuth = createMockAuth({
      user: {
        id: 1,
        email: 'admin@test.vn',
        fullName: 'Trần Quản Trị',
        role: 'admin',
      },
    });

    render(
      <MemoryRouter initialEntries={['/bookings']}>
        <AuthContext.Provider value={mockAuth}>
          <Header />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Trần Quản Trị')).toBeDefined();
    expect(screen.getByText('Quản trị viên')).toBeDefined();
    expect(screen.getByText('Đơn đặt xe')).toBeDefined();
  });

  it('kích hoạt popup xác nhận trước khi đăng xuất và thực hiện logout khi xác nhận', async () => {
    const logoutMock = vi.fn().mockResolvedValue(undefined);
    const mockAuth = createMockAuth({ logout: logoutMock });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthContext.Provider value={mockAuth}>
          <Header />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const logoutBtn = screen.getByRole('button', { name: /Đăng xuất/i });
    fireEvent.click(logoutBtn);

    // Xác nhận dialog xuất hiện
    expect(screen.getByText('Đăng xuất khỏi hệ thống')).toBeDefined();
    expect(
      screen.getByText(/Bạn có chắc chắn muốn đăng xuất khỏi tài khoản quản trị/)
    ).toBeDefined();

    // Bấm nút xác nhận đăng xuất trong dialog
    const confirmButtons = screen.getAllByRole('button', { name: /Đăng xuất/i });
    // Nút xác nhận trong dialog (nút cuối cùng)
    const dialogConfirmBtn = confirmButtons[confirmButtons.length - 1];
    fireEvent.click(dialogConfirmBtn);

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
    });
  });

  it('hủy thao tác đăng xuất khi người dùng bấm "Ở lại"', () => {
    const logoutMock = vi.fn();
    const mockAuth = createMockAuth({ logout: logoutMock });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthContext.Provider value={mockAuth}>
          <Header />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Đăng xuất/i }));
    expect(screen.getByText('Đăng xuất khỏi hệ thống')).toBeDefined();

    const stayBtn = screen.getByRole('button', { name: /Ở lại/i });
    fireEvent.click(stayBtn);

    expect(screen.queryByText('Đăng xuất khỏi hệ thống')).toBeNull();
    expect(logoutMock).not.toHaveBeenCalled();
  });
});

describe('DashboardLayout Component', () => {
  it('kết nối đồng bộ Sidebar, Header và Outlet nội dung', () => {
    const mockAuth = createMockAuth();

    render(
      <MemoryRouter initialEntries={['/test-child']}>
        <AuthContext.Provider value={mockAuth}>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route
                path="/test-child"
                element={<div data-testid="child-content">Nội dung trang con</div>}
              />
            </Route>
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('child-content')).toBeDefined();
    expect(screen.getByText('Xe Ghép Liên Tỉnh')).toBeDefined();
    expect(screen.getByRole('button', { name: /Mở menu/i })).toBeDefined();
  });

  it('mở sidebar khi nhấn nút toggle trên header', () => {
    const mockAuth = createMockAuth();

    render(
      <MemoryRouter initialEntries={['/test-child']}>
        <AuthContext.Provider value={mockAuth}>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/test-child" element={<div>Trang con</div>} />
            </Route>
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const toggleBtn = screen.getByRole('button', { name: /Mở menu/i });
    fireEvent.click(toggleBtn);

    // Khi sidebar mở, backdrop mobile hiển thị
    expect(screen.getByTestId('sidebar-mobile-backdrop')).toBeDefined();
  });
});
