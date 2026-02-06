
import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  TrendingUp, Target, Activity, Calculator,
  Zap, Wallet, Landmark, BrainCircuit,
  ArrowRight, ShieldCheck, CheckCircle2, 
  ChevronRight, ArrowUpRight, ShieldAlert, Sparkles,
  Receipt, Briefcase, AlertCircle, Car, CreditCard,
  LayoutGrid, ArrowDownRight, Users, ListChecks
} from 'lucide-react';
import { FinanceState, DetailedIncome, View } from '../types';

interface DashboardProps {
  state: FinanceState;
  setView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, setView }) => {
  const calculateTotalMemberIncome = (income: DetailedIncome) => {
    return (income.salary || 0) + (income.bonus || 0) + (income.reimbursements || 0) + 
           (income.business || 0) + (income.rental || 0) + (income.investment || 0);
  };

  const totalAssets = useMemo(() => state.assets.reduce((sum, a) => sum + a.currentValue, 0), [state.assets]);
  const totalLoans = useMemo(() => state.loans.reduce((sum, l) => sum + l.outstandingAmount, 0), [state.loans]);
  const netWorth = totalAssets - totalLoans;

  const householdIncome = useMemo(() => {
    const selfIncome = calculateTotalMemberIncome(state.profile.income);
    const familyIncome = state.family.reduce((sum, f) => sum + calculateTotalMemberIncome(f.income), 0);
    return selfIncome + familyIncome;
  }, [state.profile, state.family]);

  const householdExpenses = useMemo(() => {
    return state.detailedExpenses.reduce((sum, e) => sum + e.amount, 0) || state.profile.monthlyExpenses;
  }, [state.detailedExpenses, state.profile.monthlyExpenses]);

  const totalMonthlyDebt = state.loans.reduce((sum, l) => sum + l.emi, 0);
  const surplusValue = householdIncome - householdExpenses - totalMonthlyDebt;
  const savingsRate = householdIncome > 0 ? (surplusValue / householdIncome) * 100 : 0;
  const dtiRatio = householdIncome > 0 ? ((totalMonthlyDebt * 12) / (householdIncome * 12)) * 100 : 0;

  const initializationSteps = useMemo(() => [
    { 
      id: 'family', 
      label: 'Household Node', 
      desc: 'Define earners and dependents',
      isComplete: state.family.length > 0 || state.profile.firstName !== '',
      icon: Users,
      view: 'family' as View
    },
    { 
      id: 'inflow', 
      label: 'Inflow Profile', 
      desc: 'Map monthly household income',
      isComplete: householdIncome > 0,
      icon: TrendingUp,
      view: 'inflow' as View
    },
    { 
      id: 'outflow', 
      label: 'Burn Profile', 
      desc: 'Log lifestyle and fixed costs',
      isComplete: state.detailedExpenses.length > 0,
      icon: ArrowDownRight,
      view: 'outflow' as View
    },
    { 
      id: 'assets', 
      label: 'Asset Inventory', 
      desc: 'Audit holdings and savings',
      isComplete: state.assets.length > 0,
      icon: Landmark,
      view: 'assets' as View
    },
    { 
      id: 'debt', 
      label: 'Liability Map', 
      desc: 'Register loans and credit EMIs',
      isComplete: state.loans.length > 0,
      icon: CreditCard,
      view: 'debt' as View
    },
    { 
      id: 'goals', 
      label: 'Mission Targets', 
      desc: 'Set life milestones and priority',
      isComplete: state.goals.length > 0,
      icon: Target,
      view: 'goals' as View
    },
  ], [householdIncome, state.detailedExpenses, state.assets, state.loans, state.goals, state.family, state.profile.firstName]);

  const completionPct = Math.round((initializationSteps.filter(s => s.isComplete).length / initializationSteps.length) * 100);
  const isFullyInitialized = completionPct === 100;

  const wellnessData = useMemo(() => {
    const riskScore = state.riskProfile?.score || 20;
    const insuranceScore = state.insurance.length > 0 ? 80 : 20;
    const debtScore = totalLoans === 0 && totalAssets > 0 ? 100 : Math.max(0, 100 - (totalLoans / (totalAssets || 1) * 100));
    const savingsScore = Math.min(100, savingsRate * 3);
    const goalScore = state.goals.length > 0 ? 85 : 20;

    return [
      { subject: 'Risk', A: riskScore, fullMark: 100 },
      { subject: 'Shield', A: insuranceScore, fullMark: 100 },
      { subject: 'Debt', A: debtScore, fullMark: 100 },
      { subject: 'Savings', A: savingsScore, fullMark: 100 },
      { subject: 'Goals', A: goalScore, fullMark: 100 },
    ];
  }, [state, totalAssets, totalLoans, savingsRate]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      
      {/* Onboarding Directive */}
      {!isFullyInitialized && (
        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                <Zap size={14} className="animate-pulse"/> Initialization Required
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">Your Strategy Terminal <br/><span className="text-indigo-600 underline decoration-indigo-100 underline-offset-8">is Offline.</span></h2>
              <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-md">
                Complete your financial node mapping to activate automated cashflow waterfalls and net worth tracking.
              </p>
              <div className="space-y-2 pt-2">
                 <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress to Synchronization</span>
                    <span className="text-2xl font-black text-slate-900">{completionPct}%</span>
                 </div>
                 <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                    <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${completionPct}%` }} />
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {initializationSteps.map((step) => (
                 <button 
                   key={step.id}
                   onClick={() => setView(step.view)}
                   className={`flex items-center gap-4 p-4 rounded-3xl transition-all border text-left group ${
                     step.isComplete 
                       ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                       : 'bg-slate-50 border-slate-100 text-slate-900 hover:border-indigo-300 hover:bg-white'
                   }`}
                 >
                    <div className={`p-2.5 rounded-2xl shrink-0 ${step.isComplete ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300 group-hover:text-indigo-600 transition-colors shadow-sm'}`}>
                       <step.icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-xs font-black tracking-tight">{step.label}</h4>
                       <p className={`text-[8px] font-bold uppercase tracking-widest ${step.isComplete ? 'text-emerald-500/80' : 'text-slate-400'}`}>
                         {step.isComplete ? 'Complete' : 'Pending'}
                       </p>
                    </div>
                    {step.isComplete ? (
                      <CheckCircle2 size={16} className="shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                    )}
                 </button>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Node */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Household Equity', value: `₹${netWorth.toLocaleString()}`, sub: 'Net Worth Node', icon: Landmark, color: 'indigo' },
          { label: 'Net Monthly Surplus', value: `₹${surplusValue.toLocaleString()}`, sub: `${Math.round(savingsRate)}% Savings Rate`, icon: Wallet, color: 'emerald' },
          { label: 'Debt Service Load', value: `${dtiRatio.toFixed(1)}%`, sub: 'Income-to-Debt Ratio', icon: CreditCard, color: dtiRatio > 40 ? 'rose' : 'slate' },
          { label: 'Asset Capacity', value: `₹${totalAssets.toLocaleString()}`, sub: 'Total Capital Holdings', icon: TrendingUp, color: 'amber' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className={`w-12 h-12 mb-6 rounded-2xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
              <stat.icon size={22}/>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h4>
            <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase flex items-center gap-1.5">
               <span className={`w-1 h-1 rounded-full bg-${stat.color}-500`} /> {stat.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trajectory Insight */}
        <div className="lg:col-span-2 bg-slate-950 p-10 md:p-14 rounded-[4rem] text-white relative overflow-hidden shadow-2xl border border-white/5">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
           <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center h-full">
              <div className="flex-1 space-y-10">
                 <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                       <Activity size={14}/> Actuarial Pulse
                    </div>
                    <h3 className="text-5xl font-black tracking-tight leading-none">Wealth <br/><span className="text-indigo-500">Stability.</span></h3>
                    <p className="text-slate-400 font-medium text-base leading-relaxed">A mathematical visualization of your digital twin across core life vectors.</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all cursor-pointer" onClick={() => setView('inflow')}>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Monthly Inflow</p>
                       <p className="text-xl font-black">₹{householdIncome.toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all cursor-pointer" onClick={() => setView('outflow')}>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Burn Rate</p>
                       <p className="text-xl font-black text-rose-400">₹{(householdExpenses + totalMonthlyDebt).toLocaleString()}</p>
                    </div>
                 </div>

                 <button onClick={() => setView('cashflow')} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 transition-all rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl">
                    View Cashflow Matrix <ArrowRight size={16}/>
                 </button>
              </div>

              <div className="w-full md:w-80 h-72 shrink-0 bg-white/5 rounded-[3.5rem] p-8 border border-white/10 backdrop-blur-sm flex items-center justify-center shadow-inner">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={wellnessData}>
                      <PolarGrid stroke="#ffffff10" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                      <Radar name="Status" dataKey="A" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.2} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Tactical Alerts Feed */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col h-full">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                 {/* Fixed: Added ListChecks to imports at the top and used here */}
                 <div className="p-2.5 bg-slate-900 text-white rounded-xl"><ListChecks size={20}/></div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Operations.</h3>
              </div>
              <div className={`w-2 h-2 rounded-full ${isFullyInitialized ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
           </div>

           <div className="space-y-5 flex-1 overflow-y-auto no-scrollbar">
              {!isFullyInitialized ? (
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center space-y-4">
                   <AlertCircle size={32} className="text-slate-300 mx-auto"/>
                   <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                     Terminal offline. Complete the initialization steps to view tactical actions.
                   </p>
                </div>
              ) : (
                <>
                  <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-lg transition-all" onClick={() => setView('investment-plan')}>
                     <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={12} className="text-indigo-600"/>
                        <span className="text-[9px] font-black uppercase text-indigo-600">Rebalance Alert</span>
                     </div>
                     <p className="text-xs font-bold text-slate-700 leading-snug">Asset allocation drifted by 14%. Adjust SIPs to match risk DNA.</p>
                  </div>
                  <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-lg transition-all" onClick={() => setView('tax-estate')}>
                     <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck size={12} className="text-emerald-600"/>
                        <span className="text-[9px] font-black uppercase text-emerald-600">Compliance Audit</span>
                     </div>
                     <p className="text-xs font-bold text-slate-700 leading-snug">New Tax Regime migration suggested. Savings potential: ₹4,500/mo.</p>
                  </div>
                </>
              )}
           </div>

           <button onClick={() => setView('action-plan')} className="mt-8 py-5 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
              View Strategy Map
           </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
