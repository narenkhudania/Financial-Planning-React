
import React, { useState, useMemo } from 'react';
import { 
  Calculator, Briefcase, TrendingUp, Home, ChevronRight, 
  Users, ArrowUpRight, Wallet, Landmark, LineChart, 
  CheckCircle2, Plus, Coins, Sparkles
} from 'lucide-react';
import { FinanceState, DetailedIncome } from '../types';

interface InflowProfileProps {
  state: FinanceState;
  updateState: (data: Partial<FinanceState>) => void;
}

const InflowProfile: React.FC<InflowProfileProps> = ({ state, updateState }) => {
  const [selectedId, setSelectedId] = useState<'self' | string>('self');

  const members = useMemo(() => [
    { id: 'self', name: state.profile.firstName || 'Primary Member', relation: 'Self', income: state.profile.income },
    ...state.family.map(f => ({ id: f.id, name: f.name, relation: f.relation, income: f.income }))
  ], [state.profile, state.family]);

  const currentMember = useMemo(() => 
    members.find(m => m.id === selectedId) || members[0]
  , [members, selectedId]);

  const updateIncomeField = (field: keyof DetailedIncome, value: number) => {
    if (selectedId === 'self') {
      updateState({
        profile: {
          ...state.profile,
          income: { ...state.profile.income, [field]: value }
        }
      });
    } else {
      updateState({
        family: state.family.map(f => 
          f.id === selectedId 
            ? { ...f, income: { ...f.income, [field]: value } }
            : f
        )
      });
    }
  };

  const totalHouseholdInflow = useMemo(() => {
    return members.reduce((acc, m) => {
      const i = m.income;
      return acc + (i.salary || 0) + (i.bonus || 0) + (i.reimbursements || 0) + 
             (i.business || 0) + (i.rental || 0) + (i.investment || 0);
    }, 0);
  }, [members]);

  const IncomeInput = ({ label, icon: Icon, value, field }: any) => (
    <div className="group bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 hover:border-indigo-400 transition-all shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 md:p-3 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-xl md:rounded-2xl transition-all">
          <Icon size={16} md:size={18} />
        </div>
        <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      </div>
      <div className="relative">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl md:text-2xl">₹</span>
        <input 
          type="number"
          value={value || ''}
          placeholder="0"
          onChange={(e) => updateIncomeField(field, parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent pl-6 md:pl-8 py-1 md:py-2 text-xl md:text-2xl font-black text-slate-900 outline-none placeholder:text-slate-100"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Strategic Header */}
      <div className="bg-[#0b0f1a] p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-12">
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-indigo-500/10 text-indigo-300 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
              <TrendingUp size={14}/> Node Calibration
            </div>
            <h2 className="text-3xl md:text-7xl font-black tracking-tighter leading-tight md:leading-[0.85]">Inflow <br/><span className="text-indigo-500">Analysis.</span></h2>
            <p className="text-slate-400 text-sm md:text-lg font-medium max-w-lg leading-relaxed">
              Mapping all household income channels. Adjust <span className="text-white">Active Salary</span> and <span className="text-white">Passive Yields</span>.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-8 md:p-10 rounded-[2rem] md:rounded-[4rem] backdrop-blur-xl flex flex-col items-center gap-2 md:gap-3 shadow-inner md:min-w-[320px] w-full md:w-auto">
             <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Monthly Inflow</p>
             <h4 className="text-3xl md:text-5xl font-black tracking-tighter text-emerald-400">
                ₹{totalHouseholdInflow.toLocaleString()}
             </h4>
          </div>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="px-2 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Household Earner Node</h3>
        <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2">
          {members.map(member => (
            <button
              key={member.id}
              onClick={() => setSelectedId(member.id)}
              className={`relative flex-shrink-0 w-44 md:w-56 p-5 md:p-7 rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all text-left group ${
                selectedId === member.id 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-2xl' 
                  : 'bg-white border-slate-200 text-slate-900 hover:border-indigo-300'
              }`}
            >
              <p className={`text-[8px] md:text-[10px] font-black uppercase mb-1 ${selectedId === member.id ? 'text-slate-500' : 'text-slate-400'}`}>{member.relation}</p>
              <h4 className="text-base md:text-xl font-black tracking-tight truncate">{member.name}</h4>
              <div className="mt-4 md:mt-6 flex items-center justify-between">
                <span className={`text-[8px] md:text-[10px] font-bold ${selectedId === member.id ? 'text-indigo-400' : 'text-indigo-600'}`}>
                   ₹{((member.income.salary || 0) + (member.income.bonus || 0)).toLocaleString()} /mo
                </span>
                {selectedId === member.id && <CheckCircle2 size={14} className="text-indigo-400" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="space-y-4 md:space-y-8">
           <h4 className="px-4 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Core Earnings</h4>
           <IncomeInput label="Monthly Net Salary" icon={Briefcase} value={currentMember.income.salary} field="salary" />
           <IncomeInput label="Annual Regular Bonus" icon={Sparkles} value={currentMember.income.bonus} field="bonus" />
           <IncomeInput label="Company Reimbursements" icon={Coins} value={currentMember.income.reimbursements} field="reimbursements" />
        </div>
        <div className="space-y-4 md:space-y-8">
           <h4 className="px-4 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Secondary Flows</h4>
           <IncomeInput label="Side Venture / Business" icon={Calculator} value={currentMember.income.business} field="business" />
           <IncomeInput label="Rental Yield" icon={Home} value={currentMember.income.rental} field="rental" />
           <IncomeInput label="Portfolio Dividends" icon={TrendingUp} value={currentMember.income.investment} field="investment" />
        </div>
      </div>
    </div>
  );
};

export default InflowProfile;
