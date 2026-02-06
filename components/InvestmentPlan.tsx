
import React, { useMemo } from 'react';
import { FinanceState, Asset } from '../types';
import { 
  TrendingUp, BarChart3, PieChart, Wallet, 
  ArrowUpRight, Info, AlertCircle, CheckCircle2, 
  Circle, Coins, Landmark, Briefcase, Home, Activity,
  Zap
} from 'lucide-react';

const ASSET_ICONS: Record<string, any> = {
  'Liquid': Landmark,
  'Debt': Briefcase,
  'Equity': TrendingUp,
  'Real Estate': Home,
  'Gold/Silver': Coins,
  'Personal': Activity
};

const InvestmentPlan: React.FC<{ state: FinanceState }> = ({ state }) => {
  const totalAssets = useMemo(() => state.assets.reduce((sum, a) => sum + a.currentValue, 0), [state.assets]);
  
  const currentAllocation = useMemo(() => {
    const grouped = state.assets.reduce((acc, asset) => {
      const key = asset.name || asset.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(asset);
      return acc;
    }, {} as Record<string, Asset[]>);

    // Cast Object.entries to appropriate type to prevent 'unknown' inference for assets
    return (Object.entries(grouped) as [string, Asset[]][]).map(([name, assets]) => {
      const val = assets.reduce((s, a) => s + a.currentValue, 0);
      const availableVal = assets.filter(a => a.availableForGoals).reduce((s, a) => s + a.currentValue, 0);
      const avgGrowth = assets.reduce((s, a) => s + a.growthRate, 0) / assets.length;
      
      return {
        instrument: name,
        category: assets[0].category,
        value: val,
        allocation: (val / totalAssets) * 100,
        availableForGoals: assets.some(a => a.availableForGoals),
        availableFrom: Math.max(...assets.map(a => a.availableFrom || new Date().getFullYear())),
        growthRate: avgGrowth,
        availableValue: availableVal
      };
    });
  }, [state.assets, totalAssets]);

  const totalAvailableForGoals = currentAllocation.reduce((sum, a) => sum + a.availableValue, 0);
  const weightedAvgReturn = currentAllocation.reduce((sum, a) => sum + (a.growthRate * (a.value / totalAssets)), 0);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">
      {/* Strategic Header */}
      <div className="bg-[#0b0f1a] p-12 md:p-16 rounded-[5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
              <PieChart size={14}/> Asset Allocation Terminal
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85]">Portfolio <br/><span className="text-indigo-500">Mapping.</span></h2>
            <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
              Consolidated audit of all instruments, liquidity status, and projected yields against your risk DNA.
            </p>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 p-10 rounded-[4rem] backdrop-blur-xl flex flex-col items-center gap-3 shadow-inner">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expected Portfolio Yield</p>
               <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{weightedAvgReturn.toFixed(2)}%</h4>
               <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                  <TrendingUp size={12}/> Benchmark Beat
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Table */}
      <div className="bg-white rounded-[5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-12 py-10 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Current Allocation Audit</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status of Liquidity & Availability</p>
           </div>
           <div className="flex gap-4">
              <div className="bg-white px-6 py-4 rounded-3xl border border-slate-200 text-center shrink-0">
                 <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Wealth</p>
                 <p className="text-lg font-black text-slate-900">${totalAssets.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-600 px-6 py-4 rounded-3xl text-center text-white shrink-0">
                 <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">Available for Goals</p>
                 <p className="text-lg font-black text-white">${totalAvailableForGoals.toLocaleString()}</p>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50/30">
                    <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Instrument / Category</th>
                    <th className="px-8 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Consolidated Value</th>
                    <th className="px-8 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">% Allocation</th>
                    <th className="px-8 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Available for Goals</th>
                    <th className="px-8 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Available From</th>
                    <th className="px-8 py-8 text-[11px] font-black text-indigo-600 uppercase tracking-widest text-right">Growth Rate</th>
                    <th className="px-12 py-8 text-[11px] font-black text-emerald-600 uppercase tracking-widest text-right">Goal Capacity</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {currentAllocation.map((row, idx) => {
                   const Icon = ASSET_ICONS[row.category] || Activity;
                   return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                       <td className="px-12 py-8">
                          <div className="flex items-center gap-4">
                             <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                <Icon size={18}/>
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900 leading-tight break-words">{row.instrument}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{row.category}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-8 text-right text-sm font-black text-slate-900">${row.value.toLocaleString()}</td>
                       <td className="px-8 py-8 text-center">
                          <div className="inline-flex flex-col items-center">
                             <span className="text-xs font-black text-slate-900">{row.allocation.toFixed(1)}%</span>
                             <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-indigo-600" style={{ width: `${row.allocation}%` }} />
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-8 text-center">
                          <div className={`mx-auto w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${row.availableForGoals ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                             {row.availableForGoals ? 'Liquid' : 'Locked'}
                          </div>
                       </td>
                       <td className="px-8 py-8 text-center text-xs font-black text-slate-500">{row.availableFrom}</td>
                       <td className="px-8 py-8 text-right text-xs font-black text-indigo-600">{row.growthRate.toFixed(1)}%</td>
                       <td className="px-12 py-8 text-right text-sm font-black text-emerald-600">${row.availableValue.toLocaleString()}</td>
                    </tr>
                   );
                 })}
              </tbody>
              <tfoot>
                 <tr className="bg-slate-50/80 font-black">
                    <td className="px-12 py-10 text-[11px] uppercase tracking-widest text-slate-400">Aggregated Portfolio Total</td>
                    <td className="px-8 py-10 text-right text-lg text-slate-900">${totalAssets.toLocaleString()}</td>
                    <td className="px-8 py-10 text-center text-sm">100%</td>
                    <td colSpan={2}></td>
                    <td className="px-8 py-10 text-right text-indigo-600">{weightedAvgReturn.toFixed(2)}%</td>
                    <td className="px-12 py-10 text-right text-xl text-emerald-600">${totalAvailableForGoals.toLocaleString()}</td>
                 </tr>
              </tfoot>
           </table>
        </div>
      </div>

      {/* Recommended vs Current Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-white p-12 rounded-[5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-indigo-50 opacity-10"><BarChart3 size={120}/></div>
            <h3 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-3 leading-tight">Optimization Lab</h3>
            <p className="text-slate-500 font-medium mb-12 leading-relaxed">Comparing your <span className="text-indigo-600 font-bold">Current Allocation</span> against your <span className="text-indigo-600 font-bold">Risk Profile Recommendation</span>.</p>
            
            <div className="space-y-8">
               {['Equity', 'Debt', 'Gold/Silver', 'Liquid'].map((cat) => {
                 const currentVal = state.assets.filter(a => a.category === (cat === 'Gold/Silver' ? 'Gold/Silver' : cat)).reduce((s, a) => s + a.currentValue, 0);
                 const currentPct = (currentVal / totalAssets) * 100;
                 
                 // Get recommended pct from state.riskProfile or default
                 let recPct = 0;
                 if (state.riskProfile) {
                   const rec = state.riskProfile.recommendedAllocation;
                   if (cat === 'Equity') recPct = rec.equity;
                   else if (cat === 'Debt') recPct = rec.debt;
                   else if (cat === 'Gold/Silver') recPct = rec.gold;
                   else if (cat === 'Liquid') recPct = rec.liquid;
                 } else {
                   // Default Balanced
                   if (cat === 'Equity') recPct = 50;
                   else if (cat === 'Debt') recPct = 35;
                   else if (cat === 'Gold/Silver') recPct = 10;
                   else if (cat === 'Liquid') recPct = 5;
                 }

                 const diff = currentPct - recPct;

                 return (
                   <div key={cat} className="space-y-4">
                      <div className="flex justify-between items-end px-2">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{cat}</span>
                         <span className={`text-[10px] font-black uppercase leading-tight ${Math.abs(diff) < 5 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {diff > 0 ? `Over-allocated by ${diff.toFixed(1)}%` : `Under-allocated by ${Math.abs(diff).toFixed(1)}%`}
                         </span>
                      </div>
                      <div className="h-6 w-full bg-slate-100 rounded-full flex overflow-hidden">
                         <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${currentPct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1 leading-tight">
                         <span>Current: {currentPct.toFixed(1)}%</span>
                         <span>Recommended: {recPct}%</span>
                      </div>
                   </div>
                 );
               })}
            </div>
         </div>

         <div className="flex flex-col gap-10">
            <div className="bg-slate-950 p-12 rounded-[5rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
               <h4 className="text-3xl font-black tracking-tight flex items-center gap-3 leading-tight">
                 <Zap className="text-amber-500 shrink-0" size={24}/> AI Rebalancing Task
               </h4>
               <p className="text-slate-400 font-medium leading-relaxed">
                  You are heavily weighted in <span className="text-white font-bold">Real Estate (43%)</span> and <span className="text-white font-bold">Direct Equity (18%)</span>. 
                  To match your <span className="text-indigo-400 font-bold">{state.riskProfile?.level || 'Moderate'}</span> profile, you should consider moving $1.2M from secondary real estate into high-yield Debt instruments.
               </p>
               <div className="pt-8 border-t border-white/5 space-y-6">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-amber-500 shrink-0"><AlertCircle size={28}/></div>
                     <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-tight">Concentration Risk</p>
                        <p className="text-sm font-bold leading-tight">High: 69% in Illiquid/Volatile Assets</p>
                     </div>
                  </div>
                  <button className="w-full py-5 bg-indigo-600 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-xl">Execute Tactical Rebalance <ArrowUpRight size={16}/></button>
               </div>
            </div>

            <div className="bg-emerald-600 p-10 rounded-[4rem] text-white flex items-center gap-8 shadow-xl shadow-emerald-600/20">
               <div className="p-5 bg-white/10 rounded-3xl shrink-0"><Activity size={40}/></div>
               <div>
                  <h4 className="text-2xl font-black leading-tight">Liquidity Coverage</h4>
                  <p className="text-emerald-100 font-medium mt-1 leading-relaxed">Your available goal assets cover 14 months of peak expenses.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default InvestmentPlan;
