import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  Send,
  Mail,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { apiClient, getApiErrorMessage } from '@/lib/api-client';
import type { NotificationSettings } from '@/types/settings';

export function NotificationSettingsForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailWebhookUrl, setEmailWebhookUrl] = useState('');
  const [emailTo, setEmailTo] = useState('');

  const [telegramTestResult, setTelegramTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [emailTestResult, setEmailTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setFeedback(null);
      const res = await apiClient.get<NotificationSettings>('/globals/notification_settings');
      const data = res.data;
      if (data) {
        setTelegramEnabled(data.telegramEnabled !== false);
        setTelegramBotToken(data.telegramBotToken || '');
        setTelegramChatId(data.telegramChatId || '');
        setEmailEnabled(data.emailEnabled !== false);
        setEmailWebhookUrl(data.emailWebhookUrl || '');
        setEmailTo(data.emailTo || '');
      }
    } catch (err) {
      console.error('[NotificationSettings] Lỗi khi nạp dữ liệu:', err);
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(err) || 'Không thể tải cấu hình thông báo từ máy chủ.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setFeedback(null);

      const payload: NotificationSettings = {
        telegramEnabled,
        telegramBotToken: telegramBotToken.trim(),
        telegramChatId: telegramChatId.trim(),
        emailEnabled,
        emailWebhookUrl: emailWebhookUrl.trim(),
        emailTo: emailTo.trim(),
      };

      await apiClient.post('/globals/notification_settings', payload);
      setFeedback({
        type: 'success',
        message: 'Đã lưu cấu hình thông báo thành công!',
      });
    } catch (err) {
      console.error('[NotificationSettings] Lỗi khi lưu cấu hình:', err);
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(err) || 'Không thể lưu cấu hình thông báo.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    try {
      setIsTestingTelegram(true);
      setTelegramTestResult(null);

      const res = await apiClient.post<any>('/v1/notify/test', {
        channel: 'telegram',
        telegram: {
          botToken: telegramBotToken.trim(),
          chatId: telegramChatId.trim(),
        },
      });

      const message =
        res.data?.message || 'Gửi tin nhắn Telegram thử nghiệm thành công';
      setTelegramTestResult({ ok: true, message });
    } catch (err) {
      const message =
        getApiErrorMessage(err) ||
        'Lỗi kiểm tra kết nối Telegram: Không thể gửi tin nhắn.';
      setTelegramTestResult({ ok: false, message });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setIsTestingEmail(true);
      setEmailTestResult(null);

      const res = await apiClient.post<any>('/v1/notify/test', {
        channel: 'email',
        email: {
          webhookUrl: emailWebhookUrl.trim(),
          emailTo: emailTo.trim(),
        },
      });

      const message =
        res.data?.message || 'Gửi thử nghiệm Email thành công';
      setEmailTestResult({ ok: true, message });
    } catch (err) {
      const message =
        getApiErrorMessage(err) ||
        'Lỗi kiểm tra Webhook Email: Không thể gửi email thử nghiệm.';
      setEmailTestResult({ ok: false, message });
    } finally {
      setIsTestingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Đang tải cấu hình thông báo...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{feedback.message}</div>
        </div>
      )}

      {/* Card 1: Telegram Bot */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Kênh Telegram Bot
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Tự động gửi thông tin chi tiết đơn đặt xe mới tới nhóm điều hành Telegram.
                </CardDescription>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={telegramEnabled}
                onChange={(e) => setTelegramEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-2 text-xs font-semibold text-slate-700">
                {telegramEnabled ? 'Đang bật' : 'Đang tắt'}
              </span>
            </label>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Telegram Bot Token
              </label>
              <div className="relative">
                <Input
                  type={showToken ? 'text' : 'password'}
                  placeholder="Ví dụ: 123456789:ABCdef..."
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showToken ? 'Ẩn Token' : 'Hiện Token'}
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Lấy từ <b>@BotFather</b>. Để trống sẽ dùng giá trị trong biến môi trường máy chủ.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Telegram Chat ID / Group ID
              </label>
              <Input
                type="text"
                placeholder="Ví dụ: -100123456789 hoặc 987654321"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                ID nhóm hoặc người nhận (nhóm thường bắt đầu bằng dấu <code>-</code> hoặc <code>-100</code>).
              </p>
            </div>
          </div>

          {/* Test Telegram action */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isTestingTelegram}
              onClick={handleTestTelegram}
              className="text-xs font-medium cursor-pointer"
            >
              {isTestingTelegram ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Đang kiểm tra kết nối...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  Gửi thử nghiệm Telegram
                </>
              )}
            </Button>

            {telegramTestResult && (
              <div
                className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                  telegramTestResult.ok
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {telegramTestResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{telegramTestResult.message}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Email Fallback */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Kênh Email Fallback (Dự phòng)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Gửi cảnh báo khẩn cấp khi gửi Telegram thất bại đủ 3 lần để tránh sót đơn khách.
                </CardDescription>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              <span className="ml-2 text-xs font-semibold text-slate-700">
                {emailEnabled ? 'Đang bật' : 'Đang tắt'}
              </span>
            </label>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Webhook URL
              </label>
              <Input
                type="url"
                placeholder="https://hooks.zapier.com/... hoặc endpoint relay"
                value={emailWebhookUrl}
                onChange={(e) => setEmailWebhookUrl(e.target.value)}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Webhook tiếp nhận gửi email tự động. Để trống sẽ dùng giá trị trong biến môi trường.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email nhận thông báo
              </label>
              <Input
                type="email"
                placeholder="dieuhanh@xegheplientinh.vn"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Hộp thư tiếp nhận thông báo sự cố đơn hàng khi Telegram không khả dụng.
              </p>
            </div>
          </div>

          {/* Test Email action */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isTestingEmail}
              onClick={handleTestEmail}
              className="text-xs font-medium cursor-pointer"
            >
              {isTestingEmail ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Đang kiểm tra kết nối...
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                  Gửi thử nghiệm Email
                </>
              )}
            </Button>

            {emailTestResult && (
              <div
                className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                  emailTestResult.ok
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {emailTestResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{emailTestResult.message}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Thông tin chính sách retry tự động */}
      <Card className="border-blue-100 bg-blue-50/40">
        <CardContent className="pt-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">
              Quy chế vận hành thông báo tự động (Hiến pháp §2.5 / FR-B04):
            </p>
            <p>
              • Tiến trình nền chạy ngầm mỗi 5 giây quét các đơn đặt xe chưa gửi thông báo.
            </p>
            <p>
              • Chu kỳ thử lại tự động khi gửi lỗi: <b>Lần 1: sau 5s</b> → <b>Lần 2: sau 30s</b> → <b>Lần 3: sau 2 phút</b>.
            </p>
            <p>
              • Khi đạt tối đa 3 lần thất bại, hệ thống tự động kích hoạt kênh Email Fallback để báo động cho nhân sự điều hành.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer px-6"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu cấu hình...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Lưu cấu hình thông báo
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default NotificationSettingsForm;
