import React from 'react';
import {
  CheckCircle2,
  Clock,
  RotateCw,
  ShieldAlert,
  AlertOctagon,
  FileText,
  Terminal,
  Cpu,
  Layers,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { WorkflowTask } from '../../types/orchestrator';
import { useOrchestrator } from '../../context/OrchestratorContext';

interface TaskDetailDrawerProps {
  task: WorkflowTask | null;
  workflowId: string;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({ task, workflowId }) => {
  const { pendingHITL, approveHITL, rejectHITL, retryTask, currentRole } = useOrchestrator();

  if (!task) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 border border-slate-800 rounded-2xl bg-slate-900/40">
        <Layers className="w-10 h-10 mb-3 text-slate-600" />
        <p className="text-sm font-medium text-slate-400">No task selected</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Click any node in the Directed Acyclic Graph above to inspect tool parameters, API logs, and HITL state.
        </p>
      </div>
    );
  }

  const matchingHitl = pendingHITL.find((h) => h.taskId === task.id && h.status === 'PENDING');

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col h-full overflow-hidden shadow-2xl border border-white/15">
      {/* Header */}
      <div className="pb-4 border-b border-white/10 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {task.id}
            </span>
            <span className="text-xs font-semibold text-indigo-400">{task.agent}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-100">{task.title}</h3>
        </div>

        {/* Status indicator */}
        <div>
          {task.status === 'COMPLETED' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>COMPLETED</span>
            </span>
          )}
          {task.status === 'HITL_PAUSED' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-amber-300 bg-amber-950/90 border border-amber-400 flex items-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>HITL PAUSED</span>
            </span>
          )}
          {task.status === 'RUNNING' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-indigo-400 bg-indigo-950/80 border border-indigo-500/40 flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>EXECUTING</span>
            </span>
          )}
          {task.status === 'BLOCKED' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-rose-400 bg-rose-950/80 border border-rose-500/40 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>BLOCKED</span>
            </span>
          )}
          {task.status === 'PENDING' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium text-slate-400 bg-slate-800 border border-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>QUEUED</span>
            </span>
          )}
        </div>
      </div>

      {/* HITL Action Banner if paused */}
      {matchingHitl && (
        <div className="my-4 p-4 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-950/60 to-slate-900 shadow-lg">
          <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider mb-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Human-In-The-Loop Checkpoint Intercept</span>
          </div>
          <p className="text-xs text-amber-100 mb-3">{matchingHitl.reason}</p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => approveHITL(matchingHitl.id, 'Approved via Task Inspector')}
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950 transition"
            >
              <Check className="w-4 h-4" />
              <span>Approve & Resume DAG</span>
            </button>
            <button
              onClick={() => rejectHITL(matchingHitl.id, 'Aborted by Business Owner')}
              className="py-2 px-3 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 font-semibold text-xs flex items-center justify-center space-x-1.5 transition"
            >
              <X className="w-4 h-4" />
              <span>Reject & Block</span>
            </button>
          </div>
          {currentRole !== 'Admin' && (
            <p className="text-[10px] text-rose-400 mt-2 font-mono">
              ⚠️ Note: You are currently simulating role "{currentRole}". Only Admin/Owner can sign off.
            </p>
          )}
        </div>
      )}

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 text-xs">
        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg">
          <div className="text-[10px] text-slate-500 uppercase font-mono">Tool Interface</div>
          <div className="font-semibold text-slate-200 mt-0.5 truncate">{task.tool}</div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg">
          <div className="text-[10px] text-slate-500 uppercase font-mono">API Action</div>
          <div className="font-semibold text-slate-200 mt-0.5 truncate font-mono">{task.action}</div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg">
          <div className="text-[10px] text-slate-500 uppercase font-mono">Risk Level</div>
          <div className="font-semibold text-slate-200 mt-0.5">
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                task.riskScore === 'HIGH' || task.riskScore === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {task.riskScore}
            </span>
          </div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg">
          <div className="text-[10px] text-slate-500 uppercase font-mono">Retries</div>
          <div className="font-semibold text-slate-200 mt-0.5 font-mono">
            {task.retryCount}/{task.maxRetries}
          </div>
        </div>
      </div>

      {/* Tabs / Accordion Content: Parameters & Logs */}
      <div className="flex-1 flex flex-col min-h-0 space-y-3 mt-1">
        {/* Tool Parameters */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>Tool Parameters & Payload</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 overflow-auto text-[11px] font-mono text-cyan-300">
            <pre>{JSON.stringify(task.params, null, 2)}</pre>
          </div>
        </div>

        {/* Live Execution Logs Terminal */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Agent Execution Logs</span>
            </span>
            {task.status === 'BLOCKED' && (
              <button
                onClick={() => retryTask(workflowId, task.id)}
                className="text-[10px] text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" />
                <span>Retry (Exponential Backoff)</span>
              </button>
            )}
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 overflow-y-auto text-[11px] font-mono text-slate-300 space-y-1">
            {task.logs && task.logs.length > 0 ? (
              task.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-slate-600 select-none">{idx + 1}</span>
                  <span className={log.includes('✅') ? 'text-emerald-400' : log.includes('❌') ? 'text-rose-400' : log.includes('HITL') ? 'text-amber-400' : 'text-slate-300'}>
                    {log}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-slate-600 italic">No execution logs yet.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
