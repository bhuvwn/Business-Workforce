export type UserRole = 'Admin' | 'Sales Rep' | 'Finance Manager' | 'Customer';

export type AgentType =
  | 'Planner / Orchestrator Agent'
  | 'Lead & Sales Agent'
  | 'Finance & Expense Agent'
  | 'Customer Helpline & Loyalty Agent'
  | 'Security & Auth Agent'
  | 'Supervisor & Human-in-the-Loop (HITL) Agent';

export type ToolInterface =
  | 'CRM_API'
  | 'Google_Sheets_API'
  | 'Auth_Service'
  | 'Notification_Service'
  | 'Loyalty_Database';

export type TaskStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'HITL_PAUSED'
  | 'RETRYING'
  | 'BLOCKED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface WorkflowTask {
  id: string;
  title: string;
  agent: AgentType;
  tool: ToolInterface;
  action: string;
  params: Record<string, any>;
  dependencies: string[];
  status: TaskStatus;
  retryCount: number;
  maxRetries: number;
  requiresHITL: boolean;
  hitlReason?: string;
  riskScore: RiskLevel;
  output?: Record<string, any> | string;
  logs: string[];
  estimatedDurationMs: number;
  startedAt?: string;
  completedAt?: string;
}

export interface WorkflowExecution {
  id: string;
  title: string;
  prompt: string;
  summary: string;
  createdAt: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'PAUSED' | 'FAILED';
  tasks: WorkflowTask[];
  source: 'gemini-3.8-flash' | 'heuristic-engine';
}

export type DealStage = 'Lead' | 'Contacted' | 'Proposal' | 'Closed-Won';

export interface LeadRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  stage: DealStage;
  dealValue: number;
  lastContactDate: string; // ISO string
  inactiveHours: number;
  reminderScheduled: boolean;
  lastReminderSent?: string;
  notes: string;
  assignedTo: string;
  tags?: string[];
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: 'Infrastructure & Cloud' | 'SaaS Subscriptions' | 'Marketing & Ad Spend' | 'Vendor Services' | 'Team Reimbursement';
  amount: number;
  currency: string;
  vendor: string;
  dueDate: string;
  isPaid: boolean;
  receiptAttached: boolean;
  reminderSent: boolean;
  recurring: boolean;
  frequency?: 'Monthly' | 'Quarterly' | 'Annual';
  paidAt?: string;
  tags?: string[];
}

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface CustomerLoyalty {
  id: string;
  customerName: string;
  email: string;
  pointsBalance: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  totalSpent: number;
  discountRedeemedCount: number;
  lastActivity: string;
}

export interface HelplineMessage {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  text: string;
  timestamp: string;
  agentName?: string;
  intentDetected?: string;
  suggestedAction?: string;
}

export interface HITLRequest {
  id: string;
  taskId: string;
  workflowId: string;
  workflowTitle: string;
  taskTitle: string;
  agent: AgentType;
  reason: string;
  riskScore: RiskLevel;
  triggerType: 'DISCOUNT_EXCEEDED' | 'EXPENSE_OVER_THRESHOLD' | 'EXTERNAL_COMMS' | 'SECURITY_OVERRIDE';
  payload: Record<string, any>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  tool: ToolInterface;
  target: string;
  status: 'ALLOWED' | 'DENIED' | 'FLAGGED';
  hash: string;
}

export interface AgentMetrics {
  type: AgentType;
  name: string;
  roleDescription: string;
  status: 'ONLINE' | 'BUSY' | 'IDLE';
  tasksCompleted: number;
  avgLatencyMs: number;
  activeToolCalls: number;
  health: number; // 0 - 100
  color: string;
}
