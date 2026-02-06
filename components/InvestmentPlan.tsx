
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

    return (Object.entries(grouped) as [string, Asset[]][]).map(([name, assets]) => {
      const val = assets.reduce((s, a) => s + a.currentValue, 0);
      const availableVal = assets.filter(a => a.availableForGoals).reduce((s, a) => s + a.currentValue, 0);
      const avgGrowth = assets.reduce((s, a) => s + a.growthRate, 0) / assets.length;
      
      return {
        instrument: name,
        category: assets[0].category,
        value: val,
        allocation: (val / (totalAssets || 1)) * 100,
        availableForGoals: assets.some(a => a.availableForGoals),
        availableFrom: Math.max(...assets.map(a => a.availableFrom || new Date().getFullYear())),
        growthRate: avgGrowth,
        availableValue: availableVal
      };
    });
  }, [state.assets, totalAssets]);

  const totalAvailableForGoals = currentAllocation.reduce((sum, a) => sum + a.availableValue, 0);
  const weightedAvgReturn = currentAllocation.reduce((sum, a) => sum + (a.growthRate * (a.value / (totalAssets || 1))), 0);

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-1000 pb-24">
      {/* Strategic Header */}
      <div className="bg-[#0b0f1a] p-8 md:p-16 rounded-[2.5rem] md:rounded-[5rem] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-12">
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-indigo-500/10 text-indigo-300 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
              <PieChart size={14}/> Asset Allocation Terminal
            </div>
            <h2 className="text-3xl md:text-7xl font-black tracking-tighter leading-tight md:leading-[0.85]">Portfolio <br/><span className="text-indigo-500">Mapping.</span></h2>
            <p className="text-slate-400 text-sm md:text-lg font-medium max-w-lg leading-relaxed">
              Consolidated audit of yields against risk DNA.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-8 md:p-10 rounded-[2rem] md:rounded-[4rem] backdrop-blur-xl flex flex-col items-center gap-2 md:gap-3 shadow-inner w-full md:w-auto md:min-w-[280px]">
             <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Expected Yield</p>
             <h4 className="text-3xl md:text-5xl font-black text-white tracking-tighter">{weightedAvgReturn.toFixed(2)}%</h4>
             <div className="flex items-center gap-2 mt-1 md:mt-2 text-[9px] md:text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-emerald-500/20">
                <TrendingUp size={12}/> Benchmark Beat
             </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Table */}
      <div className="bg-white rounded-[2rem] md:rounded-[5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 md:px-12 py-8 md:py-10 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">Allocation Audit</h3>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Liquidity & Availability Status</p>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <div className="flex-1 md:flex-none bg-white px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl border border-slate-200 text-center">
                 <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-1">Total Wealth</p>
                 <p className="text-base md:text-lg font-black text-slate-900">₹{totalAssets.toLocaleString()}</p>
              </div>
              <div className="flex-1 md:flex-none bg-indigo-600 px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl text-center text-white">
                 <p className="text-[8px] md:text-[9px] font-black text-indigo-300 uppercase mb-1">Available</p>
                 <p className="text-base md:text-lg font-black text-white">₹{totalAvailableForGoals.toLocaleString()}</p>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
           <table className="w-full text-left min-w-[900px]">
              <thead>
                 <tr className="bg-slate-50/30">
                    <th className="px-6 md:px-12 py-6 md:py-8 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Instrument</th>
                    <th className="px-4 md:px-8 py-6 md:py-8 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                    <th className="px-4 md:px-8 py-6 md:py-8 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">% Alloc.</th>
                    <th className="px-4 md:px-8 py-6 md:py-8 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-4 md:px-8 py-6 md:py-8 text-[10px] md:text-[11px] font-black text-indigo-600 uppercase tracking-widest text-right">Yield</th>
                    <th className="px-6 md:px-12 py-6 md:py-8 text-[10px] md:text-[11px] font-black text-emerald-600 uppercase tracking-widest text-right">Goal Cap.</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {currentAllocation.map((row, idx) => {
                   const Icon = ASSET_ICONS[row.category] || Activity;
                   return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                       <td className="px-6 md:px-12 py-4 md:py-8">
                          <div className="flex items-center gap-3 md:gap-4">
                             <div className="p-2 md:p-3 bg-slate-100 text-slate-400 rounded-xl md:rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                <Icon size={16} md:size={18}/>
                             </div>
                             <div>
                                <p className="text-xs md:text-sm font-black text-slate-900 leading-tight truncate max-w-[150px]">{row.instrument}</p>
                                <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{row.category}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-4 md:px-8 py-4 md:py-8 text-right text-xs md:text-sm font-black text-slate-900">₹{row.value.toLocaleString()}</td>
                       <td className="px-4 md:px-8 py-4 md:py-8 text-center text-xs font-black text-slate-900">{row.allocation.toFixed(1)}%</td>
                       <td className="px-4 md:px-8 py-4 md:py-8 text-center">
                          <div className={`mx-auto w-fit px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${row.availableForGoals ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                             {row.availableForGoals ? 'Liquid' : 'Locked'}
                          </div>
                       </td>
                       <td className="px-4 md:px-8 py-4 md:py-8 text-right text-xs font-black text-indigo-600">{row.growthRate.toFixed(1)}%</td>
                       <td className="px-6 md:px-12 py-4 md:py-8 text-right text-xs md:text-sm font-black text-emerald-600">₹{row.availableValue.toLocaleString()}</td>
                    </tr>
                   );
                 })}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default InvestmentPlan;
