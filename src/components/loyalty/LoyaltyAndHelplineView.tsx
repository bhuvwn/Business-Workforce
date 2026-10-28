import React, { useState } from 'react';
import {
  Gift,
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  Coins,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  MessageSquare,
  ArrowRight,
  Calculator,
} from 'lucide-react';
import { useOrchestrator } from '../../context/OrchestratorContext';
import { CustomerLoyalty } from '../../types/orchestrator';

export const LoyaltyAndHelplineView: React.FC = () => {
  const {
    customers,
    helplineMessages,
    sendHelplineMessage,
    creditLoyaltyPoints,
    redeemLoyaltyDiscount,
  } = useOrchestrator();

  // Point simulator state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'cust-1');
  const [purchaseAmount, setPurchaseAmount] = useState<number>(350);
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [orderCheckoutTotal, setOrderCheckoutTotal] = useState<number>(800);
  const [redemptionResult, setRedemptionResult] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null);

  // Chatbot input state
  const [chatInput, setChatInput] = useState('');

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const handleEarnPoints = () => {
    if (purchaseAmount <= 0) return;
    const { pointsEarned, newTotal } = creditLoyaltyPoints(selectedCustomerId, purchaseAmount);
    setRedemptionResult({
      message: `Credited +${pointsEarned} points for $${purchaseAmount} purchase (1 pt / $10). New balance: ${newTotal} pts.`,
      type: 'success',
    });
  };

  const handleRedeemDiscount = () => {
    const res = redeemLoyaltyDiscount(selectedCustomerId, discountPercent, orderCheckoutTotal);
    if (res.requiresHITL) {
      setRedemptionResult({
        message: res.message,
        type: 'warning',
      });
    } else if (res.success) {
      setRedemptionResult({
        message: res.message,
        type: 'success',
      });
    } else {
      setRedemptionResult({
        message: res.message,
        type: 'error',
      });
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendHelplineMessage(chatInput.trim());
    setChatInput('');
  };

  const quickChatInquiries = [
    'What is my active loyalty points balance?',
    'Can I apply a 25% discount to my upcoming renewal?',
    'What is the emergency helpline telephone number?',
    'Where can I check order status and invoice delivery?',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner (Glass Panel) */}
      <div className="glass-panel rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 border border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Customer Helpline & Loyalty Agent • Points Engine & Chatbot
              </h2>
              <p className="text-xs text-slate-300/80 mt-0.5">
                Calculates 1 point per $10 spent, manages loyalty tiering, enforces 20% discount safety limit, and resolves 24/7 customer queries.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 glass-pill px-3.5 py-2 rounded-xl text-xs font-mono text-cyan-300">
          <Phone className="w-3.5 h-3.5 text-cyan-400" />
          <span>Priority Helpline: +1 (800) 555-AEGIS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Loyalty Points Directory & Interactive Simulator */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Loyalty Directory */}
          <div className="glass-panel rounded-2xl p-5 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-cyan-400" />
                <span>Customer Loyalty Ledger & Point Balances</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Rule: 1 Point / $10 Spent
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {customers.map((c) => {
                const isSelected = selectedCustomerId === c.id;
                const tierColor = {
                  Bronze: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
                  Silver: 'text-slate-300 bg-slate-500/10 border-slate-400/30',
                  Gold: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
                  Platinum: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
                }[c.tier];

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomerId(c.id);
                      setRedemptionResult(null);
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-950/20 ring-1 ring-cyan-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-xs text-white">{c.customerName}</div>
                        <div className="text-[10px] text-slate-400">{c.email}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${tierColor}`}>
                        {c.tier}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500">Balance: </span>
                        <span className="font-mono font-bold text-cyan-400">{c.pointsBalance} pts</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Lifetime: </span>
                        <span className="font-mono text-slate-300">{c.lifetimePoints}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Earn & Redeem Engine */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Real-Time Points Calculator & Checkout Simulator</span>
                </span>
                <span className="text-xs text-cyan-400 font-medium">
                  Active Client: {selectedCustomer.customerName}
                </span>
              </div>

              {/* Action 1: Earn Points */}
              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-300 mb-2">
                  1. Simulate Inbound Purchase & Accredit Points
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-xs text-slate-500">$</span>
                    <input
                      type="number"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(parseInt(e.target.value, 10) || 0)}
                      className="w-full pl-6 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      placeholder="Purchase Total"
                    />
                  </div>
                  <button
                    onClick={handleEarnPoints}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    Credit Points (+{Math.floor(purchaseAmount / 10)} pts)
                  </button>
                </div>
              </div>

              {/* Action 2: Redeem Discount */}
              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] font-semibold text-slate-300">
                    2. Redeem Points for Checkout Discount
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">
                    Autonomous Max: 20% (&gt;20% requires HITL)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Order Total ($)</label>
                    <input
                      type="number"
                      value={orderCheckoutTotal}
                      onChange={(e) => setOrderCheckoutTotal(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Discount % ({discountPercent * 20} pts needed)
                    </label>
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {discountPercent > 20 && (
                  <div className="mb-3 p-2 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      Safety Threshold: {discountPercent}% discount exceeds 20%. Supervisor HITL Agent will pause execution for sign-off!
                    </span>
                  </div>
                )}

                <button
                  onClick={handleRedeemDiscount}
                  className={`w-full py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center space-x-2 transition ${
                    discountPercent > 20
                      ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>
                    {discountPercent > 20
                      ? `Request ${discountPercent}% Discount (Triggers HITL)`
                      : `Redeem ${discountPercent}% Discount Autonomously`}
                  </span>
                </button>
              </div>

              {/* Feedback Alert */}
              {redemptionResult && (
                <div
                  className={`p-3 rounded-lg text-xs border ${
                    redemptionResult.type === 'success'
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      : redemptionResult.type === 'warning'
                      ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                      : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {redemptionResult.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Automated Helpline Chatbot Simulator */}
        <div className="lg:col-span-5 bg-[#0e1424] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[640px]">
          {/* Chatbot Header */}
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Aura Helpline Agent</h3>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online • Autonomous 24/7
                </span>
              </div>
            </div>

            <span className="text-[10px] text-slate-500 font-mono">
              Helpline #AEG-8821
            </span>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
            {helplineMessages.map((msg) => {
              const isCustomer = msg.sender === 'customer';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md ${
                      isCustomer
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {!isCustomer && (
                      <div className="text-[10px] font-bold text-cyan-400 mb-1 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Aura (Helpline Agent)</span>
                      </div>
                    )}
                    <p className="leading-relaxed">{msg.text}</p>

                    {msg.intentDetected && (
                      <div className="mt-2 pt-1 border-t border-slate-800 text-[9px] font-mono text-cyan-300">
                        Intent: {msg.intentDetected}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Inquiry Chips */}
          <div className="pt-2 pb-2 border-t border-slate-800 flex flex-wrap gap-1.5">
            {quickChatInquiries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sendHelplineMessage(q);
                }}
                className="text-[10px] px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition truncate max-w-full text-left"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask customer helpline or query points..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
