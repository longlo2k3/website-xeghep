import { useState } from 'react';
import { Settings, Building2, Receipt, Bell } from 'lucide-react';
import { CompanySettingsForm } from './CompanySettingsForm';
import { PricingSettingsForm } from './PricingSettingsForm';
import { NotificationSettingsForm } from './NotificationSettingsForm';
import { cn } from '@/lib/utils';

export type SettingsTab = 'company' | 'pricing' | 'notification';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Cấu hình Hệ thống</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị thông tin nhận diện doanh nghiệp, hotline, cam kết dịch vụ, hằng số giá cước và kênh thông báo tự động.
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 space-x-1">
        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer',
            activeTab === 'company'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          )}
        >
          <Building2 className="w-4 h-4" />
          Thông tin Doanh nghiệp & Thương hiệu
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer',
            activeTab === 'pricing'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          )}
        >
          <Receipt className="w-4 h-4" />
          Cấu hình Giá chung & Phụ phí
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notification')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer',
            activeTab === 'notification'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          )}
        >
          <Bell className="w-4 h-4" />
          Cấu hình Thông báo & Bot
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === 'company' && <CompanySettingsForm />}
        {activeTab === 'pricing' && <PricingSettingsForm />}
        {activeTab === 'notification' && <NotificationSettingsForm />}
      </div>
    </div>
  );
}

export default SettingsPage;
