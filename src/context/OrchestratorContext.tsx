import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  UserRole,
  WorkflowExecution,
  WorkflowTask,
  LeadRecord,
  ExpenseRecord,
  CustomerLoyalty,
  HelplineMessage,
  SecurityAuditLog,
  HITLRequest,
  AgentMetrics,
  DealStage,
  TaskStatus,
} from '../types/orchestrator';
import {
  INITIAL_LEADS,
  INITIAL_EXPENSES,
  INITIAL_CUSTOMERS,
  INITIAL_HELPLINE_MESSAGES,
  INITIAL_AUDIT_LOGS,
  INITIAL_AGENT_METRICS,
  SEED_WORKFLOW,
} from '../mock/initialData';

interface OrchestratorContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  workflows: WorkflowExecution[];
  activeWorkflow: WorkflowExecution | null;
  setActiveWorkflowId: (id: string) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  isOrchestrating: boolean;
  leads: LeadRecord[];
  expenses: ExpenseRecord[];
  customers: CustomerLoyalty[];
  helplineMessages: HelplineMessage[];
  auditLogs: SecurityAuditLog[];
  agentMetrics: AgentMetrics[];
  pendingHITL: HITLRequest[];
  notificationBanner: { title: string; message: string; type: 'info' | 'warning' | 'success' | 'danger' } | null;
  clearNotificationBanner: () => void;
  orchestrateDirective: (prompt: string) => Promise<void>;
  approveHITL: (requestId: string, note?: string) => void;
  rejectHITL: (requestId: string, note?: string) => void;
  triggerSalesReminder: (leadId: string) => void;
  triggerExpenseReminder: (expenseId: string) => void;
  updateLeadStage: (leadId: string, stage: DealStage) => void;
  addLead: (lead: Partial<LeadRecord>) => void;
  addExpense: (expense: Partial<ExpenseRecord>) => void;
  addExpenseTag: (expenseId: string, tag: string) => void;
  removeExpenseTag: (expenseId: string, tag: string) => void;
  toggleExpensePaidStatus: (expenseId: string) => void;
  addLeadTag: (leadId: string, tag: string) => void;
  removeLeadTag: (leadId: string, tag: string) => void;
  creditLoyaltyPoints: (customerId: string, amountSpent: number) => { pointsEarned: number; newTotal: number };
  redeemLoyaltyDiscount: (
    customerId: string,
    discountPercent: number,
    orderTotal: number
  ) => { success: boolean; message: string; requiresHITL: boolean };
  sendHelplineMessage: (text: string) => void;
  checkPermission: (allowedRoles: UserRole[], action: string, tool: string) => boolean;
  retryTask: (workflowId: string, taskId: string) => void;
  simulateWebhookDispatch: (title: string, data: any) => Promise<boolean>;
}

const OrchestratorContext = createContext<OrchestratorContextType | undefined>(undefined);

