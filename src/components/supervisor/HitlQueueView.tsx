import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertTriangle,
  FileText,
  Lock,
  ExternalLink,
  Sparkles,
  Bell,
  Cpu,
} from 'lucide-react';
import { useOrchestrator } from '../../context/OrchestratorContext';

export const HitlQueueView: React.FC = () => {
  const { pendingHITL, approveHITL, rejectHITL, currentRole, simulateWebhookDispatch } =
    useOrchestrator();

  const [approvalNote, setApprovalNote] = useState<Record<string, string>>({});
  const [isDispatchingWebhook, setIsDispatchingWebhook] = useState(false);

  const pendingList = pendingHITL.filter((h) => h.status === 'PENDING');
  const resolvedList = pendingHITL.filter((h) => h.status !== 'PENDING');

  const handleApprove = (id: string) => {
    approveHITL(id, approvalNote[id] || 'Executive Sign-off verified by Owner');
  };

  const handleReject = (id: string) => {
    rejectHITL(id, approvalNote[id] || 'Unauthorized threshold transaction aborted');
  };

  const handleTestWebhook = async () => {
    setIsDispatchingWebhook(true);
    await simulateWebhookDispatch('Executive HITL Alert: High Stake Checkpoint Triggered', {
      timestamp: new Date().toISOString(),
      recipient: 'Bhuvang (Founder)',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/X001',
      pendingApprovals: pendingList.length,
    });
    setIsDispatchingWebhook(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner (Glass Panel) */}
      <div className="glass-panel rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 border border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-lg shadow-rose-500/10">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Supervisor & Human-in-the-Loop (HITL) Agent • Executive Sign-off Queue
              </h2>
              <p className="text-xs text-slate-300/80 mt-0.5">
                Intercepts high-stakes transactions (discounts &gt;20%, payouts &gt;$500, critical comms), pausing workflow execution until business owner grants sign-off.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTestWebhook}
            disabled={isDispatchingWebhook}
            className="px-4 py-2.5 rounded-xl glass-pill hover:bg-white/10 text-slate-200 border border-white/15 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Webhook Dispatch (Slack/Phone)</span>
          </button>
        </div>
      </div>

      {/* Checkpoint Governance Rules Reminder Bar (Glass Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-2xl glass-card flex items-start space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-rose-400 mt-1 shrink-0 shadow-[0_0_8px_#f43f5e]" />
          <div>
            <div className="font-semibold text-slate-200">Rule 1: Point Discounts &gt; 20%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Standard autonomous redemptions capped at 20%. Higher rates pause workflow at node.
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card flex items-start space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0 shadow-[0_0_8px_#f59e0b]" />
          <div>
            <div className="font-semibold text-slate-200">Rule 2: Expense Payouts &gt; $500</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Vendor payments, cloud bills, or reimbursements over $500 require Owner 1-click authorization.
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card flex items-start space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1 shrink-0 shadow-[0_0_8px_#06b6d4]" />
          <div>
            <div className="font-semibold text-slate-200">Rule 3: External High-Risk Comms</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Bulk email blasts or policy shift communications are paused for executive copy approval.
            </div>
          </div>
        </div>
      </div>

      {/* Pending Checkpoints List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Pending Authorizations</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300">
              {pendingList.length}
            </span>
          </h3>
          {currentRole !== 'Admin' && (
            <span className="text-xs text-rose-400 font-mono">
              ⚠️ Simulated Role: {currentRole} (Only Admin can approve/reject)
            </span>
          )}
        </div>

        {pendingList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-2xl bg-slate-900/40">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium text-slate-300">All Checkpoints Clear</p>
            <p className="text-xs text-slate-500 mt-1">
              No autonomous transactions currently exceed safety thresholds. All worker agents executing smoothly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingList.map((req) => (
              <div
                key={req.id}
                className="bg-[#0e1424] border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl shadow-amber-950/20 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {req.triggerType}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Task Node: {req.taskId}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">{req.taskTitle}</h4>
                    <p className="text-xs text-amber-200 mt-1 flex items-center gap-1.5 font-medium">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{req.reason}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-rose-950/80 border border-rose-500/40 text-rose-300">
                      Risk Level: {req.riskScore}
                    </span>
                  </div>
                </div>

                {/* Payload details box */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">Transaction Payload</div>
                  <pre className="text-cyan-300 overflow-x-auto">
                    {JSON.stringify(req.payload, null, 2)}
                  </pre>
                </div>

                {/* Action Controls */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-[240px]">
                    <input
                      type="text"
                      placeholder="Optional authorization note (e.g. Approved per Q4 Budget)..."
                      value={approvalNote[req.id] || ''}
                      onChange={(e) =>
                        setApprovalNote({ ...approvalNote, [req.id]: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-4 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 font-semibold text-xs transition cursor-pointer"
                    >
                      Reject & Abort
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-950 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>One-Click Sign-Off</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Resolved Checkpoints */}
      {resolvedList.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Resolved HITL Checkpoints Audit History
          </h3>
          <div className="space-y-2">
            {resolvedList.map((res) => (
              <div
                key={res.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{res.taskTitle}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {res.resolutionNote} • Resolved by {res.resolvedBy}
                  </div>
                </div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      res.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
