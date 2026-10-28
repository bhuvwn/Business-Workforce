/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OrchestratorProvider } from './context/OrchestratorContext';
import { Header } from './components/common/Header';
import { NotificationBanner } from './components/common/NotificationBanner';
import { CommandDeck } from './components/orchestrator/CommandDeck';
import { SalesPipelineView } from './components/sales/SalesPipelineView';
import { FinanceTrackerView } from './components/finance/FinanceTrackerView';
import { LoyaltyAndHelplineView } from './components/loyalty/LoyaltyAndHelplineView';
import { HitlQueueView } from './components/supervisor/HitlQueueView';
import { SecurityRbacView } from './components/security/SecurityRbacView';
import { AgentsRosterView } from './components/agents/AgentsRosterView';
import { ShieldCheck, Zap, Bot, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('orchestrator');

  return (
    <OrchestratorProvider>
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
        {/* Ambient Glass Glow Orbs */}
        <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full ambient-glow-indigo blur-[120px] pointer-events-none -z-10" />
        <div className="fixed top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full ambient-glow-cyan blur-[140px] pointer-events-none -z-10" />
        <div className="fixed bottom-[-10%] left-[25%] w-[550px] h-[550px] rounded-full ambient-glow-rose blur-[130px] pointer-events-none -z-10" />

        {/* Subtle Cyber Glass Grid Mesh */}
        <div className="fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none -z-10" />

        {/* Top Executive Header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Global Notification Banner */}
        <NotificationBanner />

        {/* Main Content Area */}
        <main className="flex-1 relative z-10">
          {activeTab === 'orchestrator' && <CommandDeck />}
          {activeTab === 'sales' && <SalesPipelineView />}
          {activeTab === 'finance' && <FinanceTrackerView />}
          {activeTab === 'loyalty' && <LoyaltyAndHelplineView />}
          {activeTab === 'hitl' && <HitlQueueView />}
          {activeTab === 'security' && <SecurityRbacView />}
          {activeTab === 'agents' && <AgentsRosterView />}
        </main>

        {/* Executive Command Center Footer */}
        <footer className="border-t border-slate-800/80 bg-[#060a14] py-4 text-xs text-slate-500 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-slate-300">AegisOps Autonomous Multi-Agent Command Core</span>
              <span>• Dedicated Business Owner Instance</span>
            </div>

            <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>6 Specialized Worker Agents Active</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>RBAC & HITL Governance Enforced</span>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </OrchestratorProvider>
  );
}
