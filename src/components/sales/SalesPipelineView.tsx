import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  Send,
  Plus,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  Building,
  DollarSign,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { useOrchestrator } from '../../context/OrchestratorContext';
import { DealStage, LeadRecord } from '../../types/orchestrator';

export const SalesPipelineView: React.FC = () => {
  const { leads, triggerSalesReminder, updateLeadStage, addLead, addLeadTag, removeLeadTag, currentRole } =
    useOrchestrator();

  const [showAddModal, setShowAddModal] = useState(false);
  const [tagInputForLeadId, setTagInputForLeadId] = useState<string | null>(null);
  const [customTag, setCustomTag] = useState('');

  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    dealValue: 25000,
    stage: 'Lead' as DealStage,
    assignedTo: 'Marcus Brody (Sales Lead)',
    notes: '',
    tags: ['Inbound Lead', 'Due Follow-up'],
  });

  const stages: DealStage[] = ['Lead', 'Contacted', 'Proposal', 'Closed-Won'];

  const totalValue = leads.reduce((sum, l) => sum + l.dealValue, 0);
  const inactiveCount = leads.filter((l) => l.inactiveHours > 48).length;

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.company) return;
    addLead(newLead);
    setShowAddModal(false);
    setNewLead({
      name: '',
      company: '',
      email: '',
      phone: '',
      dealValue: 25000,
      stage: 'Lead',
      assignedTo: 'Marcus Brody (Sales Lead)',
      notes: '',
      tags: ['Inbound Lead', 'Due Follow-up'],
    });
  };

  const handleAddTag = (leadId: string, tag: string) => {
    if (!tag.trim()) return;
    addLeadTag(leadId, tag.trim());
    setCustomTag('');
    setTagInputForLeadId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner (Glass Panel) */}
      <div className="glass-panel rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 border border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Lead & Sales Agent • CRM Pipeline & Automated Sales Reminders
              </h2>
              <p className="text-xs text-slate-300/80 mt-0.5">
                Qualifies inbound prospects, tracks deal tags (<span className="text-emerald-300">Paid Deposit</span>, <span className="text-amber-300">Follow-up Due</span>), and automates 48-hour inactivity reminder dispatches.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950 transition cursor-pointer border border-emerald-400/40"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Prospect</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Glass Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Total Active Pipeline</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            ${totalValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Synced with Google Sheets API (Real-time)</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Inactive Leads (&gt;48h Threshold)</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            {inactiveCount} {inactiveCount === 1 ? 'Lead' : 'Leads'}
          </div>
          <div className="text-[11px] text-amber-300/80 mt-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Automated Sales Reminders Armed</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Worker Agent Status</div>
          <div className="text-sm font-semibold text-slate-100 mt-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span>Lead & Sales Agent: Autonomous Dispatch Active</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            48h Polling Cadence via Notification_Service
          </div>
        </div>
      </div>

      {/* Sales Pipeline Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage);
          const stageSum = stageLeads.reduce((sum, l) => sum + l.dealValue, 0);

          return (
            <div
              key={stage}
              className="glass-panel rounded-2xl p-4 flex flex-col min-h-[460px] border border-white/10"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    {stage}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full glass-pill text-slate-300 font-bold">
                    {stageLeads.length}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  ${(stageSum / 1000).toFixed(0)}k
                </span>
              </div>

              {/* Lead Cards List */}
              <div className="flex-1 flex flex-col gap-3">
                {stageLeads.map((lead) => {
                  const isInactive = lead.inactiveHours > 48;
                  const isTagOpen = tagInputForLeadId === lead.id;

                  return (
                    <div
                      key={lead.id}
                      className={`p-4 rounded-2xl text-left transition-all ${
                        isInactive
                          ? 'glass-card border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-950/20'
                          : 'glass-card hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-xs font-bold text-white truncate">{lead.company}</h4>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          ${lead.dealValue.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 font-medium mb-2">
                        {lead.name}
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-400">
                        <div className="flex items-center space-x-1.5 truncate">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 truncate">
                          <Building className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{lead.assignedTo}</span>
                        </div>
                      </div>

                      {/* Tags List */}
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap gap-1 items-center">
                        {(lead.tags || []).map((t) => (
                          <span
                            key={t}
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[9px] font-medium transition ${
                              t.toLowerCase().includes('due') || t.toLowerCase().includes('overdue')
                                ? 'glass-tag-due'
                                : t.toLowerCase().includes('paid') || t.toLowerCase().includes('closed')
                                ? 'glass-tag-paid'
                                : 'glass-tag-default'
                            }`}
                          >
                            <span>{t}</span>
                            <button
                              onClick={() => removeLeadTag(lead.id, t)}
                              className="opacity-50 hover:opacity-100 transition"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}

                        {isTagOpen ? (
                          <div className="inline-flex items-center gap-1 mt-1">
                            <input
                              type="text"
                              value={customTag}
                              onChange={(e) => setCustomTag(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddTag(lead.id, customTag);
                              }}
                              placeholder="Tag name..."
                              autoFocus
                              className="w-20 px-1.5 py-0.5 text-[9px] bg-slate-950 border border-white/20 rounded text-white"
                            />
                            <button
                              onClick={() => handleAddTag(lead.id, customTag)}
                              className="px-1 text-[9px] bg-emerald-600 rounded text-white font-bold"
                            >
                              +
                            </button>
                            <button
                              onClick={() => setTagInputForLeadId(null)}
                              className="text-[9px] text-slate-400"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setTagInputForLeadId(lead.id);
                              setCustomTag('');
                            }}
                            className="px-1.5 py-0.5 rounded text-[9px] glass-pill text-slate-400 hover:text-white transition flex items-center gap-0.5"
                          >
                            <Plus className="w-2 h-2" />
                            <span>Tag</span>
                          </button>
                        )}
                      </div>

                      {/* Inactive Hours Badge & Reminder Dispatcher */}
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span
                            className={`flex items-center gap-1 font-mono font-medium ${
                              isInactive ? 'text-amber-400 font-bold' : 'text-slate-400'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>
                              {lead.inactiveHours}h inactive
                              {isInactive && ' (>48h alert)'}
                            </span>
                          </span>

                          {lead.lastReminderSent && (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Reminded</span>
                            </span>
                          )}
                        </div>

                        {/* Automated Reminder Button */}
                        <button
                          onClick={() => triggerSalesReminder(lead.id)}
                          className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition ${
                            isInactive
                              ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold shadow-md shadow-amber-950/40'
                              : 'glass-pill text-slate-300 hover:text-white'
                          }`}
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch Sales Reminder</span>
                        </button>
                      </div>

                      {/* Stage Move Controls */}
                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Move:</span>
                        <div className="flex gap-1">
                          {stages
                            .filter((s) => s !== lead.stage)
                            .map((s) => (
                              <button
                                key={s}
                                onClick={() => updateLeadStage(lead.id, s)}
                                className="px-1.5 py-0.5 rounded-lg glass-pill hover:bg-indigo-600 hover:text-white transition text-[9px] font-mono"
                              >
                                {s.slice(0, 4)}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {stageLeads.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-2xl text-slate-500 text-xs">
                    No leads in {stage}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Glass Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl border border-white/20">
            <h3 className="text-base font-bold text-white mb-4">Register New Prospect in CRM</h3>
            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  placeholder="Acme Corp"
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Lead Contact Name</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="jane@company.com"
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Deal Value ($)</label>
                  <input
                    type="number"
                    value={newLead.dealValue}
                    onChange={(e) => setNewLead({ ...newLead, dealValue: parseInt(e.target.value, 10) || 0 })}
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Assigned Sales Rep</label>
                <input
                  type="text"
                  value={newLead.assignedTo}
                  onChange={(e) => setNewLead({ ...newLead, assignedTo: e.target.value })}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl glass-pill text-slate-300 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-bold"
                >
                  Save & Sync to Sheets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
