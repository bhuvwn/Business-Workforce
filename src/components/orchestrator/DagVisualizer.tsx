import React, { useMemo } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Loader2,
  AlertOctagon,
  RotateCw,
  Database,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { WorkflowTask, TaskStatus, AgentType } from '../../types/orchestrator';

interface DagVisualizerProps {
  tasks: WorkflowTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

export const DagVisualizer: React.FC<DagVisualizerProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
}) => {
  // Compute topological layers for DAG layout
  const layers = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const taskMap = new Map<string, WorkflowTask>();
    tasks.forEach((t) => taskMap.set(t.id, t));

    // Calculate depth for each task
    const depthMap = new Map<string, number>();

    const getDepth = (id: string, visited: Set<string> = new Set()): number => {
      if (depthMap.has(id)) return depthMap.get(id)!;
      if (visited.has(id)) return 0; // Prevent cycle

      visited.add(id);
      const task = taskMap.get(id);
      if (!task || task.dependencies.length === 0) {
        depthMap.set(id, 0);
        return 0;
      }

      const parentDepths = task.dependencies.map((depId) => getDepth(depId, visited));
      const maxParent = Math.max(...parentDepths);
      const current = maxParent + 1;
      depthMap.set(id, current);
      return current;
    };

    tasks.forEach((t) => getDepth(t.id));

    // Group by depth
    const maxDepth = Math.max(...Array.from(depthMap.values()), 0);
    const result: WorkflowTask[][] = [];

    for (let i = 0; i <= maxDepth; i++) {
      result.push([]);
    }

    tasks.forEach((t) => {
      const d = depthMap.get(t.id) || 0;
      result[d].push(t);
    });

    return result;
  }, [tasks]);

  const getAgentColor = (agent: AgentType) => {
    switch (agent) {
      case 'Planner / Orchestrator Agent':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      case 'Lead & Sales Agent':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Finance & Expense Agent':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Customer Helpline & Loyalty Agent':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'Security & Auth Agent':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Supervisor & Human-in-the-Loop (HITL) Agent':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: TaskStatus, requiresHITL: boolean) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" />
            <span>COMPLETED</span>
          </span>
        );
      case 'RUNNING':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/40 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>RUNNING</span>
          </span>
        );
      case 'HITL_PAUSED':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-bold text-amber-300 bg-amber-950/90 px-2.5 py-0.5 rounded-full border border-amber-400 shadow-md shadow-amber-950/50 animate-bounce">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>HITL PAUSED</span>
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/40">
            <AlertOctagon className="w-3 h-3" />
            <span>BLOCKED</span>
          </span>
        );
      case 'RETRYING':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-yellow-400 bg-yellow-950/80 px-2 py-0.5 rounded-full border border-yellow-500/40">
            <RotateCw className="w-3 h-3 animate-spin" />
            <span>RETRYING</span>
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="flex items-center space-x-1 text-[11px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700/60">
            <Clock className="w-3 h-3" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4 pt-2">
      <div className="min-w-[800px] flex items-stretch gap-6 px-2">
        {layers.map((layer, layerIdx) => (
          <div key={`layer-${layerIdx}`} className="flex-1 flex flex-col gap-4 relative">
            {/* Stage Header */}
            <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-[10px]">
                  {layerIdx + 1}
                </span>
                <span>Stage {layerIdx + 1}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {layer.length} {layer.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            {/* Task Nodes in this Stage */}
            <div className="flex flex-col gap-3.5">
              {layer.map((task) => {
                const isSelected = selectedTaskId === task.id;
                const isHitl = task.status === 'HITL_PAUSED' || task.requiresHITL;

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    className={`group relative p-4 rounded-2xl text-left cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'glass-card border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400/50 bg-indigo-950/30'
                        : isHitl
                        ? 'glass-card border-amber-500/60 shadow-[0_0_18px_rgba(245,158,11,0.2)] hover:border-amber-400 bg-amber-950/20'
                        : 'glass-card hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                  >
                    {/* Top Row: Agent & Status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md border truncate max-w-[160px] ${getAgentColor(
                          task.agent
                        )}`}
                      >
                        {task.agent.replace(' Agent', '')}
                      </span>
                      {getStatusBadge(task.status, task.requiresHITL)}
                    </div>

                    {/* Task Title */}
                    <h4 className="text-xs font-semibold text-slate-100 group-hover:text-white leading-snug line-clamp-2 mb-2">
                      {task.title}
                    </h4>

                    {/* Tool Interface & HITL marker */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <div className="flex items-center space-x-1.5 font-mono text-[10px] text-slate-300">
                        <Database className="w-3 h-3 text-slate-500" />
                        <span>{task.tool}</span>
                      </div>

                      {task.requiresHITL && (
                        <span className="flex items-center space-x-1 text-[10px] text-amber-300 font-medium">
                          <ShieldAlert className="w-3 h-3 text-amber-400" />
                          <span>HITL Guard</span>
                        </span>
                      )}
                    </div>

                    {/* Dependency preview */}
                    {task.dependencies.length > 0 && (
                      <div className="mt-2 pt-1 text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <ArrowRight className="w-2.5 h-2.5" />
                        <span>Depends on {task.dependencies.join(', ')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
