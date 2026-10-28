import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Send,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  FileX,
  CreditCard,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  Tag,
  X,
  Check,
  Filter,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useOrchestrator } from '../../context/OrchestratorContext';
import { ExpenseRecord } from '../../types/orchestrator';

export const FinanceTrackerView: React.FC = () => {
  const {
    expenses,
    triggerExpenseReminder,
    addExpense,
    addExpenseTag,
    removeExpenseTag,
    toggleExpensePaidStatus,
    currentRole,
  } = useOrchestrator();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');
  const [tagInputForExpenseId, setTagInputForExpenseId] = useState<string | null>(null);
  const [customTagText, setCustomTagText] = useState('');

  const [newExp, setNewExp] = useState({
    title: '',
    category: 'Infrastructure & Cloud' as ExpenseRecord['category'],
    amount: 750,
    vendor: '',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    receiptAttached: true,
    recurring: true,
    frequency: 'Monthly' as const,
    tags: ['Due', 'Infrastructure'],
  });

  const [newExpenseTagInput, setNewExpenseTagInput] = useState('');

  const totalOutstanding = expenses
    .filter((e) => !e.isPaid)
    .reduce((sum, e) => sum + e.amount, 0);

  const overThresholdCount = expenses.filter(
    (e) => !e.isPaid && e.amount > 500
  ).length;

  const missingReceiptsCount = expenses.filter((e) => !e.receiptAttached).length;

  // Extract all unique tags across all expenses
  const allTags = Array.from(
    new Set(expenses.flatMap((e) => e.tags || []))
  );

  // Common quick tag suggestions
  const suggestedTags = ['Paid', 'Due', 'Overdue', 'High Priority', 'Tax Deductible', 'Receipt Verified', 'Q4 Budget'];

  const filteredExpenses = expenses.filter((exp) => {
    if (selectedTagFilter === 'ALL') return true;
    return (exp.tags || []).includes(selectedTagFilter);
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.title || !newExp.vendor) return;

    // ensure initial status tag is present
    const baseTags = newExp.tags || [];
    const statusTag = newExp.amount > 500 ? 'High Stakes' : 'Due';
    const finalTags = Array.from(new Set([...baseTags, statusTag, 'Due']));

    addExpense({
      ...newExp,
      tags: finalTags,
    });
    setShowAddModal(false);
    setNewExp({
      title: '',
      category: 'Infrastructure & Cloud',
      amount: 750,
      vendor: '',
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      receiptAttached: true,
      recurring: true,
      frequency: 'Monthly',
      tags: ['Due', 'Infrastructure'],
    });
  };

  const handleAddTagToExpense = (expenseId: string, tag: string) => {
    if (!tag.trim()) return;
    addExpenseTag(expenseId, tag.trim());
    setCustomTagText('');
    setTagInputForExpenseId(null);
  };

  const getTagBadgeClass = (tag: string) => {
    const lower = tag.toLowerCase();
    if (lower === 'paid') return 'glass-tag-paid font-semibold';
    if (lower === 'due') return 'glass-tag-due font-semibold';
    if (lower === 'overdue' || lower === 'urgent') return 'glass-tag-overdue font-semibold';
    if (lower === 'high stakes' || lower === 'pending approval')
      return 'bg-purple-500/15 text-purple-300 border border-purple-500/35 shadow-[0_0_10px_rgba(168,85,247,0.15)] font-medium';
    return 'glass-tag-default';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner (Frosted Glass Panel) */}
      <div className="glass-panel rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-400/10 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Finance & Expense Agent</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                  Tag & Ledger Engine
                </span>
              </h2>
              <p className="text-xs text-slate-300/80 mt-0.5">
                Categorizes expenditures, monitors $500 payout thresholds, manages <span className="text-amber-300 font-semibold">Paid / Due / Overdue</span> tags, and issues automated payment reminders.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition cursor-pointer border border-amber-400/40"
          >
            <Plus className="w-4 h-4" />
            <span>Log Business Expense</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Glass Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Total Pending Outflow</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1 flex items-baseline gap-1">
            <span>${totalOutstanding.toLocaleString()}</span>
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>{expenses.filter((e) => !e.isPaid).length} Accounts Currently Due</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">High-Stake Payouts (&gt;$500)</div>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-1 flex items-center gap-2">
            <span>{overThresholdCount}</span>
            <span className="text-[11px] font-normal text-rose-300 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30">
              HITL Guard Active
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Mandatory Owner Sign-Off Threshold</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Tagged Invoices & Status</div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
            {allTags.length} <span className="text-xs text-slate-400 font-normal">Active Tags</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            <span>{missingReceiptsCount} Missing Receipt flags active</span>
          </div>
        </div>
      </div>

      {/* Interactive Tag Filter Bar (Glass Pill Bar) */}
      <div className="glass-card p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Filter by Tag:</span>
          </div>

          <button
            onClick={() => setSelectedTagFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition shrink-0 ${
              selectedTagFilter === 'ALL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'glass-pill text-slate-300 hover:text-white'
            }`}
          >
            All Expenses ({expenses.length})
          </button>

          {['Paid', 'Due', 'Overdue', 'High Stakes', 'Missing Receipt', 'Recurring', 'Urgent'].map((tag) => {
            const count = expenses.filter((e) => (e.tags || []).includes(tag)).length;
            if (count === 0 && !allTags.includes(tag)) return null;
            const isSelected = selectedTagFilter === tag;

            return (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(tag)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition flex items-center space-x-1.5 shrink-0 ${
                  isSelected
                    ? getTagBadgeClass(tag)
                    : 'glass-pill text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tag}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-400 font-mono hidden md:inline-block">
          Showing {filteredExpenses.length} of {expenses.length} records
        </span>
      </div>

      {/* Expenses Glass Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Corporate Expenditure Ledger</span>
            <span className="text-xs font-normal text-slate-400">• Google_Sheets_API Synced</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {expenses.length} Records Cataloged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10 font-semibold backdrop-blur-md">
              <tr>
                <th className="py-3 px-4">Expense Title / Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status & Action</th>
                <th className="py-3 px-4">Tags (Paid, Due, Custom)</th>
                <th className="py-3 px-4 text-right">Autonomous Reminder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredExpenses.map((exp) => {
                const isOverThreshold = exp.amount > 500;
                const isTagInputOpen = tagInputForExpenseId === exp.id;

                return (
                  <tr key={exp.id} className="hover:bg-white/[0.04] transition">
                    {/* Title & Vendor */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100">{exp.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-slate-300 font-medium">{exp.vendor}</span>
                        {exp.recurring && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
                            {exp.frequency}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg glass-pill text-slate-300 text-[11px]">
                        {exp.category}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                      ${exp.amount.toLocaleString()}{' '}
                      <span className="text-[10px] text-slate-500 font-normal">USD</span>
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{exp.dueDate}</span>
                      </div>
                    </td>

                    {/* Status & Quick Paid Toggle */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleExpensePaidStatus(exp.id)}
                          title="Click to toggle Paid / Due status"
                          className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                            exp.isPaid
                              ? 'glass-tag-paid hover:bg-emerald-500/20'
                              : 'glass-tag-due hover:bg-amber-500/20'
                          }`}
                        >
                          {exp.isPaid ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>PAID</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>DUE</span>
                            </>
                          )}
                        </button>

                        {isOverThreshold && !exp.isPaid && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            <span>&gt;$500</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Interactive Tag Management */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(exp.tags || []).map((t) => (
                          <span
                            key={t}
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] transition group ${getTagBadgeClass(
                              t
                            )}`}
                          >
                            <span>{t}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeExpenseTag(exp.id, t);
                              }}
                              className="opacity-40 group-hover:opacity-100 hover:text-white transition p-0.5"
                              title={`Remove tag ${t}`}
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}

                        {/* Add Tag Button or Input */}
                        {isTagInputOpen ? (
                          <div className="inline-flex items-center gap-1 mt-1">
                            <input
                              type="text"
                              value={customTagText}
                              onChange={(e) => setCustomTagText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddTagToExpense(exp.id, customTagText);
                                } else if (e.key === 'Escape') {
                                  setTagInputForExpenseId(null);
                                }
                              }}
                              placeholder="e.g. Paid, Due..."
                              autoFocus
                              className="w-24 px-2 py-0.5 text-[10px] bg-slate-950/80 border border-indigo-500/50 rounded text-white focus:outline-none"
                            />
                            <button
                              onClick={() => handleAddTagToExpense(exp.id, customTagText)}
                              className="px-1.5 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold"
                            >
                              +
                            </button>
                            <button
                              onClick={() => setTagInputForExpenseId(null)}
                              className="text-slate-400 hover:text-white text-[10px] px-1"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setTagInputForExpenseId(exp.id);
                              setCustomTagText('');
                            }}
                            className="px-2 py-0.5 rounded-lg text-[10px] text-slate-400 hover:text-slate-200 glass-pill hover:border-white/30 transition flex items-center space-x-1"
                            title="Add tag like Paid, Due, Overdue, Urgent..."
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>Tag</span>
                          </button>
                        )}
                      </div>

                      {/* Quick suggestions when tag input is active for this expense */}
                      {isTagInputOpen && (
                        <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-white/10">
                          {suggestedTags
                            .filter((t) => !(exp.tags || []).includes(t))
                            .slice(0, 4)
                            .map((st) => (
                              <button
                                key={st}
                                onClick={() => handleAddTagToExpense(exp.id, st)}
                                className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 hover:bg-white/15 text-slate-300 transition"
                              >
                                + {st}
                              </button>
                            ))}
                        </div>
                      )}
                    </td>

                    {/* Autonomous Reminder Action */}
                    <td className="py-3.5 px-4 text-right">
                      {!exp.isPaid ? (
                        <button
                          onClick={() => triggerExpenseReminder(exp.id)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5 transition ${
                            exp.reminderSent
                              ? 'glass-pill text-emerald-300 border border-emerald-500/30'
                              : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/40'
                          }`}
                        >
                          <Send className="w-3 h-3" />
                          <span>{exp.reminderSent ? 'Resend Alert' : 'Dispatch Reminder'}</span>
                        </button>
                      ) : (
                        <span className="text-emerald-400 text-xs font-medium flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Settled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Tag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">No expenses match the tag "{selectedTagFilter}"</p>
                    <button
                      onClick={() => setSelectedTagFilter('ALL')}
                      className="mt-2 text-xs text-amber-400 underline hover:text-amber-300"
                    >
                      Clear tag filter
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Glass Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>Log Corporate Expense & Set Tags</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300/80 mb-4">
              Expenditures above $500 will automatically pause for Business Owner review in the HITL Queue.
            </p>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Expense Title</label>
                <input
                  type="text"
                  required
                  value={newExp.title}
                  onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                  placeholder="e.g. AWS Production GPU Cluster"
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Vendor Name</label>
                <input
                  type="text"
                  required
                  value={newExp.vendor}
                  onChange={(e) => setNewExp({ ...newExp, vendor: e.target.value })}
                  placeholder="e.g. Amazon Web Services"
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Category</label>
                  <select
                    value={newExp.category}
                    onChange={(e) => setNewExp({ ...newExp, category: e.target.value as any })}
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="Infrastructure & Cloud">Infrastructure & Cloud</option>
                    <option value="SaaS Subscriptions">SaaS Subscriptions</option>
                    <option value="Vendor Services">Vendor Services</option>
                    <option value="Team Reimbursement">Team Reimbursement</option>
                    <option value="Marketing & Ad Spend">Marketing & Ad Spend</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Payout Amount ($ USD)</label>
                  <input
                    type="number"
                    value={newExp.amount}
                    onChange={(e) => setNewExp({ ...newExp, amount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-slate-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic HITL Warning in Form */}
              {newExp.amount > 500 && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-[11px] flex items-center space-x-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>
                    Amount exceeds $500! This payout will automatically trigger a Supervisor Human-in-the-Loop checkpoint.
                  </span>
                </div>
              )}

              {/* Tags Selector for New Expense */}
              <div>
                <label className="block text-slate-300 mb-1 font-medium flex items-center justify-between">
                  <span>Tags (Paid, Due, Overdue, etc.)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Click to toggle</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {suggestedTags.map((st) => {
                    const isSelected = (newExp.tags || []).includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          const current = newExp.tags || [];
                          const updated = isSelected
                            ? current.filter((t) => t !== st)
                            : [...current, st];
                          setNewExp({ ...newExp, tags: updated });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer ${
                          isSelected ? getTagBadgeClass(st) : 'glass-pill text-slate-400 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {st}
                      </button>
                    );
                  })}
                </div>

                {/* Custom tag input for new expense */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newExpenseTagInput}
                    onChange={(e) => setNewExpenseTagInput(e.target.value)}
                    placeholder="Add custom tag (e.g. Q4-Budget)..."
                    className="flex-1 glass-input rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newExpenseTagInput.trim()) return;
                      const current = newExp.tags || [];
                      if (!current.includes(newExpenseTagInput.trim())) {
                        setNewExp({ ...newExp, tags: [...current, newExpenseTagInput.trim()] });
                      }
                      setNewExpenseTagInput('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newExp.receiptAttached}
                    onChange={(e) => setNewExp({ ...newExp, receiptAttached: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Receipt Attached</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newExp.recurring}
                    onChange={(e) => setNewExp({ ...newExp, recurring: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Recurring Billing</span>
                </label>
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
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-950/50"
                >
                  Log Expense & Arm Reminders
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
