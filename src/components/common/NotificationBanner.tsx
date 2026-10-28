import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useOrchestrator } from '../../context/OrchestratorContext';

export const NotificationBanner: React.FC = () => {
  const { notificationBanner, clearNotificationBanner } = useOrchestrator();

  if (!notificationBanner) return null;

  const bgStyles = {
    info: 'bg-indigo-950/90 border-indigo-500/40 text-indigo-200',
    warning: 'bg-amber-950/90 border-amber-500/40 text-amber-200',
    success: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200',
    danger: 'bg-rose-950/90 border-rose-500/40 text-rose-200',
  }[notificationBanner.type];

  const Icon = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle2,
    danger: AlertCircle,
  }[notificationBanner.type];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
      <div
        className={`flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md shadow-lg transition-all ${bgStyles}`}
      >
        <div className="flex items-center space-x-3">
          <div className="shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-xs tracking-wide uppercase mr-2 opacity-90">
              {notificationBanner.title}
            </span>
            <span className="text-xs">{notificationBanner.message}</span>
          </div>
        </div>
        <button
          onClick={clearNotificationBanner}
          className="text-current opacity-70 hover:opacity-100 p-1 rounded-lg hover:bg-black/20 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
