import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  LogOut,
  User as UserIcon,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from './ConfirmDialog';
import { roleBadgeMap } from './Sidebar';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  onToggleSidebar?: () => void;
  className?: string;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/bookings': 'Đơn đặt xe',
  '/routes': 'Tuyến đường & Giá',
  '/articles': 'Bài viết',
  '/pages': 'Trang nội dung',
  '/media': 'Thư viện Media',
  '/drivers': 'Tài xế',
  '/pricing': 'Bảng giá phụ',
  '/redirects': 'Chuyển hướng 301',
  '/settings': 'Cấu hình chung',
  '/users': 'Quản lý tài khoản',
};

export function Header({ onToggleSidebar, className }: HeaderProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Match current path to title
  const currentPath = location.pathname;
  const matchedKey = Object.keys(routeTitles).find(
    (key) => currentPath === key || currentPath.startsWith(key + '/')
  );
  const pageTitle = matchedKey ? routeTitles[matchedKey] : 'Quản trị';

  const roleInfo = user?.role ? roleBadgeMap[user.role] : null;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutConfirm(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header
        className={cn(
          'h-16 px-4 sm:px-6 bg-white/95 border-b border-slate-200 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4',
          className
        )}
      >
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              to="/dashboard"
              className="text-slate-500 hover:text-slate-800 transition font-medium hidden sm:inline-block"
            >
              CMS
            </Link>
            {matchedKey && matchedKey !== '/dashboard' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
                <span className="font-semibold text-slate-900">{pageTitle}</span>
              </>
            )}
            {(!matchedKey || matchedKey === '/dashboard') && (
              <span className="font-semibold text-slate-900 text-sm sm:text-base">
                {pageTitle}
              </span>
            )}
          </div>
        </div>

        {/* Right: User Info & Logout Button */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <UserIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-medium text-slate-800 truncate max-w-[150px]">
                {user.fullName || user.email}
              </span>
              {roleInfo && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border',
                    roleInfo.className
                  )}
                >
                  <Shield className="w-2.5 h-2.5" />
                  {roleInfo.label}
                </span>
              )}
            </div>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowLogoutConfirm(true)}
            className="text-xs h-8 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-none"
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Đăng xuất khỏi hệ thống"
        description="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản quản trị hiện tại không?"
        confirmText="Đăng xuất"
        cancelText="Ở lại"
        variant="destructive"
        isLoading={isLoggingOut}
      />
    </>
  );
}

export default Header;