export const OrchestratorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Role defaults to Admin (Business Owner)
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');

  // Workflows & Execution
  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([SEED_WORKFLOW]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(SEED_WORKFLOW.id);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('task-expense-server');
  const [isOrchestrating, setIsOrchestrating] = useState<boolean>(false);

  // Business Entities
  const [leads, setLeads] = useState<LeadRecord[]>(INITIAL_LEADS);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [customers, setCustomers] = useState<CustomerLoyalty[]>(INITIAL_CUSTOMERS);
  const [helplineMessages, setHelplineMessages] = useState<HelplineMessage[]>(INITIAL_HELPLINE_MESSAGES);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics[]>(INITIAL_AGENT_METRICS);

  // HITL Requests
  const [pendingHITL, setPendingHITL] = useState<HITLRequest[]>([
    {
      id: 'hitl-req-1',
      taskId: 'task-expense-server',
      workflowId: 'wf-demo-1',
      workflowTitle: SEED_WORKFLOW.title,
      taskTitle: 'Authorize $750 Dedicated Cloud Server Renewal',
      agent: 'Supervisor & Human-in-the-Loop (HITL) Agent',
      reason: 'Expense payout of $750 exceeds autonomous $500 threshold. Supervisor sign-off required.',
      riskScore: 'HIGH',
      triggerType: 'EXPENSE_OVER_THRESHOLD',
      payload: { vendor: 'AWS Cloud Hosting', amount: 750, category: 'Infrastructure & Cloud', threshold: 500 },
      status: 'PENDING',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
  ]);

  const [notificationBanner, setNotificationBanner] = useState<{
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'danger';
  } | null>({
    title: 'HITL Checkpoint Active',
    message: 'Task "$750 Cloud Server Renewal" requires Owner Sign-off (Payout exceeds $500 threshold).',
    type: 'warning',
  });

  const clearNotificationBanner = () => setNotificationBanner(null);

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId) || workflows[0] || null;

  // Audit Log helper
  const addAudit = (
    action: string,
    tool: any,
    target: string,
    status: 'ALLOWED' | 'DENIED' | 'FLAGGED',
    actorOverride?: string
  ) => {
    const log: SecurityAuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      actor: actorOverride || (currentRole === 'Admin' ? 'Bhuvang (Founder/Admin)' : `${currentRole} User`),
      role: currentRole,
      action,
      tool,
      target,
      status,
      hash: '0x' + Math.random().toString(16).substr(2, 8) + '...' + Math.random().toString(16).substr(2, 4),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // RBAC Permission Check
  const checkPermission = (allowedRoles: UserRole[], action: string, tool: string): boolean => {
    if (allowedRoles.includes(currentRole)) {
      addAudit(action, tool as any, `Role check passed: ${currentRole}`, 'ALLOWED');
      return true;
    }
    addAudit(action, tool as any, `Unauthorized access blocked for role: ${currentRole}`, 'DENIED');
    setNotificationBanner({
      title: 'Security Alert: Permission Denied',
      message: `Role "${currentRole}" does not hold privileges for "${action}". Requires: ${allowedRoles.join(', ')}.`,
      type: 'danger',
    });
    return false;
  };

  // DAG Step-by-Step Execution Engine Runner
  const executionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!activeWorkflow || activeWorkflow.status !== 'RUNNING') return;

    // Check if there are tasks to run
    const runNextStep = () => {
      setWorkflows((prevWorkflows) => {
        return prevWorkflows.map((wf) => {
          if (wf.id !== activeWorkflow.id || wf.status !== 'RUNNING') return wf;

          const completedTaskIds = new Set(
            wf.tasks.filter((t) => t.status === 'COMPLETED').map((t) => t.id)
          );

          let updated = false;
          let hasPending = false;
          let hasRunning = false;
          let hasBlockedOrPaused = false;

          const updatedTasks = wf.tasks.map((task) => {
            if (task.status === 'COMPLETED') return task;
            if (task.status === 'BLOCKED' || task.status === 'HITL_PAUSED') {
              hasBlockedOrPaused = true;
              return task;
            }

            // If task is RUNNING, finish it or pause for HITL
            if (task.status === 'RUNNING') {
              hasRunning = true;
              // Check if HITL is required
              if (task.requiresHITL) {
                updated = true;
                hasBlockedOrPaused = true;
                // Emit HITL request
                setPendingHITL((prev) => {
                  if (prev.some((p) => p.taskId === task.id && p.status === 'PENDING')) return prev;
                  return [
                    {
                      id: `hitl-${Date.now()}`,
                      taskId: task.id,
                      workflowId: wf.id,
                      workflowTitle: wf.title,
                      taskTitle: task.title,
                      agent: task.agent,
                      reason: task.hitlReason || 'High-stakes action paused for executive sign-off',
                      riskScore: task.riskScore,
                      triggerType: task.params?.amount > 500 ? 'EXPENSE_OVER_THRESHOLD' : 'DISCOUNT_EXCEEDED',
                      payload: task.params,
                      status: 'PENDING',
                      createdAt: new Date().toISOString(),
                    },
                    ...prev,
                  ];
                });
                setNotificationBanner({
                  title: 'Execution Paused for Owner Sign-off',
                  message: `Task "${task.title}" intercepted by HITL Supervisor. One-click approval required.`,
                  type: 'warning',
                });
                return {
                  ...task,
                  status: 'HITL_PAUSED' as TaskStatus,
                  logs: [
                    ...task.logs,
                    `[${new Date().toLocaleTimeString()}] HITL Checkpoint triggered: ${task.hitlReason}`,
                    `[${new Date().toLocaleTimeString()}] Workflow paused at Node ${task.id}. Awaiting Business Owner approval.`,
                  ],
                };
              }

              // Otherwise mark as COMPLETED
              updated = true;
              return {
                ...task,
                status: 'COMPLETED' as TaskStatus,
                completedAt: new Date().toISOString(),
                output: task.output || { success: true, processedAt: new Date().toISOString() },
                logs: [
                  ...task.logs,
                  `[${new Date().toLocaleTimeString()}] Executed successfully via ${task.tool}.${task.action}`,
                  `[${new Date().toLocaleTimeString()}] Output state verified and committed to state store.`,
                ],
              };
            }

            // If task is PENDING, check if all dependencies are completed
            if (task.status === 'PENDING') {
              hasPending = true;
              const allDepsMet = task.dependencies.every((depId) => completedTaskIds.has(depId));
              if (allDepsMet) {
                updated = true;
                hasRunning = true;
                return {
                  ...task,
                  status: 'RUNNING' as TaskStatus,
                  startedAt: new Date().toISOString(),
                  logs: [
                    ...task.logs,
                    `[${new Date().toLocaleTimeString()}] All ${task.dependencies.length} dependencies met. Dispatching to ${task.agent}...`,
                    `[${new Date().toLocaleTimeString()}] Invoking ${task.tool} with parameters: ${JSON.stringify(task.params)}`,
                  ],
                };
              }
            }

            return task;
          });

          // Compute new workflow status
          let newStatus: WorkflowExecution['status'] = wf.status;
          if (hasBlockedOrPaused) {
            newStatus = 'PAUSED';
          } else if (!hasPending && !hasRunning) {
            newStatus = 'COMPLETED';
            setNotificationBanner({
              title: 'Workflow Execution Completed',
              message: `Autonomous workflow "${wf.title}" finished all tasks with 100% success rate.`,
              type: 'success',
            });
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
          }

          return {
            ...wf,
            status: newStatus,
            tasks: updatedTasks,
          };
        });
      });
    };

    executionTimerRef.current = setTimeout(runNextStep, 1400);

    return () => {
      if (executionTimerRef.current) clearTimeout(executionTimerRef.current);
    };
  }, [activeWorkflow]);

  // Orchestrate new Directive via Server API (with Gemini 3.8 Flash & Heuristic Fallback)
  const orchestrateDirective = async (prompt: string) => {
    if (!checkPermission(['Admin'], 'ORCHESTRATE_DIRECTIVE', 'Auth_Service')) {
      return;
    }

    setIsOrchestrating(true);
    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userRole: currentRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to decompose directive');
      }

      const plan = data.plan;
      const newTasks: WorkflowTask[] = plan.nodes.map((n: any) => ({
        id: n.id,
        title: n.title,
        agent: n.agent,
        tool: n.tool,
        action: n.action,
        params: n.params || {},
        dependencies: n.dependencies || [],
        status: 'PENDING' as TaskStatus,
        retryCount: 0,
        maxRetries: 3,
        requiresHITL: !!n.requiresHITL,
        hitlReason: n.hitlReason,
        riskScore: n.riskScore || 'LOW',
        estimatedDurationMs: n.estimatedDurationMs || 1000,
        logs: [`Task planned by Master Orchestrator Agent via ${data.source}`],
      }));

      const newExecution: WorkflowExecution = {
        id: `wf-${Date.now()}`,
        title: plan.workflowTitle || `Directive: ${prompt.slice(0, 35)}...`,
        prompt,
        summary: plan.summary || 'Decomposed into DAG workflow',
        createdAt: new Date().toISOString(),
        status: 'RUNNING',
        tasks: newTasks,
        source: data.source || 'gemini-3.8-flash',
      };

      setWorkflows((prev) => [newExecution, ...prev]);
      setActiveWorkflowId(newExecution.id);
      setSelectedTaskId(newTasks[0]?.id || null);

      addAudit('DISPATCH_AUTONOMOUS_DAG', 'Auth_Service', `Workflow: ${newExecution.title}`, 'ALLOWED');
      setNotificationBanner({
        title: 'New Autonomous DAG Dispatched',
        message: `Plan composed with ${newTasks.length} worker agent tasks. Step-by-step execution started.`,
        type: 'info',
      });
    } catch (err: any) {
      console.error('Orchestration error:', err);
      setNotificationBanner({
        title: 'Orchestration Error',
        message: err.message || 'Could not parse directive. Please try again.',
        type: 'danger',
      });
    } finally {
      setIsOrchestrating(false);
    }
  };

  // One-click HITL Approve
  const approveHITL = (requestId: string, note?: string) => {
    if (!checkPermission(['Admin'], 'HITL_SIGN_OFF', 'Auth_Service')) {
      return;
    }

    const req = pendingHITL.find((r) => r.id === requestId);
    if (!req) return;

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });

    setPendingHITL((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED',
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'Bhuvang (Founder/Admin)',
              resolutionNote: note || 'Approved by Executive Sign-off',
            }
          : r
      )
    );

    // Resume the task in workflow
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== req.workflowId) return wf;
        return {
          ...wf,
          status: 'RUNNING',
          tasks: wf.tasks.map((t) => {
            if (t.id !== req.taskId) return t;
            return {
              ...t,
              status: 'COMPLETED' as TaskStatus,
              requiresHITL: false,
              completedAt: new Date().toISOString(),
              logs: [
                ...t.logs,
                `[${new Date().toLocaleTimeString()}] ✅ HITL APPROVED by Business Owner (Bhuvang): ${note || 'Authorized'}`,
                `[${new Date().toLocaleTimeString()}] Action committed & verified by Supervisor Agent. Resuming downstream DAG tasks.`,
              ],
            };
          }),
        };
      })
    );

    addAudit('HITL_APPROVE', 'Notification_Service', `Approved Task: ${req.taskTitle}`, 'ALLOWED');
    setNotificationBanner({
      title: 'HITL Checkpoint Approved',
      message: `Sign-off granted for "${req.taskTitle}". DAG resumed execution.`,
      type: 'success',
    });
  };

  // One-click HITL Reject
  const rejectHITL = (requestId: string, note?: string) => {
    if (!checkPermission(['Admin'], 'HITL_REJECT', 'Auth_Service')) {
      return;
    }

    const req = pendingHITL.find((r) => r.id === requestId);
    if (!req) return;

    setPendingHITL((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED',
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'Bhuvang (Founder/Admin)',
              resolutionNote: note || 'Rejected by Business Owner',
            }
          : r
      )
    );

    // Set task to BLOCKED in workflow
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== req.workflowId) return wf;
        return {
          ...wf,
          status: 'FAILED',
          tasks: wf.tasks.map((t) => {
            if (t.id !== req.taskId) return t;
            return {
              ...t,
              status: 'BLOCKED' as TaskStatus,
              logs: [
                ...t.logs,
                `[${new Date().toLocaleTimeString()}] ❌ HITL REJECTED by Business Owner: ${note || 'Unauthorized transaction aborted'}`,
                `[${new Date().toLocaleTimeString()}] Task marked as BLOCKED. Downstream execution stopped to protect enterprise assets.`,
              ],
            };
          }),
        };
      })
    );

    addAudit('HITL_REJECT', 'Notification_Service', `Rejected Task: ${req.taskTitle}`, 'FLAGGED');
    setNotificationBanner({
      title: 'Transaction Blocked',
      message: `High-risk action "${req.taskTitle}" was rejected. Downstream tasks halted.`,
      type: 'danger',
    });
  };

  // Retry a failed or blocked task with exponential backoff
  const retryTask = (workflowId: string, taskId: string) => {
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== workflowId) return wf;
        return {
          ...wf,
          status: 'RUNNING',
          tasks: wf.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const newRetry = t.retryCount + 1;
            const backoffMs = Math.pow(2, newRetry) * 500;
            return {
              ...t,
              status: 'RETRYING' as TaskStatus,
              retryCount: newRetry,
              logs: [
                ...t.logs,
                `[${new Date().toLocaleTimeString()}] Retry attempt ${newRetry}/${t.maxRetries} scheduled (Backoff: ${backoffMs}ms)...`,
              ],
            };
          }),
        };
      })
    );

    setTimeout(() => {
      setWorkflows((prev) =>
        prev.map((wf) => {
          if (wf.id !== workflowId) return wf;
          return {
            ...wf,
            tasks: wf.tasks.map((t) => {
              if (t.id !== taskId) return t;
              return {
                ...t,
                status: 'COMPLETED' as TaskStatus,
                completedAt: new Date().toISOString(),
                logs: [
                  ...t.logs,
                  `[${new Date().toLocaleTimeString()}] Retry successful! API payload confirmed and processed.`,
                ],
              };
            }),
          };
        })
      );
    }, 1500);
  };

  // Trigger Automated Sales Reminder
  const triggerSalesReminder = (leadId: string) => {
    if (!checkPermission(['Admin', 'Sales Rep'], 'DISPATCH_SALES_REMINDER', 'Notification_Service')) {
      return;
    }

    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              reminderScheduled: true,
              lastReminderSent: new Date().toISOString(),
              notes: `${l.notes} | [Automated Reminder Dispatched ${new Date().toLocaleTimeString()}]`,
            }
          : l
      )
    );

    addAudit('DISPATCH_SALES_REMINDER', 'Notification_Service', `Lead: ${lead.company} (${lead.name})`, 'ALLOWED');
    setNotificationBanner({
      title: 'Sales Reminder Dispatched',
      message: `Follow-up email & Slack ping sent to ${lead.assignedTo} for ${lead.company} (Inactive for ${lead.inactiveHours}h).`,
      type: 'success',
    });
  };

  // Trigger Automated Expense Reminder
  const triggerExpenseReminder = (expenseId: string) => {
    if (!checkPermission(['Admin', 'Finance Manager'], 'DISPATCH_EXPENSE_REMINDER', 'Notification_Service')) {
      return;
    }

    const exp = expenses.find((e) => e.id === expenseId);
    if (!exp) return;

    setExpenses((prev) =>
      prev.map((e) =>
        e.id === expenseId
          ? {
              ...e,
              reminderSent: true,
            }
          : e
      )
    );

    addAudit('DISPATCH_EXPENSE_REMINDER', 'Notification_Service', `Expense: ${exp.title} ($${exp.amount})`, 'ALLOWED');
    setNotificationBanner({
      title: 'Expense Reminder Sent',
      message: `Automated alert dispatched to Finance channel for ${exp.vendor} ($${exp.amount} ${exp.currency}) due ${exp.dueDate}.`,
      type: 'success',
    });
  };

  // Update Lead Stage
  const updateLeadStage = (leadId: string, stage: DealStage) => {
    if (!checkPermission(['Admin', 'Sales Rep'], 'UPDATE_LEAD_STAGE', 'CRM_API')) {
      return;
    }

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage, lastContactDate: new Date().toISOString(), inactiveHours: 0 } : l))
    );
    addAudit('CRM_PIPELINE_UPDATE', 'CRM_API', `Lead ${leadId} moved to stage ${stage}`, 'ALLOWED');
  };

  // Add Lead
  const addLead = (leadData: Partial<LeadRecord>) => {
    if (!checkPermission(['Admin', 'Sales Rep'], 'CREATE_LEAD', 'CRM_API')) {
      return;
    }

    const newLead: LeadRecord = {
      id: `lead-${Date.now()}`,
      name: leadData.name || 'New Prospect',
      company: leadData.company || 'Enterprise Corp',
      email: leadData.email || 'contact@enterprisecorp.com',
      phone: leadData.phone || '+1 (555) 000-0000',
      stage: leadData.stage || 'Lead',
      dealValue: leadData.dealValue || 10000,
      lastContactDate: new Date().toISOString(),
      inactiveHours: 0,
      reminderScheduled: false,
      notes: leadData.notes || 'Logged via Lead & Sales Agent',
      assignedTo: leadData.assignedTo || 'Marcus Brody (Sales Lead)',
    };
    setLeads((prev) => [newLead, ...prev]);
    addAudit('CREATE_LEAD', 'CRM_API', `Lead: ${newLead.company}`, 'ALLOWED');
  };

  // Add Expense with HITL Check
  const addExpense = (expData: Partial<ExpenseRecord>) => {
    if (!checkPermission(['Admin', 'Finance Manager'], 'CREATE_EXPENSE', 'Google_Sheets_API')) {
      return;
    }

    const amount = expData.amount || 100;
    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      title: expData.title || 'Operational Expense',
      category: expData.category || 'Vendor Services',
      amount,
      currency: expData.currency || 'USD',
      vendor: expData.vendor || 'External Vendor',
      dueDate: expData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      isPaid: false,
      receiptAttached: !!expData.receiptAttached,
      reminderSent: false,
      recurring: !!expData.recurring,
      frequency: expData.frequency || 'Monthly',
    };

    setExpenses((prev) => [newExp, ...prev]);
    addAudit('APPEND_EXPENSE_LEDGER', 'Google_Sheets_API', `Expense: ${newExp.title} ($${newExp.amount})`, 'ALLOWED');

    if (amount > 500) {
      // Trigger HITL review
      const hitl: HITLRequest = {
        id: `hitl-${Date.now()}`,
        taskId: newExp.id,
        workflowId: 'manual-expense',
        workflowTitle: 'Manual Expense Ingestion',
        taskTitle: `Authorize $${amount} Payment to ${newExp.vendor}`,
        agent: 'Supervisor & Human-in-the-Loop (HITL) Agent',
        reason: `Expense payout of $${amount} exceeds the $500 threshold limit.`,
        riskScore: amount > 2000 ? 'CRITICAL' : 'HIGH',
        triggerType: 'EXPENSE_OVER_THRESHOLD',
        payload: newExp,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      setPendingHITL((prev) => [hitl, ...prev]);
      setNotificationBanner({
        title: 'High-Value Expense Intercepted ($500+)',
        message: `Expense of $${amount} for ${newExp.vendor} requires Owner approval in the HITL Queue.`,
        type: 'warning',
      });
    }
  };

  // Add Tag to Expense (e.g. Paid, Due, Overdue, Urgent)
  const addExpenseTag = (expenseId: string, tag: string) => {
    const cleanTag = tag.trim();
    if (!cleanTag) return;
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id !== expenseId) return e;
        const currentTags = e.tags || [];
        if (currentTags.includes(cleanTag)) return e;
        return { ...e, tags: [...currentTags, cleanTag] };
      })
    );
    addAudit('TAG_EXPENSE', 'Google_Sheets_API', `Added tag "${cleanTag}" to expense ${expenseId}`, 'ALLOWED');
  };

  // Remove Tag from Expense
  const removeExpenseTag = (expenseId: string, tag: string) => {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id !== expenseId) return e;
        return { ...e, tags: (e.tags || []).filter((t) => t !== tag) };
      })
    );
    addAudit('UNTAG_EXPENSE', 'Google_Sheets_API', `Removed tag "${tag}" from expense ${expenseId}`, 'ALLOWED');
  };

  // Toggle Expense Paid Status (syncs 'Paid' / 'Due' tags)
  const toggleExpensePaidStatus = (expenseId: string) => {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id !== expenseId) return e;
        const nextPaid = !e.isPaid;
        const existingTags = (e.tags || []).filter((t) => t !== 'Paid' && t !== 'Due' && t !== 'Overdue');
        const newStatusTag = nextPaid ? 'Paid' : 'Due';
        return {
          ...e,
          isPaid: nextPaid,
          paidAt: nextPaid ? new Date().toISOString() : undefined,
          tags: [newStatusTag, ...existingTags],
        };
      })
    );
    addAudit('TOGGLE_EXPENSE_PAID', 'Google_Sheets_API', `Toggled expense ${expenseId} status`, 'ALLOWED');
  };

  // Add Tag to Lead
  const addLeadTag = (leadId: string, tag: string) => {
    const cleanTag = tag.trim();
    if (!cleanTag) return;
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        const currentTags = l.tags || [];
        if (currentTags.includes(cleanTag)) return l;
        return { ...l, tags: [...currentTags, cleanTag] };
      })
    );
    addAudit('TAG_LEAD', 'CRM_API', `Added tag "${cleanTag}" to lead ${leadId}`, 'ALLOWED');
  };

  // Remove Tag from Lead
  const removeLeadTag = (leadId: string, tag: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        return { ...l, tags: (l.tags || []).filter((t) => t !== tag) };
      })
    );
    addAudit('UNTAG_LEAD', 'CRM_API', `Removed tag "${tag}" from lead ${leadId}`, 'ALLOWED');
  };

  // Credit Loyalty Points: 1 pt per $10 spent
  const creditLoyaltyPoints = (customerId: string, amountSpent: number) => {
    const pointsEarned = Math.floor(amountSpent / 10);
    let newTotal = pointsEarned;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c;
        const newBal = c.pointsBalance + pointsEarned;
        const newLifetime = c.lifetimePoints + pointsEarned;
        const newSpent = c.totalSpent + amountSpent;
        newTotal = newBal;
        let newTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' = c.tier;
        if (newLifetime >= 3000) newTier = 'Platinum';
        else if (newLifetime >= 1000) newTier = 'Gold';
        else if (newLifetime >= 250) newTier = 'Silver';

        return {
          ...c,
          pointsBalance: newBal,
          lifetimePoints: newLifetime,
          totalSpent: newSpent,
          tier: newTier,
          lastActivity: new Date().toISOString(),
        };
      })
    );

    addAudit(
      'CREDIT_LOYALTY_POINTS',
      'Loyalty_Database',
      `Credited ${pointsEarned} pts ($${amountSpent} spent) to customer ${customerId}`,
      'ALLOWED'
    );
    return { pointsEarned, newTotal };
  };

  // Redeem Loyalty Discount (Enforces the 20% limit!)
  const redeemLoyaltyDiscount = (customerId: string, discountPercent: number, orderTotal: number) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) {
      return { success: false, message: 'Customer not found', requiresHITL: false };
    }

    const pointsNeeded = discountPercent * 20; // 20 pts per 1% discount
    if (customer.pointsBalance < pointsNeeded) {
      return {
        success: false,
        message: `Insufficient points! Required: ${pointsNeeded} pts, Available: ${customer.pointsBalance} pts`,
        requiresHITL: false,
      };
    }

    // High Checkpoint Rule: Pauses execution if discount exceeds 20%
    if (discountPercent > 20) {
      const hitl: HITLRequest = {
        id: `hitl-${Date.now()}`,
        taskId: `discount-${Date.now()}`,
        workflowId: 'loyalty-redemption',
        workflowTitle: 'Customer Loyalty Redemption',
        taskTitle: `Redeem ${discountPercent}% Discount for ${customer.customerName}`,
        agent: 'Supervisor & Human-in-the-Loop (HITL) Agent',
        reason: `Discount rate of ${discountPercent}% exceeds the 20% autonomous threshold!`,
        riskScore: discountPercent > 35 ? 'CRITICAL' : 'HIGH',
        triggerType: 'DISCOUNT_EXCEEDED',
        payload: {
          customerName: customer.customerName,
          discountPercent,
          orderTotal,
          savings: (orderTotal * discountPercent) / 100,
          pointsDeducted: pointsNeeded,
        },
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      setPendingHITL((prev) => [hitl, ...prev]);
      addAudit(
        'REDEEM_POINTS_DISCOUNT_EXCEEDED',
        'Loyalty_Database',
        `Attempted ${discountPercent}% discount by ${customer.customerName} - HITL PAUSED`,
        'FLAGGED'
      );

      setNotificationBanner({
        title: 'Discount Threshold Exceeded (>20%)',
        message: `Customer ${customer.customerName} requested ${discountPercent}% discount. Queued for Business Owner approval.`,
        type: 'warning',
      });

      return {
        success: false,
        message: `Discount of ${discountPercent}% exceeds standard 20% limit. Sent to Business Owner approval queue.`,
        requiresHITL: true,
      };
    }

    // If <= 20%, process autonomously
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              pointsBalance: c.pointsBalance - pointsNeeded,
              discountRedeemedCount: c.discountRedeemedCount + 1,
              lastActivity: new Date().toISOString(),
            }
          : c
      )
    );

    addAudit(
      'REDEEM_POINTS_DISCOUNT',
      'Loyalty_Database',
      `Applied ${discountPercent}% discount for ${customer.customerName} (${pointsNeeded} pts deducted)`,
      'ALLOWED'
    );

    return {
      success: true,
      message: `Successfully redeemed ${discountPercent}% discount ($${(
        (orderTotal * discountPercent) /
        100
      ).toFixed(2)} savings). Deducted ${pointsNeeded} points.`,
      requiresHITL: false,
    };
  };

  // Customer Helpline Chatbot Simulator
  const sendHelplineMessage = (text: string) => {
    const custMsg: HelplineMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      text,
      timestamp: new Date().toISOString(),
    };

    setHelplineMessages((prev) => [...prev, custMsg]);

    // Intelligent Agent reply simulation
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = "Hello! I am Aura, your 24/7 Enterprise Customer Helpline & Loyalty Agent. How can I assist you with orders, invoices, or your points balance today?";
      let intent = 'GENERAL_ASSISTANCE';
      let suggestedAction: string | undefined;

      if (lower.includes('point') || lower.includes('balance') || lower.includes('tier')) {
        reply = "You earn 1 loyalty point for every $10 spent. Points can be redeemed for checkout discounts (up to 20% instant redemption, or higher with owner approval). Your current balance is synced to the Loyalty Database.";
        intent = 'POINTS_INQUIRY';
      } else if (lower.includes('discount') || lower.includes('%')) {
        reply = "Discounts up to 20% are autonomously verified and applied instantly via our Loyalty Engine. Any request over 20% is routed to our Executive Supervisor for one-click authorization.";
        intent = 'DISCOUNT_POLICY';
      } else if (lower.includes('helpline') || lower.includes('number') || lower.includes('phone') || lower.includes('call')) {
        reply = "Our dedicated enterprise helpline is +1 (800) 555-AEGIS. Priority phone support is available around the clock for all active partners.";
        intent = 'HELPLINE_CONTACT';
      } else if (lower.includes('order') || lower.includes('status') || lower.includes('tracking')) {
        reply = "Order & deployment telemetry shows all pipeline deliverables running normally. Reference ticket #ORD-7741 is verified in the CRM.";
        intent = 'ORDER_STATUS';
        suggestedAction = 'Check CRM Records';
      } else if (lower.includes('invoice') || lower.includes('receipt') || lower.includes('refund')) {
        reply = "Invoices and receipts are archived in the Finance & Expense Agent vault. For refunds over $500, our system automatically requests owner approval to ensure full accounting compliance.";
        intent = 'FINANCE_INQUIRY';
      }

      const agentMsg: HelplineMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        agentName: 'Customer Helpline & Loyalty Agent',
        text: reply,
        timestamp: new Date().toISOString(),
        intentDetected: intent,
        suggestedAction,
      };

      setHelplineMessages((prev) => [...prev, agentMsg]);
      addAudit('HELPLINE_INTERACTION', 'Notification_Service', `Processed inquiry intent: ${intent}`, 'ALLOWED', 'Customer Helpline & Loyalty Agent');
    }, 800);
  };

  // Simulate Webhook dispatch
  const simulateWebhookDispatch = async (title: string, data: any): Promise<boolean> => {
    addAudit('DISPATCH_WEBHOOK_PAYLOAD', 'Notification_Service', `Webhook: ${title}`, 'ALLOWED');
    setNotificationBanner({
      title: 'Webhook Dispatched to Business Owner',
      message: `Payload successfully transmitted to Owner Slack / Mobile App channel.`,
      type: 'success',
    });
    return true;
  };

  return (
    <OrchestratorContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        workflows,
        activeWorkflow,
        setActiveWorkflowId,
        selectedTaskId,
        setSelectedTaskId,
        isOrchestrating,
        leads,
        expenses,
        customers,
        helplineMessages,
        auditLogs,
        agentMetrics,
        pendingHITL,
        notificationBanner,
        clearNotificationBanner,
        orchestrateDirective,
        approveHITL,
        rejectHITL,
        triggerSalesReminder,
        triggerExpenseReminder,
        updateLeadStage,
        addLead,
        addExpense,
        addExpenseTag,
        removeExpenseTag,
        toggleExpensePaidStatus,
        addLeadTag,
        removeLeadTag,
        creditLoyaltyPoints,
        redeemLoyaltyDiscount,
        sendHelplineMessage,
        checkPermission,
        retryTask,
        simulateWebhookDispatch,
      }}
    >
      {children}
    </OrchestratorContext.Provider>
  );
};

export const useOrchestrator = () => {
  const context = useContext(OrchestratorContext);
  if (!context) {
    throw new Error('useOrchestrator must be used within an OrchestratorProvider');
  }
  return context;
};
