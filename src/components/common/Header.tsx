import React from 'react';
import {
  ShieldAlert,
  Bot,
  Zap,
  TrendingUp,
  Receipt,
  Gift,
  Clock,
  Sparkles,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { useOrchestrator } from '../../context/OrchestratorContext';
import { UserRole } from '../../types/orchestrator';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentRole,
    setCurrentRole,
    pendingHITL,
    leads,
    expenses,
    customers,
  } = useOrchestrator();

  const pendingApprovalsCount = pendingHITL.filter((h) => h.status === 'PENDING').length;

  const totalPipeline = leads.reduce((sum, l) => sum + l.dealValue, 0);
  const pendingExpensesTotal = expenses
    .filter((e) => !e.isPaid)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPoints = customers.reduce((sum, c) => sum + c.pointsBalance, 0);

  const roles: UserRole[] = ['Admin', 'Sales Rep', 'Finance Manager', 'Customer'];

  return (
    <header className="border-b border-white/10 bg-[#070b14]/75 backdrop-blur-2xl sticky top-0 z-40 shadow-2xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                AegisOps{' '}
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
                  GLASS HUD v2.8
                </span>
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full glass-pill text-slate-300 hidden sm:inline-block">
                Business Owner Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md">
              Autonomous Multi-Agent Orchestrator & Glassmorphic DAG Engine
            </p>
          </div>
        </div>

        {/* Live KPI Ticker (Glass Pills) */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="glass-card px-3.5 py-2 rounded-xl flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">Pipeline</div>
              <div className="font-semibold text-slate-100 font-mono">${(totalPipeline / 1000).toFixed(1)}k</div>
            </div>
          </div>

          <div className="glass-card px-3.5 py-2 rounded-xl flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">Due Outflow</div>
              <div className="font-semibold text-slate-100 font-mono">${pendingExpensesTotal.toLocaleString()}</div>
            </div>
          </div>

          <div className="glass-card px-3.5 py-2 rounded-xl flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Gift className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">Active Points</div>
              <div className="font-semibold text-slate-100 font-mono">{totalPoints.toLocaleString()} pts</div>
            </div>
          </div>
        </div>

        {/* Right Action & RBAC Role Switcher */}
        <div className="flex items-center space-x-3">
          {/* HITL Alerts button */}
          <button
            onClick={() => setActiveTab('hitl')}
            className={`relative flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              pendingApprovalsCount > 0
                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-200 hover:bg-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.35)] animate-pulse'
                : 'glass-pill text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>HITL Approvals</span>
            {pendingApprovalsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-md">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          {/* Role Switcher Pill */}
          <div className="relative group">
            <div className="flex items-center space-x-2.5 glass-card px-3 py-1.5 rounded-xl cursor-pointer hover:border-indigo-500/40 transition">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 flex items-center justify-center text-xs font-bold">
                {currentRole === 'Admin' ? 'CEO' : currentRole[0]}
              </div>
              <div className="text-left">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider leading-none">Simulating Role</div>
                <div className="text-xs font-semibold text-slate-200 leading-tight flex items-center gap-1 mt-0.5">
                  {currentRole === 'Admin' ? 'Founder (Admin)' : currentRole}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Glass Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-64 glass-panel rounded-2xl shadow-2xl py-2 hidden group-hover:block group-focus-within:block z-50 border border-white/15">
              <div className="px-3 py-1.5 border-b border-white/10 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Switch RBAC Role</span>
                <Lock className="w-3 h-3 text-slate-400" />
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => setCurrentRole(r)}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-white/10 transition ${
                    currentRole === r ? 'text-indigo-300 font-semibold bg-indigo-500/15' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div>{r === 'Admin' ? 'Business Owner (Admin)' : r}</div>
                    <div className="text-[10px] text-slate-400">
                      {r === 'Admin'
                        ? 'Full DAG dispatch & HITL sign-off'
                        : r === 'Sales Rep'
                        ? 'CRM & sales reminders only'
                        : r === 'Finance Manager'
                        ? 'Expense logs, tags & invoice reminders'
                        : 'Helpline & point redemption'}
                    </div>
                  </div>
                  {currentRole === r && <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Glass Bar) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center space-x-1.5 overflow-x-auto scrollbar-none border-t border-white/5 py-1">
        <button
          onClick={() => setActiveTab('orchestrator')}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'orchestrator'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Command Deck & DAG</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'sales'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Sales & Leads CRM</span>
          {leads.some((l) => l.inactiveHours > 48) && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" title="Inactive leads > 48h" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'finance'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Finance, Expenses & Tags</span>
        </button>

        <button
          onClick={() => setActiveTab('loyalty')}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'loyalty'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Helpline & Loyalty Points</span>
        </button>

        <button
          onClick={() => setActiveTab('hitl')}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'hitl'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Supervisor & HITL</span>
          {pendingApprovalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-200 font-mono text-[10px] font-bold">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'security'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Security, RBAC & Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'agents'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Worker Agents Roster</span>
        </button>
      </div>
    </header>
  );
};
