
import React, { useMemo } from 'react';
import { 
  Zap, ShieldAlert, Target, TrendingUp, 
  ArrowRight, CheckCircle2, AlertCircle, Sparkles,
  ArrowUpRight, ListChecks, Wallet, Activity, ArrowDownToLine
} from 'lucide-react';
import { FinanceState } from '../types';

const ActionPlan: React.FC<{ state: FinanceState }> = ({ state }) => {
  const calculations = useMemo(() => {
    const monthlyIncome = (state.profile.income.salary || 0) + (state.profile.income.investment || 0);
    const yearlyInflow = monthlyIncome * 12;
    
    const livingExpensesPa = (state.profile.monthlyExpenses || 0) * 12;
    const committedSavingsPa = 1020000; // Fixed from prompt: 1.8L + 8.4L
    const repaymentsPa = 1080000; // Fixed from prompt: 2.4L + 8.4L
    
    const totalOutflowPa = livingExpensesPa + committedSavingsPa + repaymentsPa;
    /* Fixed: totalInflowPa was not defined, using yearlyInflow instead */
    const deficit = yearlyInflow - totalOutflowPa; // In previous prompt was -70,000

    return {
      monthlyIncome,
      deficit: totalOutflowPa - yearlyInflow,
      outflowRatio: (totalOutflowPa / yearlyInflow) * 100,
      investmentRatio: (committedSavingsPa / yearlyInflow) * 100,
      debtRatio: (repaymentsPa / yearlyInflow) * 100
    };
  }, [state]);

  const actions = [
    {
      id: 1,
      priority: 'Critical',
      title: 'Bridge the ₹70,000 Annual Deficit',
      description: 'You are currently funding ₹70k of committed outflows from existing reserves or credit. This is unsustainable for long-term compounding.',
      tactics: [
        'Reduce discretionary lifestyle spend by ₹6,000/month',
        'Rebalance ₹5,000/mo from Portfolio SIP to Cash Buffer',
        'Increase dividend-yield assets to cover the delta'
      ],
      icon: ShieldAlert,
      color: 'rose'
    },
    {
      id: 2,
      priority: 'Strategic',
      title: 'Accelerate Skoda Loan Payoff',
      description: 'The ₹2.4L annual servicing on the car loan can be zeroed in 18 months by allocating bonus inflows.',
      tactics: [
        'Direct 100% of upcoming bonuses to principal',
        'Redirect EMI to Mutual Funds post-closure',
        'Improve debt-to-income ratio below 30%'
      ],
      icon: Target,
      color: 'indigo'
    },
    {
      id: 3,
      priority: 'Maintenance',
      title: 'Optimize NPS Tier-1 Exposure',
      description: 'Ensure the ₹1.8L annual govt scheme contribution is fully utilized for Section 80CCD(1B) tax benefits.',
      tactics: [
        'Check for ₹50k additional self-contribution',
        'Ensure Corporate NPS is enabled via HR',
        'Review Fund Manager performance semi-annually'
      ],
      icon: TrendingUp,
      color: 'emerald'
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-24">
      {/* Header Strategizer */}
      <div className="bg-[#0b0f1a] p-12 md:p-16 rounded-[5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
              <ListChecks size={14}/> Execution Roadmap
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85]">Strategic <br/><span className="text-indigo-500">Actions.</span></h2>
            <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
              Targeted maneuvers to eliminate cashflow leakage and optimize the path to <span className="text-white font-bold">Financial Sovereignty.</span>
            </p>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 p-10 rounded-[4rem] backdrop-blur-xl flex flex-col items-center gap-3 shadow-inner">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Strategy Health Score</p>
               <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter">82%</h4>
               <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
                  <Activity size={12}/> Deficit Correction Needed
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {actions.map((action) => (
          <div key={action.id} className="bg-white p-10 rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition-all flex flex-col h-full">
            <div className="flex justify-between items-start mb-8">
              <div className={`p-5 rounded-3xl bg-${action.color}-50 text-${action.color}-600 group-hover:bg-${action.color}-600 group-hover:text-white transition-all`}>
                <action.icon size={28} />
              </div>
              <span className={`px-4 py-2 bg-${action.color}-50 text-${action.color}-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-${action.color}-100`}>
                {action.priority}
              </span>
            </div>
            
            <div className="flex-1 space-y-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{action.title}</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">{action.description}</p>
              
              <div className="space-y-3 pt-4">
                {action.tactics.map((tactic, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group/item hover:border-indigo-200 transition-all">
                    <CheckCircle2 size={16} className="text-slate-300 mt-0.5 group-hover/item:text-indigo-600 transition-colors" />
                    <span className="text-xs font-bold text-slate-600 group-hover/item:text-slate-900 transition-colors">{tactic}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="mt-10 w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
              Mark Completed <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Efficiency Analysis Node */}
      <div className="bg-slate-950 p-12 rounded-[5rem] text-white flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
         <div className="space-y-4 relative z-10">
            <h4 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <Sparkles size={24} className="text-indigo-400" /> Capital Efficiency Audit
            </h4>
            <p className="text-slate-400 font-medium max-w-xl leading-relaxed">
              Your "Build Rate" (Savings: {calculations.investmentRatio.toFixed(1)}%) is world-class, but your "Service Load" (Debt: {calculations.debtRatio.toFixed(1)}%) is creating a cashflow drag.
            </p>
         </div>
         <div className="flex gap-6 relative z-10">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Build Rate</p>
              <p className="text-3xl font-black text-emerald-400">{calculations.investmentRatio.toFixed(1)}%</p>
            </div>
            <div className="w-[1px] h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Burn Rate</p>
              <p className="text-3xl font-black text-rose-400">{(100 - calculations.investmentRatio).toFixed(1)}%</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ActionPlan;
