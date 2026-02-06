
import React, { useState, useMemo } from 'react';
import { 
  Target, Calendar, Plus, Trash2, Home, Car, GraduationCap, Heart, 
  Rocket, Coffee, Sparkles, ChevronRight, Zap, Plane, 
  Map, Building, Baby, Gift, Scroll, ListTree, Calculator, 
  ArrowLeft, RefreshCw, Hammer, ShoppingCart, Clock, CheckCircle2,
  TrendingUp, AlertCircle, ArrowUpRight, ArrowRight, Edit3, Eye,
  Info, DollarSign, User, Wallet, Percent, LayoutGrid, Layers,
  BarChart3, Settings2
} from 'lucide-react';
import { Goal, GoalType, FinanceState, RelativeDate, RelativeDateType, ResourceBucket, ExpenseItem } from '../types';

const GOAL_ICONS: Record<GoalType, any> = {
  'Retirement': Coffee,
  'Child Education': GraduationCap,
  'Child Marriage': Heart,
  'Vacation': Plane,
  'Car': Car,
  'Land / Home': Home,
  'Commercial': Building,
  'Home Renovation': Hammer,
  'Holiday Home': Map,
  'Corpus for Start-up': Rocket,
  'Charity / Philanthropy': Gift,
  'Child-birth Expenses': Baby,
  'Big Purchases': ShoppingCart,
  'Estate for Children': Scroll,
  'Others': Target
};

const RESOURCE_BUCKETS: ResourceBucket[] = ['Equity & MF', 'Bank Balance', 'NPS & EPF', 'Cashflow Surplus', 'Insurance Payouts'];

