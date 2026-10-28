import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Zap,
  RotateCw,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  Terminal,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { useOrchestrator } from '../../context/OrchestratorContext';
import { DagVisualizer } from './DagVisualizer';
import { TaskDetailDrawer } from './TaskDetailDrawer';

export const CommandDeck: React.FC = () => {
  const {
    activeWorkflow,
    workflows,
    setActiveWorkflowId,
    selectedTaskId,
    setSelectedTaskId,
    orchestrateDirective,
    isOrchestrating,
    currentRole,
  } = useOrchestrator();

  const [promptInput, setPromptInput] = useState('');

  const quickDirectives = [
    {
      title: 'Full Client Onboarding & Loyalty Reward',
      prompt:
        'Onboard new client ABC Corp, credit them 50 loyalty points, update the sales tracker, and schedule an expense reminder for server renewal ($750)',
      tag: 'Multi-Agent Flow',
    },
    {
      title: 'Automate 48h Inactive Sales Reminders',
      prompt:
        'Audit all inactive prospects (>48h) in the sales pipeline and dispatch automated sales reminders via email & Slack',
      tag: 'Sales & CRM',
    },
    {
      title: 'Cloud Cluster Renewal & Finance Reminder',
      prompt:
        'Categorize $1,420 AWS GPU cluster renewal invoice, monitor budget threshold, and trigger expense reminder to accounting',
      tag: 'Finance ($500+ HITL)',
    },
    {
      title: 'VIP 25% Loyalty Discount Redemption',
      prompt:
        'Customer Sarah Jenkins requests 25% checkout discount using 500 loyalty points for renewal',
      tag: 'Loyalty (>20% HITL)',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isOrchestrating) return;
    await orchestrateDirective(promptInput.trim());
    setPromptInput('');
  };

  const selectedTask =
    activeWorkflow?.tasks.find((t) => t.id === selectedTaskId) ||
    activeWorkflow?.tasks[0] ||
    null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Executive Directives Composer Card (Frosted Glass Panel) */}
      <div className="relative rounded-2xl glass-panel p-6 shadow-2xl overflow-hidden border border-white/15">
        {/* Subtle internal refraction glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-md">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <span>Master Orchestrator Natural Language Directive</span>
              </h2>
              <span className="text-[11px] text-slate-400">
                Type business directives in plain English to auto-plan and execute multi-agent DAGs
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5 glass-pill px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span>Gemini 3.8 Flash Online</span>
          </span>
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="relative">
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. Onboard new client ABC Corp, credit them 50 loyalty points, update the sales tracker, and schedule an expense reminder for server renewal ($750)..."
              rows={3}
              className="w-full rounded-2xl glass-input px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition shadow-inner font-sans"
              disabled={isOrchestrating}
            />
            <div className="absolute right-3.5 bottom-3.5 flex items-center space-x-2">
              <button
                type="submit"
                disabled={!promptInput.trim() || isOrchestrating}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-500/30 transition cursor-pointer disabled:cursor-not-allowed border border-white/20"
              >
                {isOrchestrating ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Decomposing into DAG...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Directive</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Presets:</span>
            </span>
            {quickDirectives.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPromptInput(preset.prompt)}
                className="text-xs px-3 py-1.5 rounded-xl glass-pill hover:bg-white/10 text-slate-300 hover:text-white transition flex items-center space-x-1.5 hover:border-white/25 cursor-pointer"
              >
                <span>{preset.title}</span>
                <span className="text-[10px] text-indigo-300 font-mono">({preset.tag})</span>
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Active Workflows Ribbon */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1 border-b border-white/10">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Workflows:
          </span>
          {workflows.map((wf) => {
            const isActive = wf.id === activeWorkflow?.id;
            return (
              <button
                key={wf.id}
                onClick={() => {
                  setActiveWorkflowId(wf.id);
                  setSelectedTaskId(wf.tasks[0]?.id || null);
                }}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-medium flex items-center space-x-2 transition ${
                  isActive
                    ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-200 shadow-lg shadow-indigo-950/50'
                    : 'glass-pill text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">{wf.title}</span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    wf.status === 'COMPLETED'
                      ? 'glass-tag-paid'
                      : wf.status === 'PAUSED'
                      ? 'glass-tag-due'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {wf.status}
                </span>
              </button>
            );
          })}
        </div>

        {activeWorkflow && (
          <div className="text-xs text-slate-400 flex items-center space-x-3">
            <span className="font-mono text-slate-400">
              Source: <span className="text-indigo-400 font-semibold">{activeWorkflow.source}</span>
            </span>
            <span className="font-mono text-slate-500">
              Tasks: {activeWorkflow.tasks.filter((t) => t.status === 'COMPLETED').length}/
              {activeWorkflow.tasks.length}
            </span>
          </div>
        )}
      </div>

      {/* Main Workflow View: DAG Visualizer + Inspector Panel */}
      {activeWorkflow ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols: Directed Acyclic Graph Visualizer */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="glass-panel rounded-2xl p-5 shadow-2xl border border-white/10">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>Directed Acyclic Graph (DAG)</span>
                    <span className="text-xs font-normal text-slate-400">
                      • Autonomous Dependency Graph
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{activeWorkflow.summary}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg glass-pill text-slate-300">
                    {activeWorkflow.tasks.length} Tasks
                  </span>
                </div>
              </div>

              {/* DAG Canvas */}
              <DagVisualizer
                tasks={activeWorkflow.tasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={(id) => setSelectedTaskId(id)}
              />
            </div>
          </div>

          {/* Right 5 cols: Task Inspector & Logs */}
          <div className="lg:col-span-5 h-[560px]">
            <TaskDetailDrawer task={selectedTask} workflowId={activeWorkflow.id} />
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 glass-panel rounded-2xl">
          <p>No active workflow. Send a directive above to dispatch worker agents.</p>
        </div>
      )}
    </div>
  );
};
