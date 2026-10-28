import React from 'react';
import {
  Bot,
  Zap,
  TrendingUp,
  Receipt,
  Gift,
  Lock,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
} from 'lucide-react';
import { useOrchestrator } from '../../context/OrchestratorContext';
import { AgentType } from '../../types/orchestrator';

export const AgentsRosterView: React.FC = () => {
  const { agentMetrics, orchestrateDirective } = useOrchestrator();

  const getAgentIcon = (type: AgentType) => {
    switch (type) {
      case 'Planner / Orchestrator Agent':
        return Zap;
      case 'Lead & Sales Agent':
        return TrendingUp;
      case 'Finance & Expense Agent':
        return Receipt;
      case 'Customer Helpline & Loyalty Agent':
        return Gift;
      case 'Security & Auth Agent':
        return Lock;
      case 'Supervisor & Human-in-the-Loop (HITL) Agent':
        return ShieldAlert;
      default:
        return Bot;
    }
  };

  const getAgentColorClasses = (color: string) => {
    switch (color) {
      case 'indigo':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          badge: 'bg-indigo-500/20 text-indigo-300',
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          badge: 'bg-emerald-500/20 text-emerald-300',
        };
      case 'amber':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          badge: 'bg-amber-500/20 text-amber-300',
        };
      case 'cyan':
        return {
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          badge: 'bg-cyan-500/20 text-cyan-300',
        };
      case 'purple':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          badge: 'bg-purple-500/20 text-purple-300',
        };
      case 'rose':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          badge: 'bg-rose-500/20 text-rose-300',
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          badge: 'bg-slate-500/20 text-slate-300',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner (Glass Panel) */}
      <div className="glass-panel rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 border border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Specialized Worker Agents Roster & Telemetry Health Matrix
              </h2>
              <p className="text-xs text-slate-300/80 mt-0.5">
                Real-time latency, task execution metrics, and operational readiness across all 6 specialized enterprise agents.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 glass-pill px-3.5 py-2 rounded-xl text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span>Multi-Agent Swarm Operational (6/6 Healthy)</span>
        </div>
      </div>

      {/* Agents Grid (Glass Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agentMetrics.map((agent) => {
          const Icon = getAgentIcon(agent.type);
          const colorStyles = getAgentColorClasses(agent.color);

          return (
            <div
              key={agent.name}
              className="glass-card rounded-2xl p-5 shadow-2xl flex flex-col justify-between hover:border-white/20 transition glass-card-interactive"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-md ${colorStyles.bg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{agent.name}</h4>
                      <div className="text-[11px] font-mono text-slate-400">{agent.type}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      agent.status === 'ONLINE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {agent.roleDescription}
                </p>

                {/* Metric Telemetry */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl text-center text-xs mb-4">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Tasks Done</div>
                    <div className="font-bold text-slate-100 font-mono mt-0.5">
                      {agent.tasksCompleted.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Avg Latency</div>
                    <div className="font-bold text-slate-100 font-mono mt-0.5">
                      {agent.avgLatencyMs}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Health</div>
                    <div className="font-bold text-emerald-400 font-mono mt-0.5">
                      {agent.health}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono">
                  Active Tool Calls: {agent.activeToolCalls}
                </span>

                <button
                  onClick={() =>
                    orchestrateDirective(
                      `Run diagnostics check and telemetry calibration on ${agent.name}`
                    )
                  }
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Run Diagnostic &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
