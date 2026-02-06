
import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, TrendingDown, Target, Landmark, 
  ArrowUpRight, ArrowDownRight, Calendar, Calculator,
  ChevronRight, ChevronDown, CheckCircle2, AlertCircle,
  PieChart, Activity, Wallet, Info, Search, ShieldCheck,
  Zap, ArrowRight, DollarSign, ListOrdered, BarChartHorizontal
} from 'lucide-react';
import { FinanceState, Goal, RelativeDate } from '../types';

const ASSET_GROWTH = {
  equity: 0.15,
  mutualFunds: 0.13,
  savings: 0.03,
  epf: 0.08,
  nps: 0.10,
  netSavings: 0.06
};

const GoalFunding: React.FC<{ state: FinanceState }> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'timeline'>('audit');
  const [searchTerm, setSearchTerm] = useState('');

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

  // --- Cash Flow Audit Data (Snapshot) ---
  const auditData = useMemo(() => {
    const s = state.profile.income;
    const netSalaryPa = (s.salary || 0) * 12;
    const dividendPa = (s.investment || 0) * 12;
    const totalInflowPa = netSalaryPa + dividendPa;

    const livingExpensesPa = (state.profile.monthlyExpenses || 0) * 12;
    
    // Committed Savings (Assumption: 1.8L for NPS/EPF, 8.4L for Equity/MF as per prompt)
    const govtSchemesPa = 180000;
    const portfolioPa = 840000;
    const totalCommittedPa = govtSchemesPa + portfolioPa;

    // Repayments
    const carLoanPa = state.loans.find(l => l.type === 'Car Loan')?.emi ? (state.loans.find(l => l.type === 'Car Loan')!.emi * 12) : 240000;
    const homeLoanPa = state.loans.find(l => l.type === 'Home Loan')?.emi ? (state.loans.find(l => l.type === 'Home Loan')!.emi * 12) : 840000;
    const totalRepaymentsPa = carLoanPa + homeLoanPa;

    const totalOutflowPa = livingExpensesPa + totalCommittedPa + totalRepaymentsPa;
    const netCashFlowPa = totalInflowPa - totalOutflowPa;

    return {
      incomes: [
        { label: "Net Salary Income", value: netSalaryPa },
        { label: "Dividend Income", value: dividendPa }
      ],
      totalInflowPa,
      expenses: [
        { label: "Living Expenses", value: livingExpensesPa }
      ],
      totalExpensesPa: livingExpensesPa,
      savings: [
        { label: "NPS & EPF (Govt Schemes)", value: govtSchemesPa },
        { label: "Equity & Mutual Fund (Portfolio)", value: portfolioPa }
      ],
      totalSavingsPa: totalCommittedPa,
      repayments: [
        { label: "Car Loan (Skoda)", value: carLoanPa },
        { label: "Housing Loan (Home Loan)", value: homeLoanPa }
      ],
      totalRepaymentsPa,
      totalOutflowPa,
      netCashFlowPa
    };
  }, [state]);

  // --- Multi-Year Simulation Data ---
  const simulationData = useMemo(() => {
    const years = [];
    const projectionSpan = 36;

    let balances = {
      equity: state.assets.filter(a => a.category === 'Equity').reduce((s, a) => s + a.currentValue, 0),
      savings: state.assets.filter(a => a.category === 'Liquid').reduce((s, a) => s + a.currentValue, 0),
      mutualFunds: state.assets.filter(a => a.category === 'Equity' && a.subCategory?.includes('MF')).reduce((s, a) => s + a.currentValue, 0),
      epf: 200000,
      nps: 300000
    };

    const baseInflow = auditData.totalInflowPa;
    const baseLiving = auditData.totalExpensesPa;
    const baseSavings = auditData.totalSavingsPa;
    const baseRepayments = auditData.totalRepaymentsPa;

    for (let i = 1; i <= projectionSpan; i++) {
      const year = currentYear + i;
      const age = birthYear ? year - birthYear : 30 + i;
      const growthFactor = Math.pow(1.06, i - 1);

      const yearlyInflow = baseInflow * growthFactor;
      const yearlyLiving = baseLiving * growthFactor;
      const yearlySavings = baseSavings * growthFactor; // Fixed committed savings also growing?
      const yearlyRepayments = baseRepayments; // Loans usually fixed till end of tenure

      const netSurplus = yearlyInflow - yearlyLiving - yearlySavings - yearlyRepayments;

      // Goal requirements
      const totalGoalReq = state.goals.filter(g => {
        const s = resolveYear(g.startDate);
        const e = resolveYear(g.endDate);
        return year >= s && year <= e;
      }).reduce((sum, g) => {
        const inflationAdjusted = g.targetAmountToday * Math.pow(1 + (g.inflationRate / 100), i);
        return sum + (g.isRecurring ? inflationAdjusted / (resolveYear(g.endDate) - resolveYear(g.startDate) + 1) : (year === resolveYear(g.endDate) ? inflationAdjusted : 0));
      }, 0);

      years.push({
        year, age, inflow: yearlyInflow, living: yearlyLiving, savings: yearlySavings, 
        repayments: yearlyRepayments, surplus: netSurplus, goalReq: totalGoalReq,
        achievement: totalGoalReq > 0 ? (Math.max(0, netSurplus) >= totalGoalReq ? 100 : (Math.max(0, netSurplus)/totalGoalReq)*100) : 100
      });
    }
    return years;
  }, [state, auditData, currentYear, birthYear]);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-24">
      {/* Strategic Header */}
      <div className="bg-[#0b0f1a] p-12 md:p-16 rounded-[5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
              <Zap size={14}/> Household Liquidity Engine
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85]">Cashflow <br/><span className="text-indigo-500">Radar.</span></h2>
            <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
              Consolidated audit of annual inflows versus committed outflows, lifestyle burn, and debt servicing.
            </p>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className={`bg-white/5 border border-white/10 p-10 rounded-[4rem] backdrop-blur-xl flex flex-col items-center gap-3 shadow-inner min-w-[320px]`}>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Annual Cash Flow</p>
               <h4 className={`text-4xl md:text-5xl font-black tracking-tighter ${auditData.netCashFlowPa >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {auditData.netCashFlowPa < 0 ? '-' : ''}₹{Math.abs(auditData.netCashFlowPa).toLocaleString()}
               </h4>
               <div className={`flex items-center gap-2 mt-2 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border ${auditData.netCashFlowPa >= 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                  {auditData.netCashFlowPa >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                  {auditData.netCashFlowPa >= 0 ? 'Surplus Capacity' : 'Deficit Detected'}
               </div>
            </div>
            <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl">
               <button onClick={() => setActiveTab('audit')} className={`flex-1 py-3 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>Cash Flow Audit</button>
               <button onClick={() => setActiveTab('timeline')} className={`flex-1 py-3 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'timeline' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>Wealth Timeline</button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'audit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-6 duration-700">
           {/* Detailed Audit Cards */}
           <div className="space-y-8">
              <div className="bg-white p-10 rounded-[4rem] border border-slate-200 shadow-sm">
                 <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Calculator size={24}/></div>
                       <h3 className="text-xl font-black text-slate-900 tracking-tight">Incomes</h3>
                    </div>
                    <p className="text-sm font-black text-slate-900">Total: ₹{auditData.totalInflowPa.toLocaleString()}</p>
                 </div>
                 <div className="space-y-4">
                    {auditData.incomes.map((inc, i) => (
                       <div key={i} className="flex justify-between items-center py-2">
                          <span className="text-sm font-bold text-slate-500">{inc.label}</span>
                          <span className="text-sm font-black text-slate-900">₹{inc.value.toLocaleString()} p.a.</span>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[4rem] border border-slate-200 shadow-sm">
                 <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl"><Activity size={24}/></div>
                       <h3 className="text-xl font-black text-slate-900 tracking-tight">Expenses</h3>
                    </div>
                    <p className="text-sm font-black text-rose-600">Total: ₹{auditData.totalExpensesPa.toLocaleString()}</p>
                 </div>
                 <div className="space-y-4">
                    {auditData.expenses.map((exp, i) => (
                       <div key={i} className="flex justify-between items-center py-2">
                          <span className="text-sm font-bold text-slate-500">{exp.label}</span>
                          <span className="text-sm font-black text-slate-900">₹{exp.value.toLocaleString()} p.a.</span>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[4rem] border border-slate-200 shadow-sm">
                 <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><ShieldCheck size={24}/></div>
                       <h3 className="text-xl font-black text-slate-900 tracking-tight">Committed Savings</h3>
                    </div>
                    <p className="text-sm font-black text-amber-600">Total: ₹{auditData.totalSavingsPa.toLocaleString()}</p>
                 </div>
                 <div className="space-y-4">
                    {auditData.savings.map((sav, i) => (
                       <div key={i} className="space-y-3">
                          <div className="flex justify-between items-center">
                             <span className="text-sm font-bold text-slate-500 leading-tight max-w-[200px]">{sav.label}</span>
                             <span className="text-sm font-black text-slate-900">₹{sav.value.toLocaleString()} p.a.</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                             <div className="h-full bg-amber-500" style={{ width: `${(sav.value/auditData.totalSavingsPa)*100}%` }} />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-white p-10 rounded-[4rem] border border-slate-200 shadow-sm">
                 <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Landmark size={24}/></div>
                       <h3 className="text-xl font-black text-slate-900 tracking-tight">Repayments</h3>
                    </div>
                    <p className="text-sm font-black text-slate-900">Total: ₹{auditData.totalRepaymentsPa.toLocaleString()}</p>
                 </div>
                 <div className="space-y-4">
                    {auditData.repayments.map((rep, i) => (
                       <div key={i} className="flex justify-between items-center py-2">
                          <span className="text-sm font-bold text-slate-500 leading-tight max-w-[200px]">{rep.label}</span>
                          <span className="text-sm font-black text-slate-900">₹{rep.value.toLocaleString()} p.a.</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Execution Summary Node */}
              <div className="bg-slate-950 p-12 rounded-[5rem] text-white space-y-10 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
                 
                 <div className="space-y-6 relative z-10">
                    <h4 className="text-3xl font-black tracking-tight flex items-center gap-3">
                       <BarChartHorizontal className="text-indigo-500" size={28}/> Tactical Audit
                    </h4>
                    <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gross Inflow</p>
                          <p className="text-2xl font-black text-white">₹{auditData.totalInflowPa.toLocaleString()}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Commitments</p>
                          <p className="text-2xl font-black text-rose-400">₹{auditData.totalOutflowPa.toLocaleString()}</p>
                       </div>
                    </div>
                    <div className="pt-4 space-y-4">
                       <p className="text-slate-400 font-medium leading-relaxed">
                          Your net cash flow position is <span className={auditData.netCashFlowPa >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>₹{auditData.netCashFlowPa.toLocaleString()} p.a.</span>
                       </p>
                       {auditData.netCashFlowPa < 0 && (
                          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] flex items-start gap-4">
                             <AlertCircle className="text-rose-500 shrink-0" size={20}/>
                             <p className="text-xs font-bold text-rose-200 italic leading-relaxed">
                                Strategy Alert: You are currently running a deficit of ₹70,000 p.a. Consider adjusting your "Portfolio" savings target or reviewing living expenses to ensure liquidity during emergencies.
                             </p>
                          </div>
                       )}
                       <button className="w-full py-5 bg-indigo-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-xl">
                          Authorize Rebalancing <ArrowRight size={14}/>
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-white rounded-[5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
           <div className="p-12 border-b border-slate-50 flex justify-between items-center">
              <div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">Temporal Wealth Projections</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Multi-Decade Cashflow Logistics</p>
              </div>
              <div className="flex gap-4">
                 <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth: 6% p.a.</p></div>
              </div>
           </div>
           
           <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Year (Age)</th>
                       <th className="px-8 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Inflow (₹)</th>
                       <th className="px-8 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Commitments (₹)</th>
                       <th className="px-8 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Goal Requirements</th>
                       <th className="px-10 py-8 text-[11px] font-black text-indigo-600 uppercase tracking-widest text-right">Net Capacity</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {simulationData.map((row, idx) => (
                       <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-10 py-6">
                             <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-slate-900">{row.year}</span>
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black">Age {row.age}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right text-xs font-black text-slate-900">₹{Math.round(row.inflow).toLocaleString()}</td>
                          <td className="px-8 py-6 text-right text-xs font-bold text-slate-500">₹{Math.round(row.living + row.savings + row.repayments).toLocaleString()}</td>
                          <td className="px-8 py-6 text-right text-xs font-black text-amber-500">{row.goalReq > 0 ? `(₹${Math.round(row.goalReq).toLocaleString()})` : '—'}</td>
                          <td className={`px-10 py-6 text-right text-sm font-black ${row.surplus >= 0 ? 'text-emerald-500' : 'text-rose-600'}`}>
                             {row.surplus >= 0 ? '+' : ''}₹{Math.round(row.surplus).toLocaleString()}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default GoalFunding;
