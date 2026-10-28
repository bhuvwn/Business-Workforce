import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini client if key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiConnected: !!aiClient,
    environment: 'enterprise-orchestrator',
  });
});

// Orchestration endpoint with Gemini 3.8 Flash
app.post('/api/orchestrate', async (req, res) => {
  const { prompt, userRole = 'Admin' } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Security role check: only Admin/Owner can invoke Master Orchestration
  if (userRole !== 'Admin') {
    return res.status(403).json({
      error: 'Access Denied: Only Business Owner / Admin can orchestrate multi-agent workflows',
      code: 'RBAC_FORBIDDEN',
    });
  }

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are the Master Orchestrator and Planner Agent for an enterprise multi-agent workflow system.
Decompose this natural language business directive from the business owner into a structured Directed Acyclic Graph (DAG) of sub-tasks.

Directive: "${prompt}"

Available Worker Agents:
1. "Lead & Sales Agent": CRM logging, prospect qualification, deals pipeline update, sales reminders for inactive leads.
2. "Finance & Expense Agent": Expense categorizing, invoice verification, expense reminders, budget checks.
3. "Customer Helpline & Loyalty Agent": Customer support, inquiries, loyalty points calculation, points redemption.
4. "Security & Auth Agent": RBAC enforcement, session validation, token permission check, audit log creation.
5. "Supervisor & Human-in-the-Loop (HITL) Agent": Intercepts high-stakes transactions (discounts > 20%, expenses > $500, high-risk customer comms).

Tool Interfaces: CRM_API, Google_Sheets_API, Auth_Service, Notification_Service, Loyalty_Database.

Human-in-the-loop triggers:
- Any discount > 20%
- Any expense/payout > $500
- Any external mass communication

Format the response strictly as valid JSON adhering to this schema:
{
  "workflowTitle": "Brief title",
  "summary": "1-2 sentence executive summary of execution plan",
  "estimatedDurationSec": 8,
  "nodes": [
    {
      "id": "task-1",
      "title": "Clear task title",
      "agent": "One of the 5 agents above",
      "tool": "CRM_API | Google_Sheets_API | Auth_Service | Notification_Service | Loyalty_Database",
      "action": "function_name",
      "params": { "key": "value" },
      "dependencies": [],
      "requiresHITL": boolean,
      "hitlReason": "optional reason if requiresHITL is true",
      "riskScore": "LOW | MEDIUM | HIGH | CRITICAL",
      "estimatedDurationMs": 1200
    }
  ]
}
`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim();
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, plan: parsed, source: 'gemini-3.8-flash' });
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to heuristic engine:', err?.message || err);
      // Fallback proceeds below
    }
  }

  // Built-in intelligent heuristic decomposition fallback
  const plan = generateHeuristicPlan(prompt);
  return res.json({ success: true, plan, source: 'heuristic-engine' });
});

// Heuristic plan generator for instant, ultra-reliable fallback
function generateHeuristicPlan(prompt: string) {
  const lower = prompt.toLowerCase();
  const nodes = [];

  // Security Auth check is always node 1
  nodes.push({
    id: 'auth-verify',
    title: 'Verify Executive Privilege & RBAC Tokens',
    agent: 'Security & Auth Agent',
    tool: 'Auth_Service',
    action: 'validate_bearer_session',
    params: { roleRequired: 'Admin', scope: 'executive:full-dispatch' },
    dependencies: [],
    requiresHITL: false,
    riskScore: 'LOW',
    estimatedDurationMs: 800,
  });

  // Sales / Client Onboarding
  if (lower.includes('client') || lower.includes('onboard') || lower.includes('sale') || lower.includes('lead') || lower.includes('prospect')) {
    nodes.push({
      id: 'crm-log-client',
      title: 'Qualify Prospect & Register in CRM Pipeline',
      agent: 'Lead & Sales Agent',
      tool: 'CRM_API',
      action: 'sync_lead_pipeline',
      params: { stage: 'Proposal', leadSource: 'Founder Directive', priority: 'High' },
      dependencies: ['auth-verify'],
      requiresHITL: false,
      riskScore: 'LOW',
      estimatedDurationMs: 1400,
    });

    nodes.push({
      id: 'sales-reminder',
      title: 'Schedule Inactive Lead Sales Reminder (48h Cadence)',
      agent: 'Lead & Sales Agent',
      tool: 'Notification_Service',
      action: 'schedule_sales_alert',
      params: { triggerHours: 48, channel: 'Slack & Email', assignee: 'Account Executive' },
      dependencies: ['crm-log-client'],
      requiresHITL: false,
      riskScore: 'LOW',
      estimatedDurationMs: 1000,
    });
  }

  // Loyalty Points
  if (lower.includes('loyalty') || lower.includes('point') || lower.includes('credit') || lower.includes('discount')) {
    const pointsMatch = prompt.match(/(\d+)\s*point/i);
    const points = pointsMatch ? parseInt(pointsMatch[1], 10) : 50;
    const isDiscount = lower.includes('discount');
    const discountMatch = prompt.match(/(\d+)%/);
    const discountPct = discountMatch ? parseInt(discountMatch[1], 10) : (isDiscount ? 25 : 0);
    const hitlDiscount = discountPct > 20;

    nodes.push({
      id: 'loyalty-credit',
      title: hitlDiscount ? `Review & Redeem ${discountPct}% Loyalty Discount` : `Accredit ${points} Customer Loyalty Points`,
      agent: 'Customer Helpline & Loyalty Agent',
      tool: 'Loyalty_Database',
      action: hitlDiscount ? 'validate_and_redeem_discount' : 'credit_points',
      params: { points, discountPct, rate: '1 pt / $10 spent' },
      dependencies: ['auth-verify'],
      requiresHITL: hitlDiscount,
      hitlReason: hitlDiscount ? `Discount of ${discountPct}% exceeds the 20% autonomous threshold` : undefined,
      riskScore: hitlDiscount ? 'HIGH' : 'LOW',
      estimatedDurationMs: 1200,
    });
  }

  // Expense / Renewal / Server
  if (lower.includes('expense') || lower.includes('bill') || lower.includes('renew') || lower.includes('server') || lower.includes('cost') || lower.includes('$')) {
    const amountMatch = prompt.match(/\$\s*(\d[\d,]*)|(\d[\d,]*)\s*(?:usd|dollars)/i);
    const amount = amountMatch ? parseInt((amountMatch[1] || amountMatch[2]).replace(/,/g, ''), 10) : 750;
    const hitlExpense = amount > 500;

    nodes.push({
      id: 'finance-categorize',
      title: `Log Vendor Expense & Schedule Renewal Alert ($${amount})`,
      agent: 'Finance & Expense Agent',
      tool: 'Google_Sheets_API',
      action: 'append_expense_ledger',
      params: { category: 'Infrastructure & Cloud', amount, currency: 'USD', recurring: true },
      dependencies: ['auth-verify'],
      requiresHITL: hitlExpense,
      hitlReason: hitlExpense ? `Expense payout of $${amount} exceeds the $500 autonomous threshold` : undefined,
      riskScore: hitlExpense ? 'HIGH' : 'LOW',
      estimatedDurationMs: 1600,
    });

    nodes.push({
      id: 'expense-reminder-notify',
      title: 'Dispatch Automated Expense Reminder to Finance Queue',
      agent: 'Finance & Expense Agent',
      tool: 'Notification_Service',
      action: 'send_expense_reminder',
      params: { recipient: 'finance-lead@company.com', alertDaysBeforeDue: 3 },
      dependencies: ['finance-categorize'],
      requiresHITL: false,
      riskScore: 'LOW',
      estimatedDurationMs: 900,
    });
  }

  // Fallback default node if directive was minimal
  if (nodes.length === 1) {
    nodes.push({
      id: 'general-exec',
      title: 'Execute Master Business Directive Sub-Tasks',
      agent: 'Lead & Sales Agent',
      tool: 'Google_Sheets_API',
      action: 'sync_executive_record',
      params: { rawInput: prompt },
      dependencies: ['auth-verify'],
      requiresHITL: false,
      riskScore: 'LOW',
      estimatedDurationMs: 1500,
    });
  }

  return {
    workflowTitle: `Autonomous Workflow: ${prompt.slice(0, 42)}...`,
    summary: `Orchestrator identified ${nodes.length} structured sub-tasks across worker agents with strict RBAC boundary checks and HITL governance.`,
    estimatedDurationSec: Math.ceil(nodes.length * 1.4),
    nodes,
  };
}

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AegisOps] Master Orchestrator Server running on port ${PORT}`);
  });
}

startServer();
