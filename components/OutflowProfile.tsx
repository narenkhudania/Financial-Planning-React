
import React, { useMemo } from 'react';
import { 
  Receipt, ShoppingCart, Users, Activity, Sparkles, Briefcase, 
  HeartPulse, Home, Zap, CreditCard, ArrowDownRight, ShieldCheck
} from 'lucide-react';
import { FinanceState } from '../types';

interface OutflowProfileProps {
  state: FinanceState;
  updateState: (data: Partial<FinanceState>) => void;
}

const EXPENSE_CATEGORIES = [
  { name: 'Household/Grocery/Maid', icon: ShoppingCart },
  { name: 'Parents Support', icon: Users },
  { name: 'Travel/Fuel', icon: Activity },
  { name: 'Festival/Gathering', icon: Sparkles },
  { name: 'Education', icon: Briefcase },
  { name: 'Gift/Charity', icon: HeartPulse },
  { name: 'Maintenance/Repair/Tax', icon: Home },
  { name: 'Medical Expenses', icon: Activity },
  { name: 'Utility Bills', icon: Zap },
  { name: 'Shopping/Dining', icon: ShoppingCart },
  { name: 'Personal Care/Gym', icon: Activity },
] as const;

const OutflowProfile: React.FC<OutflowProfileProps> = ({ state, updateState }) => {
  const handleExpenseChange = (categoryName: string, amount: number) => {
    const existing = state.detailedExpenses.find(e => e.category === categoryName);
    let newExpenses;
    if (existing) {
      newExpenses = state.detailedExpenses.map(e => e.category === categoryName ? { ...e, amount } : e);
    } else {
      newExpenses = [...state.detailedExpenses, { category: categoryName, amount, inflationRate: 6, tenure: 34 }];
    }
    updateState({ detailedExpenses: newExpenses });
  };

  const totalMonthlyExpenses = state.detailedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalMonthlyDebt = state.loans.reduce((sum, l) => sum + l.emi, 0);
  const totalMonthlyOutflow = totalMonthlyExpenses + totalMonthlyDebt;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      <div className="bg-[#0b0f1a] p-12 md:p-16 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-rose-500/10 text-rose-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-rose-500/20">
              <ArrowDownRight size={14}/> Burn Matrix
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85]">Outflow <br/><span className="text-rose-500">Profile.</span></h2>
            <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
              Consolidated audit of <span className="text-white">Lifestyle Expenses</span> and <span className="text-white">Committed Debt Servicing</span>.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-10 rounded-[4rem] backdrop-blur-xl flex flex-col items-center gap-3 shadow-inner min-w-[320px]">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Monthly Burn Rate</p>
             <h4 className="text-4xl md:text-5xl font-black tracking-tighter text-rose-400">
                ₹{totalMonthlyOutflow.toLocaleString()}
             </h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3"><Receipt size={24} className="text-indigo-600"/> Lifestyle Audit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {EXPENSE_CATEGORIES.map((cat) => (
                    <div key={cat.name} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4 group hover:bg-white hover:border-indigo-300 transition-all">
                       <div className="p-3 bg-white text-slate-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><cat.icon size={18}/></div>
                       <div className="flex-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{cat.name}</p>
                          <div className="relative">
                             <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
                             <input 
                                type="number" 
                                value={state.detailedExpenses.find(e => e.category === cat.name)?.amount || ''} 
                                onChange={e => handleExpenseChange(cat.name, parseFloat(e.target.value) || 0)}
                                className="w-full bg-transparent pl-5 font-black text-xl outline-none"
                                placeholder="0"
                             />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-950 p-12 rounded-[4rem] text-white space-y-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-5"><CreditCard size={120}/></div>
              <h3 className="text-2xl font-black relative z-10 leading-none">Servicing Silo</h3>
              <div className="space-y-4 relative z-10">
                 {state.loans.map(loan => (
                    <div key={loan.id} className="flex justify-between items-center p-5 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-colors">
                       <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{loan.type}</p>
                          <p className="text-sm font-black">{loan.source}</p>
                       </div>
                       <p className="text-xl font-black text-rose-400">₹{loan.emi.toLocaleString()}</p>
                    </div>
                 ))}
                 {state.loans.length === 0 && <p className="text-xs text-slate-500 italic px-2">No active EMI obligations detected.</p>}
              </div>
              <div className="pt-8 border-t border-white/5 relative z-10 flex justify-between items-center px-2">
                 <p className="text-[10px] font-black uppercase text-slate-500">Aggregated EMIs</p>
                 <p className="text-2xl font-black text-rose-500">₹{totalMonthlyDebt.toLocaleString()}</p>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm flex items-center gap-6">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><ShieldCheck size={28}/></div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Benchmark</p>
                 <h4 className="text-lg font-black text-slate-900">{Math.round((totalMonthlyOutflow / (state.profile.income.salary || 1)) * 100)}% Consumption Ratio</h4>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OutflowProfile;
