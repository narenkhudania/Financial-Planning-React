
import React, { useMemo } from 'react';
/* Added missing AlertCircle icon */
import { 
  Wallet, TrendingUp, Landmark, ShieldCheck, 
  ArrowRight, PieChart, Calculator, Activity,
  ArrowDownToLine, Zap, CheckCircle2, ChevronRight, AlertCircle
} from 'lucide-react';
import { FinanceState } from '../types';

const MonthlySavingsPlan: React.FC<{ state: FinanceState }> = ({ state }) => {
  const breakdown = useMemo(() => {
    const monthlyIncome = (state.profile.income.salary || 0) + (state.profile.income.investment || 0);
    const survival = state.profile.monthlyExpenses || 0;
    const servicing = (state.loans.find(l => l.type === 'Car Loan')?.emi || 20000) + (state.loans.find(l => l.type === 'Home Loan')?.emi || 70000);
    const success = (15000) + (70000); // 1.8L / 12 + 8.4L / 12

    return {
      income: monthlyIncome,
      survival,
      servicing,
      success,
      totalOutflow: survival + servicing + success,
      netCash: monthlyIncome - (survival + servicing + success)
    };
  }, [state]);

  const silos = [
    { label: 'Survival Silo', desc: 'Lifestyle, Rent & Utilities', val: breakdown.survival, color: 'bg-amber-500', icon: Wallet },
    { label: 'Servicing Silo', desc: 'Debt EMIs & Interest', val: breakdown.servicing, color: 'bg-rose-500', icon: Landmark },
    { label: 'Success Silo', desc: 'Investments & Future Goals', val: breakdown.success, color: 'bg-indigo-600', icon: TrendingUp },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-24">
      {/* Visual Header */}
      <div className="bg-[#0b0f1a] p-12 md:p-16 rounded-[5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
              <Calculator size={14}/> Monthly Budget Terminal
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85]">Cash <br/><span className="text-indigo-500">Partition.</span></h2>
            <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
              Real-time visualization of your ₹{breakdown.income.toLocaleString()} monthly inflow across the <span className="text-white font-bold">Three Pillars of Wealth.</span>
            </p>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 p-10 rounded-[4rem] backdrop-blur-xl flex flex-col items-center gap-3 shadow-inner">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Inflow (Net)</p>
               <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter">₹{breakdown.income.toLocaleString()}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Silo Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {silos.map((silo, idx) => (
          <div key={idx} className="bg-white p-10 rounded-[4rem] border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-indigo-400 transition-all min-h-[400px]">
            <div>
              <div className={`w-16 h-16 ${silo.color} text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-xl shadow-indigo-900/10`}>
                <silo.icon size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{silo.label}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">{silo.desc}</p>
              
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation</span>
                       <span className="text-lg font-black text-slate-900">₹{silo.val.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                       <div className={`h-full ${silo.color} transition-all duration-1000`} style={{ width: `${(silo.val / breakdown.income) * 100}%` }} />
                    </div>
                 </div>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ratio: {((silo.val / breakdown.income) * 100).toFixed(1)}% of income</p>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50">
               <button className="flex items-center justify-between w-full group/btn">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">View Transactions</span>
                  <ChevronRight size={14} className="text-slate-300 group-hover/btn:translate-x-1 group-hover/btn:text-indigo-600 transition-all" />
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Functional Reconciliation Table */}
      <div className="bg-white rounded-[5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
           <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Reconciliation Matrix</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Monthly Flow Accuracy Log</p>
           </div>
           <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 border ${breakdown.netCash >= 0 ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-rose-50 border-rose-500 text-rose-600'}`}>
              {breakdown.netCash >= 0 ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
              <span className="text-[10px] font-black uppercase tracking-widest">Net Position: ₹{breakdown.netCash.toLocaleString()}</span>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-white">
                    <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Bucket Name</th>
                    <th className="px-8 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Budgeted</th>
                    <th className="px-8 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actual spent</th>
                    <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Variance</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {[
                   { name: 'Core Living Expenses', budget: breakdown.survival },
                   { name: 'Debt Servicing (EMIs)', budget: breakdown.servicing },
                   { name: 'Committed Portfolio SIPs', budget: 70000 },
                   { name: 'Govt. Schemes (NPS/EPF)', budget: 15000 },
                 ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                       <td className="px-12 py-8 text-sm font-black text-slate-900">{row.name}</td>
                       <td className="px-8 py-8 text-sm font-bold text-slate-500 text-right">₹{row.budget.toLocaleString()}</td>
                       <td className="px-8 py-8 text-sm font-bold text-slate-500 text-right">₹0</td>
                       <td className="px-12 py-8 text-sm font-black text-emerald-500 text-right">₹{row.budget.toLocaleString()}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlySavingsPlan;
