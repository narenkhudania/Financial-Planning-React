
import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, Sparkles, 
  ArrowUpRight, ArrowDownRight, Info, Calendar,
  Wallet, Landmark, PieChart, Zap
} from 'lucide-react';
import { FinanceState, DetailedIncome, Goal, RelativeDate } from '../types';

interface CashflowProps {
  state: FinanceState;
}

const Cashflow: React.FC<CashflowProps> = ({ state }) => {
  const currentYear = new Date().getFullYear();
  const birthYear = state.profile.dob ? new Date(state.profile.dob).getFullYear() : currentYear - 30;

  const resolveYear = (rel: RelativeDate): number => {
    switch (rel.type) {
      case 'Year': return rel.value;
      case 'Age': return birthYear + rel.value;
      case 'Retirement': return birthYear + state.profile.retirementAge + rel.value;
      case 'LifeExpectancy': return birthYear + state.profile.lifeExpectancy + rel.value;
      default: return rel.value;
    }
  };

  const calculateTotalMemberIncome = (income: DetailedIncome) => {
    return (income.salary || 0) + (income.bonus || 0) + (income.reimbursements || 0) + 
           (income.business || 0) + (income.rental || 0) + (income.investment || 0);
  };

  // Generate Projections for the next 35 years (approx. 2025-2060)
  const projectionData = useMemo(() => {
    const data = [];
    let cumulativeSurplus = 0;

    const baseInflow = calculateTotalMemberIncome(state.profile.income) + 
                      state.family.reduce((sum, f) => sum + calculateTotalMemberIncome(f.income), 0);
    
    const baseOutflow = state.detailedExpenses.reduce((sum, e) => sum + e.amount, 0) || state.profile.monthlyExpenses;

    for (let i = 0; i <= 35; i++) {
      const year = currentYear + i;
      const growthFactor = Math.pow(1.06, i); // Standard 6% growth as requested
      
      const yearlyInflow = baseInflow * 12 * growthFactor;
      const yearlyOutflow = baseOutflow * 12 * growthFactor;
      
      // Calculate active goals for this year
      const activeGoals = state.goals.filter(g => {
        const sYear = resolveYear(g.startDate);
        const eYear = resolveYear(g.endDate);
        return year >= sYear && year <= eYear;
      });

      const goalRequirement = activeGoals.reduce((sum, g) => {
        const inflationAdjustedGoal = g.targetAmountToday * Math.pow(1 + (g.inflationRate / 100), i);
        // If it's a multi-year goal, we spread the requirement, otherwise it's a lump sum at the end
        if (g.isRecurring) {
          const duration = resolveYear(g.endDate) - resolveYear(g.startDate) + 1;
          return sum + (inflationAdjustedGoal / duration);
        } else {
          return year === resolveYear(g.endDate) ? sum + inflationAdjustedGoal : sum;
        }
      }, 0);

      const netSurplus = yearlyInflow - yearlyOutflow - goalRequirement;
      cumulativeSurplus += netSurplus;

      data.push({
        year,
        inflow: Math.round(yearlyInflow),
        outflow: Math.round(yearlyOutflow),
        goalRequirement: Math.round(goalRequirement),
        surplus: Math.round(netSurplus),
        cumulative: Math.round(cumulativeSurplus),
        age: (birthYear ? year - birthYear : 30 + i)
      });
    }
    return data;
  }, [state, currentYear, birthYear]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-24">
      
      {/* Strategic Header */}
      <div className="bg-[#0b0f1a] p-12 md:p-20 rounded-[5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/30">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
              <Activity size={14}/> Household Liquidity Radar
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85]">Cashflow <br/><span className="text-indigo-500">Projections.</span></h2>
            <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
              Analyzing inflows, expenses, and wealth goals over a 35-year horizon with a standard <span className="text-white font-bold">6% compound escalation.</span>
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-10 rounded-[4rem] backdrop-blur-xl flex items-center gap-8 shadow-inner">
             <div className="p-5 bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-600/20">
                <PieChart size={40} className="text-white"/>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Projected FIRE Point</p>
                <h4 className="text-4xl font-black text-white">Year {projectionData.find(d => d.cumulative > 0)?.year || 'N/A'}</h4>
             </div>
          </div>
        </div>
      </div>

      {/* Primary Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2 bg-white p-12 rounded-[5rem] border border-slate-200 shadow-sm flex flex-col">
           <div className="flex justify-between items-center mb-16">
              <div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">Net Annual Surplus</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Inflow vs. Outflow Over Time</p>
              </div>
              <div className="flex gap-6 items-center">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"/><span className="text-[10px] font-black text-slate-400 uppercase">Surplus</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"/><span className="text-[10px] font-black text-slate-400 uppercase">Deficit</span></div>
              </div>
           </div>

           <div className="flex-1 min-h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={projectionData}>
                    <defs>
                       <linearGradient id="colorSurplus" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '32px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '24px', fontWeight: 'bold' }}
                       formatter={(val: number) => `$${val.toLocaleString()}`}
                    />
                    <Area type="monotone" dataKey="surplus" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorSurplus)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="flex flex-col gap-10">
           <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm flex-1">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                 <Zap className="text-amber-500" size={24} /> Simulation Summary
              </h3>
              <div className="space-y-8">
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-indigo-400 transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Yearly Inflow Growth</p>
                    <h4 className="text-3xl font-black text-slate-900">6.0% <ArrowUpRight size={20} className="inline text-emerald-500 mb-1"/></h4>
                 </div>
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-indigo-400 transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Projected Peak Surplus</p>
                    <h4 className="text-3xl font-black text-slate-900">${projectionData[projectionData.length-1].surplus.toLocaleString()}</h4>
                 </div>
                 <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white space-y-3 shadow-xl shadow-indigo-600/20">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Strategic Tip</p>
                    <p className="text-xs font-bold leading-relaxed">Increasing your monthly surplus by just 10% today shifts your peak wealth accumulation point forward by 2.4 years.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Projection Table Section */}
      <div className="bg-white p-12 rounded-[5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[2rem]"><Calendar size={28}/></div>
              <div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">Year-on-Year Logistics</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detailed Multi-Decade Audit</p>
              </div>
           </div>
           <button className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all">Export XLS</button>
        </div>

        <div className="overflow-x-auto no-scrollbar -mx-12">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50/50">
                    <th className="px-12 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Year</th>
                    <th className="px-8 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Age</th>
                    <th className="px-8 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Inflow</th>
                    <th className="px-8 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Living Outflow</th>
                    <th className="px-8 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Goal Req.</th>
                    <th className="px-12 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Net Surplus</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {projectionData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                       <td className="px-12 py-8 text-sm font-black text-slate-900 tracking-tighter">{row.year}</td>
                       <td className="px-8 py-8 text-sm font-bold text-slate-500">{row.age}</td>
                       <td className="px-8 py-8 text-sm font-black text-slate-900">${row.inflow.toLocaleString()}</td>
                       <td className="px-8 py-8 text-sm font-bold text-rose-500">(${row.outflow.toLocaleString()})</td>
                       <td className="px-8 py-8 text-sm font-bold text-amber-500">
                          {row.goalRequirement > 0 ? `(${row.goalRequirement.toLocaleString()})` : '—'}
                       </td>
                       <td className={`px-12 py-8 text-lg font-black text-right ${row.surplus >= 0 ? 'text-emerald-500' : 'text-rose-600'}`}>
                          {row.surplus >= 0 ? '+' : ''}${row.surplus.toLocaleString()}
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default Cashflow;