const Goals: React.FC<{ state: FinanceState, updateState: (data: Partial<FinanceState>) => void }> = ({ state, updateState }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [step, setStep] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  
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

  const initialNewGoal: Partial<Goal> = {
    type: 'Retirement',
    description: '',
    priority: state.goals.length + 1,
    resourceBuckets: ['Equity & MF', 'Cashflow Surplus'],
    isRecurring: false,
    frequency: 'Yearly',
    startDate: { type: 'Age', value: 60 },
    endDate: { type: 'LifeExpectancy', value: 0 },
    targetAmountToday: 0,
    inflationRate: 6,
    currentAmount: 0,
    retirementHandling: 'CurrentExpenses',
    detailedBreakdown: []
  };

  const [newGoal, setNewGoal] = useState<Partial<Goal>>(initialNewGoal);

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewGoal({...initialNewGoal, priority: state.goals.length + 1});
    setStep(1);
    setShowAdd(true);
  };

  const handleEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setNewGoal(goal);
    setStep(1);
    setShowAdd(true);
  };

  const handleSave = () => {
    if (editingId) {
      updateState({ goals: state.goals.map(g => g.id === editingId ? { ...newGoal, id: editingId } as Goal : g) });
    } else {
      const goal = { ...newGoal, id: Math.random().toString(36).substr(2, 9) } as Goal;
      updateState({ goals: [...state.goals, goal] });
    }
    setShowAdd(false);
    setEditingId(null);
    setStep(1);
  };

  const removeGoal = (id: string) => {
    updateState({ goals: state.goals.filter(g => g.id !== id) });
  };

  const RelativeDateInput = ({ label, value, onChange }: { label: string, value: RelativeDate, onChange: (v: RelativeDate) => void }) => {
    const types: RelativeDateType[] = ['Year', 'Age', 'Retirement', 'LifeExpectancy'];
    return (
      <div className="space-y-4 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] hover:border-indigo-300 transition-all shadow-sm">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">{label}</label>
        <div className="space-y-4">
          <div className="flex p-1 bg-slate-200/50 rounded-2xl overflow-x-auto no-scrollbar gap-1">
            {types.map(t => (
              <button 
                key={t} 
                type="button" 
                onClick={() => onChange({ ...value, type: t })} 
                className={`flex-1 min-w-[70px] py-2.5 text-[9px] font-black uppercase tracking-tight rounded-xl transition-all ${value.type === t ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative">
             <input 
               type="number" 
               value={value.value} 
               onChange={(e) => onChange({ ...value, value: parseInt(e.target.value) || 0 })} 
               className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-2xl font-black outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 shadow-sm" 
               placeholder="n" 
             />
             <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs uppercase tracking-widest pointer-events-none">Value</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">
      
      {/* Strategic Header */}
      <div className="bg-[#0b0f1a] p-12 md:p-20 rounded-[5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/30">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
              <Target size={14}/> Goal Intelligence
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85]">Strategic <br/><span className="text-indigo-500">Missions.</span></h2>
            <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">Tracking funded status against inflation-adjusted future liabilities.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="px-12 py-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.5rem] transition-all flex items-center gap-4 font-black uppercase text-sm tracking-[0.25em] shadow-2xl shadow-indigo-600/40 active:scale-95 shrink-0"
          >
            <Plus size={22} /> New Milestone
          </button>
        </div>
      </div>

      {/* Goal Inventory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {state.goals.length === 0 ? (
          <div className="lg:col-span-2 py-32 bg-white rounded-[5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-6 opacity-60">
             <div className="p-8 bg-slate-50 rounded-[3rem] text-slate-300 shadow-inner"><Target size={64} /></div>
             <div><h4 className="font-black text-slate-900 uppercase text-sm tracking-widest">No Active Missions</h4><p className="text-slate-400 font-medium">Add a goal to see interactive progress tracking.</p></div>
          </div>
        ) : (
          state.goals.sort((a,b) => a.priority - b.priority).map((goal) => {
            const Icon = GOAL_ICONS[goal.type] || Target;
            const startY = resolveYear(goal.startDate);
            const endY = resolveYear(goal.endDate);
            const yearsToStart = Math.max(0, startY - currentYear);
            
            // Calculate Inflation Adjusted Target (Future Value)
            const inflationRate = goal.inflationRate / 100;
            const targetFV = goal.targetAmountToday * Math.pow(1 + inflationRate, yearsToStart);
            const progressPct = targetFV > 0 ? Math.min(100, (goal.currentAmount / targetFV) * 100) : 0;

            return (
              <div key={goal.id} className="bg-white p-10 md:p-12 rounded-[4.5rem] border border-slate-200 shadow-sm hover:border-indigo-400 transition-all flex flex-col gap-8 relative overflow-hidden group">
                <div className="absolute top-8 right-8 flex gap-2">
                   <button onClick={() => handleEdit(goal)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                      <Edit3 size={18}/>
                   </button>
                   <button onClick={() => removeGoal(goal.id)} className="p-3 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                      <Trash2 size={18}/>
                   </button>
                </div>
                
                <div className="flex gap-8 items-start">
                   <div className="w-20 h-20 bg-slate-50 text-indigo-600 rounded-[2rem] flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      <Icon size={32}/>
                   </div>
                   <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-full">{goal.type}</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority #{goal.priority}</span>
                      </div>
                      <h4 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{goal.description || goal.type}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Timeline: {startY} — {endY}</p>
                   </div>
                </div>

                <div className="space-y-6 bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100 relative">
                   <div className="flex justify-between items-end">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Funding Progress</p>
                         <h5 className="text-2xl font-black text-slate-900">{progressPct.toFixed(1)}% Funded</h5>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Future Target</p>
                         <h5 className="text-lg font-black text-indigo-600">${Math.round(targetFV).toLocaleString()}</h5>
                      </div>
                   </div>
                   <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner border border-slate-100">
                      <div className="h-full bg-indigo-600 transition-all duration-1000 ease-out flex items-center justify-end px-2" style={{ width: `${progressPct}%` }}>
                         {progressPct > 15 && <Zap size={10} className="text-white animate-pulse" />}
                      </div>
                   </div>
                   <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Saved: ${goal.currentAmount.toLocaleString()}</span>
                      <span>Target PV: ${goal.targetAmountToday.toLocaleString()}</span>
                   </div>

                   {/* Hover Tooltip Mockup/Info */}
                   <div className="absolute inset-0 bg-indigo-600 text-white rounded-[3rem] p-8 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center gap-4 pointer-events-none">
                      <h5 className="text-lg font-black tracking-tight">Actuarial Breakdown</h5>
                      <div className="space-y-2">
                         <div className="flex justify-between text-xs font-bold"><span className="opacity-70">Inflation Index</span><span>{goal.inflationRate}%</span></div>
                         <div className="flex justify-between text-xs font-bold"><span className="opacity-70">Horizon Gap</span><span>{yearsToStart} years</span></div>
                         <div className="flex justify-between text-xs font-bold"><span className="opacity-70">Funding Deficit</span><span>${Math.max(0, Math.round(targetFV - goal.currentAmount)).toLocaleString()}</span></div>
                      </div>
                      <div className="pt-4 border-t border-white/20">
                         <p className="text-[10px] font-black uppercase tracking-widest">Resource Allocation: {goal.resourceBuckets.join(', ')}</p>
                      </div>
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-3xl z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 h-[90vh] flex flex-col border border-white/20">
            <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-30 shadow-sm">
              <div className="flex items-center gap-6">
                {step > 1 && (<button onClick={() => setStep(step - 1)} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-3xl text-slate-600 transition-all"><ArrowLeft size={22}/></button>)}
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{editingId ? 'Mission Calibration' : 'Mission Configurator'}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Step {step} of 3</p>
                </div>
              </div>
              <button onClick={() => setShowAdd(false)} className="p-4 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-3xl text-slate-400 transition-all"><Plus size={32} className="rotate-45" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar bg-slate-50/20">
               {step === 1 && (
                 <div className="space-y-12 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Zap size={18} className="text-amber-500"/> Priority Rank</label>
                          <div className="relative">
                            <input type="number" min="1" max="20" value={newGoal.priority} onChange={e => setNewGoal({...newGoal, priority: parseInt(e.target.value)})} className="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-5 text-4xl font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 shadow-sm" />
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs uppercase tracking-widest">Rank</div>
                          </div>
                          <p className="text-xs text-slate-400 font-medium px-2 italic">Priority 1 assets are funded first during cashflow waterfall simulation.</p>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><LayoutGrid size={18} className="text-indigo-600"/> Goal Topology</label>
                          <select value={newGoal.type} onChange={e => setNewGoal({...newGoal, type: e.target.value as GoalType})} className="w-full bg-white border border-slate-200 rounded-[2rem] px-8 py-6 text-xl font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 shadow-sm">
                             {Object.keys(GOAL_ICONS).map(type => <option key={type}>{type}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Mission Handle</label>
                       <input type="text" value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} className="w-full bg-white border border-slate-200 rounded-[2.5rem] px-10 py-7 text-2xl font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 shadow-sm" placeholder="e.g. World Tour 2030 or Coastal Villa" />
                    </div>
                    
                    <div className="p-8 bg-indigo-600 rounded-[3rem] text-white flex items-center justify-between shadow-xl shadow-indigo-600/20">
                       <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200"><Percent size={14}/> Goal-Specific Inflation</div>
                          <p className="text-xs font-bold opacity-80">Default is 6.0%. Higher rates require more aggressive funding.</p>
                       </div>
                       <div className="flex items-center gap-6">
                          <input type="range" min="0" max="15" step="0.5" value={newGoal.inflationRate} onChange={e => setNewGoal({...newGoal, inflationRate: parseFloat(e.target.value)})} className="w-48 h-2 bg-indigo-400 rounded-full appearance-none accent-white cursor-pointer" />
                          <span className="text-3xl font-black w-20 text-center">{newGoal.inflationRate}%</span>
                       </div>
                    </div>

                    <button onClick={() => setStep(2)} className="w-full py-8 bg-slate-900 text-white rounded-[3rem] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-[0.98]">Temporal Alignment <ChevronRight size={20}/></button>
                 </div>
               )}

               {step === 2 && (
                 <div className="space-y-12 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <RelativeDateInput label="Start of Goal / Disbursement" value={newGoal.startDate!} onChange={v => setNewGoal({...newGoal, startDate: v})} />
                       <RelativeDateInput label="Target End / Liquidation" value={newGoal.endDate!} onChange={v => setNewGoal({...newGoal, endDate: v})} />
                    </div>

                    <div className="space-y-8">
                       <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Layers size={18} className="text-indigo-600"/> Resource Bucket Mapping</label>
                       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                          {RESOURCE_BUCKETS.map(rb => (
                             <button 
                               key={rb} 
                               onClick={() => {
                                  const buckets = newGoal.resourceBuckets || [];
                                  setNewGoal({...newGoal, resourceBuckets: buckets.includes(rb) ? buckets.filter(b => b !== rb) : [...buckets, rb]});
                               }}
                               className={`p-6 rounded-[2.5rem] border-2 transition-all text-left group flex flex-col justify-between h-40 ${newGoal.resourceBuckets?.includes(rb) ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                             >
                                <CheckCircle2 size={24} className={`${newGoal.resourceBuckets?.includes(rb) ? 'text-white' : 'text-slate-200 group-hover:text-indigo-300'}`} />
                                <span className="text-[11px] font-black uppercase tracking-tight leading-tight">{rb}</span>
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="flex items-center gap-6 p-8 bg-amber-50 rounded-[3rem] border border-amber-200">
                       <div className="p-4 bg-white rounded-2xl text-amber-500 shadow-sm"><Info size={24}/></div>
                       <p className="text-xs font-bold text-amber-900 italic leading-relaxed">
                          "Ensure you have selected at least one liquid bucket (e.g. Bank Balance or Cashflow) to handle initial transaction costs."
                       </p>
                    </div>

                    <button onClick={() => setStep(3)} className="w-full py-8 bg-slate-900 text-white rounded-[3rem] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-xl">Financial Calibration <ChevronRight size={20}/></button>
                 </div>
               )}

               {step === 3 && (
                 <div className="space-y-12 animate-in fade-in duration-500">
                    {/* Special Retirement Logic */}
                    {newGoal.type === 'Retirement' && (
                       <div className="space-y-10 p-10 bg-slate-900 rounded-[4rem] text-white relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 text-indigo-500 opacity-20"><Settings2 size={120}/></div>
                          <div className="relative z-10 space-y-6">
                             <div className="flex items-center gap-3 text-indigo-400"><Clock size={24}/><h4 className="text-2xl font-black tracking-tight">Retirement Expense Modeling</h4></div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                  { id: 'CurrentExpenses', label: 'Use Current Burn', desc: 'Sync with monthly budget' },
                                  { id: 'Estimate', label: 'Manual Estimate', desc: 'Single monthly figure' },
                                  { id: 'Detailed', label: 'Line Item Audit', desc: 'Define category specifics' }
                                ].map((choice) => (
                                   <button 
                                      key={choice.id} 
                                      onClick={() => setNewGoal({...newGoal, retirementHandling: choice.id as any})}
                                      className={`p-6 rounded-3xl border-2 transition-all text-left group ${newGoal.retirementHandling === choice.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                                   >
                                      <h5 className="text-[11px] font-black uppercase tracking-widest mb-1">{choice.label}</h5>
                                      <p className="text-[10px] font-bold opacity-60 leading-tight">{choice.desc}</p>
                                   </button>
                                ))}
                             </div>
                             
                             {newGoal.retirementHandling === 'Estimate' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Monthly Estimate in Retirement ($)</label>
                                   <input 
                                      type="number" 
                                      value={newGoal.expectedMonthlyExpensesAfterRetirement || ''} 
                                      onChange={e => setNewGoal({...newGoal, expectedMonthlyExpensesAfterRetirement: parseFloat(e.target.value)})}
                                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black outline-none focus:border-indigo-400"
                                      placeholder="e.g. 5000"
                                   />
                                </div>
                             )}

                             {newGoal.retirementHandling === 'CurrentExpenses' && (
                                <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs font-bold text-emerald-400">
                                   Automatic Sync Enabled: Goal will scale with your current ${state.profile.monthlyExpenses.toLocaleString()} monthly living expense base.
                                </div>
                             )}
                          </div>
                       </div>
                    )}

                    <div className="bg-[#0b0f1a] p-16 rounded-[4rem] text-white space-y-10 relative overflow-hidden shadow-2xl">
                       <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
                       <div className="relative z-10">
                          <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Capital Requirement (PV)</p>
                          <div className="flex items-center gap-6">
                             <span className="text-4xl md:text-7xl font-black tracking-tighter text-indigo-500">$</span>
                             <input 
                                type="number" 
                                value={newGoal.targetAmountToday || ''} 
                                onChange={e => setNewGoal({...newGoal, targetAmountToday: parseFloat(e.target.value)})} 
                                className="w-full bg-transparent text-4xl md:text-7xl font-black outline-none focus:text-indigo-400 placeholder:text-white/10" 
                                placeholder="0.00"
                             />
                          </div>
                          <p className="mt-4 text-xs font-bold text-slate-400 italic">Enter the value in today's purchasing power.</p>
                       </div>
                    </div>

                    <div className="space-y-6 p-10 bg-white rounded-[3.5rem] border border-slate-200 shadow-sm">
                       <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Wallet size={18} className="text-emerald-500"/> Seed Corpus / Saved to Date</label>
                       <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-2xl">$</span>
                          <input 
                             type="number" 
                             value={newGoal.currentAmount || ''} 
                             onChange={e => setNewGoal({...newGoal, currentAmount: parseFloat(e.target.value)})} 
                             className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] pl-12 pr-8 py-6 text-2xl font-black outline-none focus:ring-8 focus:ring-emerald-600/5 focus:border-emerald-500 shadow-inner" 
                             placeholder="0" 
                          />
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">Amount already earmarked in selected buckets</p>
                    </div>

                    <button onClick={handleSave} className="w-full py-10 bg-indigo-600 text-white rounded-[4rem] font-black uppercase tracking-[0.4em] text-xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-6 active:scale-[0.97]">
                       {editingId ? 'Update Strategic Mission' : 'Launch Strategic Mission'} <Rocket size={32}/>
                    </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
