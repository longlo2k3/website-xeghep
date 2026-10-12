import { type ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  FileText,
  Layers,
  Image,
  Receipt,
  ArrowRightLeft,
  Settings,
  Users,
  X,
  Shield,
  type LucideProps,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types/auth';
import { cn } from '@/lib/utils';

export interface NavItemConfig {
  name: string;
  href: string;
  icon: ComponentType<LucideProps>;
  roles: Role[];
}

export const navItems: NavItemConfig[] = [
  {
    name: 'Tổng quan',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'editor', 'dispatcher'],
  },
  {
    name: 'Đơn đặt xe',
    href: '/bookings',
    icon: CalendarCheck,
    roles: ['admin', 'dispatcher'],
  },
  {
    name: 'Tuyến đường & Giá',
    href: '/routes',
    icon: MapPin,
    roles: ['admin', 'editor'],
  },
  {
    name: 'Bài viết',
    href: '/articles',
    icon: FileText,
    roles: ['admin', 'editor'],
  },
  {
    name: 'Trang nội dung',
    href: '/pages',
    icon: Layers,
    roles: ['admin', 'editor'],
  },
  {
    name: 'Thư viện Media',
    href: '/media',
    icon: Image,
    roles: ['admin', 'editor'],
  },
  {
    name: 'Bảng giá phụ',
    href: '/pricing',
    icon: Receipt,
    roles: ['admin', 'dispatcher'],
  },
  {
    name: 'Chuyển hướng 301',
    href: '/redirects',
    icon: ArrowRightLeft,
    roles: ['admin', 'editor'],
  },
  {
    name: 'Cấu hình chung',
    href: '/settings',
    icon: Settings,
    roles: ['admin'],
  },
  {
    name: 'Quản lý tài khoản',
    href: '/users',
    icon: Users,
    roles: ['admin'],
  },
];

export const roleBadgeMap: Record<Role, { label: string; className: string }> = {
  admin: {
    label: 'Quản trị viên',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  editor: {
    label: 'Biên tập viên',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  dispatcher: {
    label: 'Điều phối viên',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ isOpen = false, onClose, className }: SidebarProps) {
  const { user, hasRole } = useAuth();

  // Filter navigation items by role
  const visibleNavItems = navItems.filter((item) => hasRole(item.roles));

  const roleInfo = user?.role ? roleBadgeMap[user.role] : null;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          data-testid="sidebar-mobile-backdrop"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        data-testid="sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out',
          // Desktop: always docked
          'lg:translate-x-0 lg:static lg:h-screen lg:shrink-0',
          // Mobile: slide in/out
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                Xe Ghép Liên Tỉnh
              </h1>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Admin CMS
              </p>
            </div>
          </div>

          {/* Close button for Mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Đóng thanh điều hướng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Menu quản trị">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group',
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                      )}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card in Sidebar Footer */}
        {user && (
          <div className="p-3 border-t border-slate-100 shrink-0">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user.fullName ? user.fullName[0] : user.email[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user.fullName || user.email}
                </p>
                {roleInfo && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border',
                      roleInfo.className
                    )}
                  >
                    <Shield className="w-2.5 h-2.5" />
                    {roleInfo.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;
