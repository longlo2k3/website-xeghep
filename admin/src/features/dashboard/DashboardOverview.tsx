import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  MapPin,
  FileText,
  Settings,
  Image,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { apiClient, getApiErrorMessage } from '@/lib/api-client';
import { formatDateTime, formatVND } from '@/lib/utils';
import type { BookingDoc } from '@/types/bookings';
import type { RouteDoc } from '@/types/routes';
import type { ArticleDoc } from '@/types/articles';
import type { PaginatedResponse } from '@/types/api';

const ROLE_NAME_MAP: Record<string, string> = {
  admin: 'Quản trị viên (Admin)',
  editor: 'Biên tập viên (Editor)',
  dispatcher: 'Điều phối viên (Dispatcher)',
};

export function DashboardOverview() {
  const { user, hasRole } = useAuth();

  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [routes, setRoutes] = useState<RouteDoc[]>([]);
  const [articles, setArticles] = useState<ArticleDoc[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [bookingsRes, routesRes, articlesRes] = await Promise.allSettled([
        apiClient.get<PaginatedResponse<BookingDoc> | BookingDoc[]>('/bookings', {
          params: { limit: 100, sort: '-createdAt' },
        }),
        apiClient.get<PaginatedResponse<RouteDoc> | RouteDoc[]>('/routes', {
          params: { limit: 100 },
        }),
        apiClient.get<PaginatedResponse<ArticleDoc> | ArticleDoc[]>('/articles', {
          params: { limit: 100 },
        }),
      ]);

      // Trích xuất bookings
      if (bookingsRes.status === 'fulfilled') {
        const data = bookingsRes.value.data;
        if (Array.isArray(data)) {
          setBookings(data);
        } else if (data && Array.isArray(data.docs)) {
          setBookings(data.docs);
        }
      }

      // Trích xuất routes
      if (routesRes.status === 'fulfilled') {
        const data = routesRes.value.data;
        if (Array.isArray(data)) {
          setRoutes(data);
        } else if (data && Array.isArray(data.docs)) {
          setRoutes(data.docs);
        }
      }

      // Trích xuất articles
      if (articlesRes.status === 'fulfilled') {
        const data = articlesRes.value.data;
        if (Array.isArray(data)) {
          setArticles(data);
        } else if (data && Array.isArray(data.docs)) {
          setArticles(data.docs);
        }
      }

      // Nếu tất cả API cùng lỗi
      if (
        bookingsRes.status === 'rejected' &&
        routesRes.status === 'rejected' &&
        articlesRes.status === 'rejected'
      ) {
        setError(getApiErrorMessage(bookingsRes.reason));
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // KPI Calculations
  const pendingBookingsCount = useMemo(() => {
    return bookings.filter((b) => b.status === 'pending').length;
  }, [bookings]);

  const activeRoutesCount = useMemo(() => {
    return routes.filter((r) => r.status === 'active').length;
  }, [routes]);

  const publishedArticlesCount = useMemo(() => {
    return articles.filter((a) => a.status === 'published').length;
  }, [articles]);

  const completedBookingsCount = useMemo(() => {
    return bookings.filter((b) => b.status === 'completed').length;
  }, [bookings]);

  // Widget: 5 đơn pending mới nhất cần xử lý
  const pendingBookingsList = useMemo(() => {
    return bookings.filter((b) => b.status === 'pending').slice(0, 5);
  }, [bookings]);

  // Widget: Tuyến xe nổi bật (Banner Top)
  const bannerTopRoutes = useMemo(() => {
    return routes.filter((r) => Boolean(r.isBannerTop));
  }, [routes]);

  const roleDisplayName = (user?.role && ROLE_NAME_MAP[user.role]) || user?.role || 'Người dùng';

  return (
    <div className="space-y-6">
      {/* 1. Lời chào mừng & Thông tin người dùng */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {roleDisplayName}
            </span>
            <span className="text-xs text-slate-500">Xe Ghép Liên Tỉnh</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Xin chào, {user?.fullName || user?.email}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Chào mừng bạn đến với hệ thống Quản trị CMS Xe Ghép Liên Tỉnh. Tổng quan hoạt động hôm nay:
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchDashboardData} className="text-rose-600 hover:text-rose-700 hover:bg-rose-100">
            Thử lại
          </Button>
        </div>
      )}

      {/* 2. Khối KPI Cards tóm tắt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-cards-grid">
        {/* KPI 1: Đơn chờ xác nhận (Màu cam nổi bật) */}
        <div
          data-testid="kpi-card-pending"
          className="p-5 rounded-2xl bg-white border border-amber-200 hover:border-amber-300 shadow-sm transition relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700">Chờ xác nhận</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-600">
              {isLoading ? '...' : pendingBookingsCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">Đơn đặt xe mới đang chờ duyệt</div>
          </div>
        </div>

        {/* KPI 2: Tuyến xe đang hoạt động */}
        <div
          data-testid="kpi-card-routes"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm transition relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tuyến xe hoạt động</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600">
              {isLoading ? '...' : activeRoutesCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">Tuyến xe liên tỉnh đang mở</div>
          </div>
        </div>

        {/* KPI 3: Bài viết đã xuất bản */}
        <div
          data-testid="kpi-card-articles"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-sm transition relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bài viết xuất bản</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-indigo-600">
              {isLoading ? '...' : publishedArticlesCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">Cẩm nang & tin tức trực tuyến</div>
          </div>
        </div>

        {/* KPI 4: Đơn hoàn thành */}
        <div
          data-testid="kpi-card-completed"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm transition relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Đơn hoàn thành</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600">
              {isLoading ? '...' : completedBookingsCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">Chuyến đi thành công</div>
          </div>
        </div>
      </div>

      {/* 3. Khối Lối tắt nhanh (Quick Actions) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm" data-testid="quick-actions-section">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
          Lối tắt nhanh
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {/* Duyệt đơn đặt xe: Admin & Dispatcher */}
          {hasRole(['admin', 'dispatcher']) && (
            <Link
              to="/bookings?status=pending"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-sm font-medium transition cursor-pointer"
            >
              <Car className="w-4 h-4" />
              <span>Duyệt đơn đặt xe</span>
              {pendingBookingsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-xs">
                  {pendingBookingsCount}
                </span>
              )}
            </Link>
          )}

          {/* Tạo tuyến đường mới: Admin & Editor */}
          {hasRole(['admin', 'editor']) && (
            <Link
              to="/routes/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-sm font-medium transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo tuyến đường mới</span>
            </Link>
          )}

          {/* Viết bài mới: Admin & Editor */}
          {hasRole(['admin', 'editor']) && (
            <Link
              to="/articles/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-sm font-medium transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Viết bài mới</span>
            </Link>
          )}

          {/* Thư viện Media: Admin & Editor */}
          {hasRole(['admin', 'editor']) && (
            <Link
              to="/media"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-sm font-medium transition cursor-pointer"
            >
              <Image className="w-4 h-4" />
              <span>Thư viện Media</span>
            </Link>
          )}

          {/* Cấu hình hệ thống: Chỉ Admin */}
          {hasRole('admin') && (
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-sm font-medium transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Cấu hình hệ thống</span>
            </Link>
          )}
        </div>
      </div>

      {/* 4. Hai khối Widget chính: Đơn mới cần xử lý & Tuyến Banner Top */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget 1: Đơn đặt xe mới nhất cần xử lý (Chiếm 2 cột) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900">
                  <Car className="w-5 h-5 text-amber-600" />
                  Đơn đặt xe mới nhất cần xử lý
                </CardTitle>
                <CardDescription>
                  Danh sách 5 đơn hàng trạng thái Chờ duyệt (Pending) gần đây nhất
                </CardDescription>
              </div>
              <Link
                to="/bookings?status=pending"
                className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium transition"
              >
                Xem tất cả ({pendingBookingsCount})
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                  Đang nạp danh sách đơn chờ xử lý...
                </div>
              ) : pendingBookingsList.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2" data-testid="empty-pending-bookings">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-sm font-medium text-slate-700">
                    Hiện không có đơn nào đang chờ duyệt
                  </p>
                  <p className="text-xs text-slate-500">
                    Tất cả đơn đặt xe đều đã được xác nhận hoặc điều phối thành công.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs" data-testid="pending-bookings-table">
                    <thead className="bg-slate-50 text-slate-600 font-medium uppercase border-y border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Mã đơn</th>
                        <th className="px-4 py-3">Tên khách</th>
                        <th className="px-4 py-3">Lộ trình</th>
                        <th className="px-4 py-3">Giờ đón</th>
                        <th className="px-4 py-3 text-right">Giá dự tính</th>
                        <th className="px-4 py-3 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingBookingsList.map((booking) => {
                        const routeName =
                          typeof booking.route === 'object' && booking.route?.name
                            ? booking.route.name
                            : `${booking.pickupLocation} → ${booking.dropoffLocation}`;

                        return (
                          <tr
                            key={booking.id}
                            className="hover:bg-slate-50/80 transition group"
                            data-testid={`booking-row-${booking.id}`}
                          >
                            <td className="px-4 py-3.5 font-medium text-amber-600 whitespace-nowrap">
                              {booking.bookingCode || `#${booking.id}`}
                            </td>
                            <td className="px-4 py-3.5 text-slate-900 font-medium whitespace-nowrap">
                              {booking.customerName}
                            </td>
                            <td className="px-4 py-3.5 text-slate-600 max-w-[200px] truncate" title={routeName}>
                              {routeName}
                            </td>
                            <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                              {formatDateTime(booking.pickupDatetime)}
                            </td>
                            <td className="px-4 py-3.5 text-right font-medium text-emerald-600 whitespace-nowrap">
                              {booking.estimatedPrice ? formatVND(booking.estimatedPrice) : 'Chưa có'}
                            </td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              <Link
                                to={`/bookings?search=${booking.bookingCode || booking.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition text-xs font-medium cursor-pointer"
                              >
                                Xem & Xử lý
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Widget 2: Tuyến xe nổi bật (Banner Top) (Chiếm 1 cột) */}
        <div className="space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  Tuyến xe nổi bật (Banner Top)
                </CardTitle>
                <CardDescription>
                  Các tuyến đang được ghim vị trí ưu tiên cao nhất
                </CardDescription>
              </div>
              <Link
                to="/routes"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition"
              >
                Tất cả tuyến
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="space-y-3 pt-2">
              {isLoading ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  Đang nạp danh sách tuyến nổi bật...
                </div>
              ) : bannerTopRoutes.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs" data-testid="empty-banner-routes">
                  Chưa có tuyến xe nào được ghim Banner Top.
                </div>
              ) : (
                bannerTopRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex items-center justify-between gap-3 group"
                    data-testid={`banner-route-${route.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition truncate">
                          {route.name}
                        </h4>
                        {route.bannerLabel && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
                            {route.bannerLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Cự ly: <strong className="text-slate-700">{route.distance || 'Đang cập nhật'}</strong></span>
                        <span>•</span>
                        <span>
                          {route.priceFrom ? (
                            <span className="text-emerald-600 font-semibold">{formatVND(route.priceFrom)}</span>
                          ) : (
                            <span className="text-slate-500">Liên hệ</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/routes/${route.id}`}
                      className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer shrink-0 shadow-sm"
                      title="Chỉnh sửa tuyến"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
