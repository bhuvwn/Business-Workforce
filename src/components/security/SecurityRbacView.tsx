import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  Key,
  Check,
  X,
  Search,
  FileText,
  Terminal,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { useOrchestrator } from '../../context/OrchestratorContext';
import { UserRole } from '../../types/orchestrator';

export const SecurityRbacView: React.FC = () => {
  const { auditLogs, currentRole, setCurrentRole, checkPermission } = useOrchestrator();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const rbacMatrix = [
    {
      tool: 'Auth_Service',
      desc: 'Token validation, session generation, privilege escalation',
      admin: true,
      sales: false,
      finance: false,
      customer: false,
    },
    {
      tool: 'CRM_API',
      desc: 'Prospect qualification, deal stages, 48h sales reminders',
      admin: true,
      sales: true,
      finance: false,
      customer: false,
    },
    {
      tool: 'Google_Sheets_API',
      desc: 'Corporate expense ledger, invoice archiving, payment logs',
      admin: true,
      sales: false,
      finance: true,
      customer: false,
    },
    {
      tool: 'Notification_Service',
      desc: 'Automated email, SMS, Slack, webhook dispatchers',
      admin: true,
      sales: true,
      finance: true,
      customer: false,
    },
    {
      tool: 'Loyalty_Database',
      desc: 'Points accretion (1pt/$10), customer balance, discount redemption',
      admin: true,
      sales: false,
      finance: false,
      customer: true,
    },
  ];

  const handleTestBreach = () => {
    // Attempt an unauthorized action to test Security Agent
    checkPermission(['Admin'], 'EMERGENCY_FUND_DISBURSEMENT', 'Google_Sheets_API');
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (filterStatus !== 'ALL' && log.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.actor.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.tool.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner (Glass Panel) */}
      <div className="glass-panel rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 border border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Security & Auth Agent • Role-Based Access Control (RBAC) & Audit Ledger
              </h2>
              <p className="text-xs text-slate-300/80 mt-0.5">
                Enforces strict token boundaries, intercepts unauthorized tool invocations, and produces an immutable cryptographic ledger of all agent activities.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTestBreach}
            className="px-4 py-2.5 rounded-xl glass-pill hover:bg-white/10 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Simulate RBAC Privilege Test</span>
          </button>
        </div>
      </div>

      {/* RBAC Matrix Card (Glass Panel) */}
      <div className="glass-panel rounded-2xl p-5 shadow-2xl space-y-4 border border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            <span>Enterprise RBAC Permission Matrix</span>
          </h3>
          <span className="text-xs text-slate-300">
            Active Role: <span className="font-bold text-indigo-400 glass-pill px-2.5 py-0.5 rounded-full">{currentRole}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Tool Interface</th>
                <th className="py-2.5 px-4">Capabilities & Scopes</th>
                <th className="py-2.5 px-4 text-center">Admin (Owner)</th>
                <th className="py-2.5 px-4 text-center">Sales Rep</th>
                <th className="py-2.5 px-4 text-center">Finance Manager</th>
                <th className="py-2.5 px-4 text-center">Customer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {rbacMatrix.map((row) => (
                <tr key={row.tool} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-4 font-mono font-bold text-purple-300">{row.tool}</td>
                  <td className="py-2.5 px-4 text-slate-400 text-[11px]">{row.desc}</td>
                  <td className="py-2.5 px-4 text-center">
                    {row.admin ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {row.sales ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {row.finance ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {row.customer ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Ledger */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Immutable Security Audit Ledger</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographically hashed events across all worker agents and human sign-offs.
            </p>
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit records..."
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
            >
              <option value="ALL">All Statuses</option>
              <option value="ALLOWED">Allowed</option>
              <option value="DENIED">Denied</option>
              <option value="FLAGGED">Flagged</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor & Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Tool Interface</th>
                <th className="py-2.5 px-3">Target Details</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Verification Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-200">{log.actor}</div>
                    <span className="text-[10px] text-slate-400 font-mono">[{log.role}]</span>
                  </td>

                  <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-indigo-300">
                    {log.action}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{log.tool}</td>

                  <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate">{log.target}</td>

                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'ALLOWED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : log.status === 'FLAGGED'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono text-[10px] text-slate-500">
                    {log.hash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
