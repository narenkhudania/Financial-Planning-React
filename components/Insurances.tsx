
import React, { useState, useMemo } from 'react';
import { FinanceState, Insurance, InsuranceCategory, InsuranceType } from '../types';
import { 
  ShieldCheck, Plus, Trash2, User, Activity, AlertCircle, 
  ChevronDown, Calculator, TrendingUp, Wallet, ArrowUpRight,
  ShieldAlert, CheckCircle2, Info, Landmark, BarChart3, ArrowRight
} from 'lucide-react';

const Insurances: React.FC<{ state: FinanceState, updateState: (data: Partial<FinanceState>) => void }> = ({ state, updateState }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'analysis'>('analysis');
  const [analysisConfig, setAnalysisConfig] = useState({
    inflation: 6,
    investmentRate: 11.5,
    replacementYears: 20,
    immediateNeeds: 1000000,
    financialAssetDiscount: 50 // Only count 50% of financial assets for HLV
  });

  const [newPolicy, setNewPolicy] = useState<Partial<Insurance>>({
    category: 'Life Insurance',
    type: 'Term',
    proposer: 'self',
    insured: 'self',
    sumAssured: 0,
    premium: 0,
    isMoneyBack: false,
    moneyBackYears: [],
    moneyBackAmounts: []
  });

  const handleAdd = () => {
    const policy = { ...newPolicy, id: Math.random().toString(36).substr(2, 9) } as Insurance;
    updateState({ insurance: [...state.insurance, policy] });
    setShowAdd(false);
  };

  const removePolicy = (id: string) => {
    updateState({ insurance: state.insurance.filter(p => p.id !== id) });
  };

  const getMemberName = (id: string) => {
    if (id === 'self') return state.profile.firstName || 'Self';
    return state.family.find(f => f.id === id)?.name || 'Unknown';
  };

  // --- HLV ANALYSIS ENGINE ---
  const hlvData = useMemo(() => {
    const realRate = ((1 + analysisConfig.investmentRate / 100) / (1 + analysisConfig.inflation / 100)) - 1;
    const annualExpenses = (state.detailedExpenses.reduce((s, e) => s + e.amount, 0) || state.profile.monthlyExpenses) * 12;
    
    // 1. Income/Expense Replacement (PV of Annuity)
    const pvFactor = (1 - Math.pow(1 + realRate, -analysisConfig.replacementYears)) / realRate;
    const expenseReplacement = annualExpenses * pvFactor;

    // 2. Debt Repayment (100% cover)
    const totalDebt = state.loans.reduce((sum, l) => sum + l.outstandingAmount, 0);

    // 3. Financial Goals (Pull from state)
    // We assume default spreadsheet cover percentages if not specified
    const goalRequirements = state.goals.reduce((sum, g) => {
      let coverPct = 1; // Default 100%
      if (g.type === 'Retirement' || g.type === 'Vacation') coverPct = 0.6;
      if (g.type === 'Corpus for Start-up' || g.type === 'Land / Home') coverPct = 0;
      
      return sum + (g.targetAmountToday * coverPct);
    }, 0);

    // 4. Liquidity Available
    const totalExistingInsurance = state.insurance
      .filter(p => p.category === 'Life Insurance')
      .reduce((sum, p) => sum + p.sumAssured, 0);
    
    const liquidAssets = state.assets
      .filter(a => a.category === 'Liquid' || a.category === 'Equity' || a.category === 'Debt')
      .reduce((sum, a) => sum + a.currentValue, 0);
    
    const usableAssets = liquidAssets * (analysisConfig.financialAssetDiscount / 100);

    const totalRequirement = analysisConfig.immediateNeeds + expenseReplacement + totalDebt + goalRequirements;
    const totalAvailable = totalExistingInsurance + usableAssets;
    const gap = totalRequirement - totalAvailable;

    return {
      expenseReplacement,
      totalDebt,
      goalRequirements,
      totalExistingInsurance,
      usableAssets,
      totalRequirement,
      totalAvailable,
      gap,
      safetyScore: Math.min(100, Math.round((totalAvailable / totalRequirement) * 100))
    };
  }, [state, analysisConfig]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Dynamic Header */}
      <div className="bg-[#0b0f1a] p-12 md:p-16 rounded-[4rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
              <ShieldCheck size={14}/> Risk Protection Node
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85]">Shield <br/><span className="text-indigo-500">Security.</span></h2>
            <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
              Auditing <span className="text-white font-bold">Human Life Value (HLV)</span> against debt liabilities and family wealth missions.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-10 rounded-[4rem] backdrop-blur-xl flex flex-col items-center gap-3 shadow-inner min-w-[280px]">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protection Status</p>
             <h4 className={`text-5xl font-black tracking-tighter ${hlvData.gap > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
               {hlvData.safetyScore}%
             </h4>
             <div className={`flex items-center gap-2 mt-2 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border ${hlvData.gap > 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                {hlvData.gap > 0 ? <ShieldAlert size={12}/> : <CheckCircle2 size={12}/>}
                {hlvData.gap > 0 ? 'Coverage Gap Detected' : 'Optimally Shielded'}
             </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-2 bg-white rounded-[2.5rem] border border-slate-200 w-fit mx-auto shadow-sm">
        <button onClick={() => setActiveTab('analysis')} className={`px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'analysis' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}>HLV Risk Analysis</button>
        <button onClick={() => setActiveTab('inventory')} className={`px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}>Policy Inventory</button>
      </div>

      {activeTab === 'analysis' ? (
        <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700">
           {/* HLV Calculation Breakdown */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                 <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10"><Calculator size={120}/></div>
                    <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3">Requirement Parameters</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-6">
                          <div className="space-y-4">
                             <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inflation Buffer</label><span className="text-xl font-black text-indigo-600">{analysisConfig.inflation}%</span></div>
                             <input type="range" min="3" max="12" step="0.5" value={analysisConfig.inflation} onChange={e => setAnalysisConfig({...analysisConfig, inflation: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-indigo-600" />
                          </div>
                          <div className="space-y-4">
                             <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Replacement Period</label><span className="text-xl font-black text-indigo-600">{analysisConfig.replacementYears} Yrs</span></div>
                             <input type="range" min="5" max="40" step="1" value={analysisConfig.replacementYears} onChange={e => setAnalysisConfig({...analysisConfig, replacementYears: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-indigo-600" />
                          </div>
                       </div>
                       <div className="space-y-6">
                          <div className="space-y-4">
                             <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inv. Yield Assume</label><span className="text-xl font-black text-indigo-600">{analysisConfig.investmentRate}%</span></div>
                             <input type="range" min="4" max="15" step="0.5" value={analysisConfig.investmentRate} onChange={e => setAnalysisConfig({...analysisConfig, investmentRate: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-indigo-600" />
                          </div>
                          <div className="space-y-4">
                             <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Immediate Cash</label><span className="text-xl font-black text-indigo-600">${analysisConfig.immediateNeeds.toLocaleString()}</span></div>
                             <input type="range" min="100000" max="5000000" step="100000" value={analysisConfig.immediateNeeds} onChange={e => setAnalysisConfig({...analysisConfig, immediateNeeds: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-indigo-600" />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Detailed Waterfall Table */}
                 <div className="bg-white rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                       <h3 className="text-xl font-black text-slate-900 tracking-tight">Audit of Liabilities & Buffers</h3>
                       <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Human Life Value Math</span>
                    </div>
                    <div className="p-10">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Requirements</p>
                             <div className="space-y-4">
                                <div className="flex justify-between"><span className="text-sm font-bold text-slate-600">Immediate Liquidity</span><span className="text-sm font-black text-slate-900">${Math.round(analysisConfig.immediateNeeds).toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-sm font-bold text-slate-600">Income Replacement</span><span className="text-sm font-black text-slate-900">${Math.round(hlvData.expenseReplacement).toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-sm font-bold text-slate-600">Debt Liquidation</span><span className="text-sm font-black text-slate-900">${Math.round(hlvData.totalDebt).toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-sm font-bold text-slate-600">Weighted Financial Goals</span><span className="text-sm font-black text-slate-900">${Math.round(hlvData.goalRequirements).toLocaleString()}</span></div>
                             </div>
                             <div className="pt-4 border-t border-slate-100 flex justify-between"><span className="text-sm font-black text-slate-900">Total Requirement</span><span className="text-lg font-black text-slate-900">${Math.round(hlvData.totalRequirement).toLocaleString()}</span></div>
                          </div>
                          <div className="space-y-6">
                             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Liquidity & Shield</p>
                             <div className="space-y-4">
                                <div className="flex justify-between"><span className="text-sm font-bold text-slate-600">Available Portfolio ({analysisConfig.financialAssetDiscount}%)</span><span className="text-sm font-black text-emerald-600">${Math.round(hlvData.usableAssets).toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-sm font-bold text-slate-600">Existing Term Insurance</span><span className="text-sm font-black text-emerald-600">${Math.round(hlvData.totalExistingInsurance).toLocaleString()}</span></div>
                             </div>
                             <div className="pt-4 border-t border-slate-100 flex justify-between"><span className="text-sm font-black text-slate-900">Total Cover Pool</span><span className="text-lg font-black text-emerald-600">${Math.round(hlvData.totalAvailable).toLocaleString()}</span></div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Sidebar Result Card */}
              <div className="space-y-8">
                 <div className="bg-slate-950 p-10 rounded-[4rem] text-white space-y-10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><ShieldCheck size={160}/></div>
                    <div className="relative z-10">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Net Protection Position</p>
                       <h3 className={`text-4xl font-black ${hlvData.gap > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {hlvData.gap > 0 ? `-$${Math.round(hlvData.gap).toLocaleString()}` : `$${Math.abs(Math.round(hlvData.gap)).toLocaleString()} Surplus`}
                       </h3>
                       {hlvData.gap > 0 && <p className="text-xs text-slate-400 mt-2 font-medium">This is the critical coverage gap required to fully protect your household timeline.</p>}
                    </div>

                    <div className="space-y-6 relative z-10 pt-10 border-t border-white/5">
                       <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20"><TrendingUp size={20}/></div>
                          <div>
                             <h4 className="text-sm font-black">Strategic Advice</h4>
                             <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
                                Secure a <span className="text-white font-bold">${Math.max(0, Math.round(hlvData.gap / 1000000) * 1000000).toLocaleString()} term policy</span> immediately to bridge the delta.
                             </p>
                          </div>
                       </div>
                    </div>

                    <button className="w-full py-5 bg-indigo-600 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                       Buy Optimized Coverage <ArrowRight size={16}/>
                    </button>
                 </div>

                 <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Landmark size={24}/></div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wealth Multiplier</p>
                       <h4 className="text-xl font-black text-slate-900">${(hlvData.totalRequirement / 1000000).toFixed(1)}M Total Value</h4>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
           <div className="flex justify-between items-center px-4">
              <h3 className="text-xl font-black text-slate-900">Policy Inventory</h3>
              <button 
                onClick={() => setShowAdd(true)}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10"
              >
                <Plus size={16} /> Add New Policy
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {state.insurance.map((policy) => (
                <div key={policy.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm group hover:border-indigo-400 transition-all flex flex-col justify-between min-h-[220px]">
                   <div className="flex justify-between items-start">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${policy.category === 'Life Insurance' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                         <ShieldCheck size={28} />
                      </div>
                      <button onClick={() => removePolicy(policy.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
                        <Trash2 size={20} />
                      </button>
                   </div>
                   <div className="space-y-2 mt-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{policy.type}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{policy.category}</span>
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">${policy.sumAssured.toLocaleString()}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Insured: {getMemberName(policy.insured)}</p>
                   </div>
                   <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-end">
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase">Yearly Premium</p>
                         <p className="text-sm font-black text-slate-900">${policy.premium.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                         <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 group/btn">Edit Policy <ArrowUpRight size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"/></button>
                      </div>
                   </div>
                </div>
              ))}
              
              {state.insurance.length === 0 && (
                <div className="lg:col-span-3 py-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center opacity-50 space-y-4">
                   <div className="p-6 bg-slate-50 rounded-[2rem] text-slate-300 shadow-inner"><ShieldCheck size={48}/></div>
                   <p className="font-black text-slate-400 uppercase text-xs tracking-widest">No insurance policies in repository</p>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Advanced Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 h-[85vh] flex flex-col border border-white/20">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-30">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem] shadow-sm"><ShieldCheck size={28}/></div>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">Policy Registration</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Audit Shield Configuration</p>
                </div>
              </div>
              <button onClick={() => setShowAdd(false)} className="p-4 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-3xl text-slate-400 transition-all"><Plus size={32} className="rotate-45" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
               <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Risk Category</label>
                    <select 
                      value={newPolicy.category}
                      onChange={e => setNewPolicy({...newPolicy, category: e.target.value as InsuranceCategory})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-8 py-5 text-lg font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all"
                    >
                       <option>Life Insurance</option>
                       <option>General Insurance</option>
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Policy Topology</label>
                    <select 
                      value={newPolicy.type}
                      onChange={e => setNewPolicy({...newPolicy, type: e.target.value as InsuranceType})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-8 py-5 text-lg font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all"
                    >
                       {newPolicy.category === 'Life Insurance' ? (
                         <>
                           <option>Term</option><option>Endowment</option><option>Money Back</option><option>ULIP</option><option>Annuity</option>
                         </>
                       ) : (
                         <>
                           <option>Health</option><option>Critical Illness</option><option>Car</option><option>Home</option><option>Others</option>
                         </>
                       )}
                    </select>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contract Proposer</label>
                    <select value={newPolicy.proposer} onChange={e => setNewPolicy({...newPolicy, proposer: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-8 py-5 text-lg font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all">
                       <option value="self">Self</option>
                       {state.family.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Insured Identity</label>
                    <select value={newPolicy.insured} onChange={e => setNewPolicy({...newPolicy, insured: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-8 py-5 text-lg font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all">
                       <option value="self">Self</option>
                       {state.family.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sum Assured Pool ($)</label>
                    <input type="number" value={newPolicy.sumAssured || ''} onChange={e => setNewPolicy({...newPolicy, sumAssured: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-8 py-5 text-xl font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-inner" placeholder="$ 0" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Annual Premium Load ($)</label>
                    <input type="number" value={newPolicy.premium || ''} onChange={e => setNewPolicy({...newPolicy, premium: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-8 py-5 text-xl font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-inner" placeholder="$ 0" />
                  </div>
               </div>
            </div>

            <div className="p-10 border-t border-slate-100 bg-white sticky bottom-0">
               <button onClick={handleAdd} className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-lg hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center gap-6">Authorize Policy Entry <ArrowUpRight size={32}/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insurances;
