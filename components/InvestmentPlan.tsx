
import React, { useMemo, useState } from 'react';
import { FinanceState, Asset, RiskLevel } from '../types';
import { 
  TrendingUp, BarChart3, PieChart, Wallet, 
  ArrowUpRight, Info, AlertCircle, CheckCircle2, 
  Circle, Coins, Landmark, Briefcase, Home, Activity,
  Zap, ChevronRight, ShieldCheck, Sparkles, LayoutGrid,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const ASSET_ICONS: Record<string, any> = {
  'Liquid': Landmark,
  'Debt': Briefcase,
  'Equity': TrendingUp,
  'Real Estate': Home,
  'Gold/Silver': Coins,
  'Personal': Activity
};

interface Recommendation {
  instrument: string;
  category: string;
  weight: number;
  reason: string;
  minThreshold?: number;
  type: 'core' | 'alpha' | 'safety';
}

const InvestmentPlan: React.FC<{ state: FinanceState }> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'strategy'>('strategy');
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

  const recommendations = useMemo(() => {
    const risk = state.riskProfile?.level || 'Balanced';
    const nw = totalAssets;
    const recs: Recommendation[] = [];

    if (risk === 'Conservative') {
      recs.push({ instrument: 'FDs / Liquid MFs', category: 'Safety', weight: 60, type: 'safety', reason: 'Focus on capital preservation.' });
      recs.push({ instrument: 'Gold Bonds', category: 'Gold', weight: 15, type: 'safety', reason: 'Hedge against devaluation.' });
      recs.push({ instrument: 'Index Funds', category: 'Equity', weight: 25, type: 'core', reason: 'Low-cost market exposure.' });
    } else if (risk === 'Moderate') {
      recs.push({ instrument: 'Hybrid Funds', category: 'Core', weight: 40, type: 'core', reason: 'Automated rebalancing.' });
      recs.push({ instrument: 'Corporate Debt', category: 'Debt', weight: 30, type: 'safety', reason: 'Better-than-FD yields.' });
      recs.push({ instrument: 'Blue-chip Stocks', category: 'Equity', weight: 30, type: 'alpha', reason: 'Stable market growth.' });
    } else if (risk === 'Aggressive' || risk === 'Very Aggressive') {
      recs.push({ instrument: 'Direct Equity', category: 'Equity', weight: 50, type: 'alpha', reason: 'High-conviction growth.' });
      recs.push({ instrument: 'Small-cap MFs', category: 'Equity', weight: 20, type: 'alpha', reason: 'Emerging sector capture.' });
      if (nw >= 5000000) {
        recs.push({ instrument: 'PMS', category: 'Alpha', weight: 20, type: 'alpha', reason: 'Expert-led portfolio.', minThreshold: 5000000 });
      } else {
        recs.push({ instrument: 'Flexi-cap MFs', category: 'Equity', weight: 20, type: 'core', reason: 'Diversified cap growth.' });
      }
      if (nw >= 10000000) {
        recs.push({ instrument: 'AIF', category: 'Alpha', weight: 10, type: 'alpha', reason: 'Pre-IPO access.', minThreshold: 10000000 });
      } else {
        recs.push({ instrument: 'Gold ETFs', category: 'Hedge', weight: 10, type: 'safety', reason: 'Strategic hedge.' });
      }
    } else {
      recs.push({ instrument: 'Flexi-cap MFs', category: 'Equity', weight: 40, type: 'core', reason: 'Balanced market exposure.' });
      recs.push({ instrument: 'Index Funds', category: 'Equity', weight: 20, type: 'core', reason: 'Broad market tracking.' });
      recs.push({ instrument: 'Debt MFs', category: 'Debt', weight: 30, type: 'safety', reason: 'Liquidity buffer.' });
      recs.push({ instrument: 'Physical Gold', category: 'Gold', weight: 10, type: 'safety', reason: 'Stability anchor.' });
    }
    return recs;
  }, [state.riskProfile, totalAssets]);

  const driftData = useMemo(() => {
    const risk = state.riskProfile?.level || 'Balanced';
    const ideal = {
      equity: risk.includes('Aggressive') ? 80 : risk === 'Balanced' ? 60 : 30,
      debt: risk.includes('Aggressive') ? 10 : risk === 'Balanced' ? 30 : 60,
      gold: 10,
    };
    const current = {
      equity: (currentAllocation.filter(a => a.category === 'Equity').reduce((s, a) => s + a.allocation, 0)),
      debt: (currentAllocation.filter(a => ['Debt', 'Liquid'].includes(a.category)).reduce((s, a) => s + a.allocation, 0)),
      gold: (currentAllocation.filter(a => a.category === 'Gold/Silver').reduce((s, a) => s + a.allocation, 0)),
    };
    return [
      { subject: 'Equity', A: ideal.equity, B: current.equity },
      { subject: 'Debt', A: ideal.debt, B: current.debt },
      { subject: 'Gold', A: ideal.gold, B: current.gold },
    ];
  }, [currentAllocation, state.riskProfile]);

  return (
    <div className="space-y-6 md:space-y-12 animate-in fade-in duration-1000 pb-24">
      {/* Strategic Header */}
      <div className="bg-[#0b0f1a] p-6 md:p-16 rounded-[2rem] md:rounded-[5rem] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-12">
          <div className="space-y-3 md:space-y-6">
            <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-indigo-500/10 text-indigo-300 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
              <PieChart size={12} className="md:w-[14px] md:h-[14px]"/> Allocation Terminal
            </div>
            <h2 className="text-3xl md:text-7xl font-black tracking-tighter leading-tight md:leading-[0.85]">Portfolio <br/><span className="text-indigo-500">Mapping.</span></h2>
            <p className="text-slate-400 text-xs md:text-lg font-medium max-w-lg leading-relaxed">
              Auditing yields against <span className="text-indigo-400 font-bold">{state.riskProfile?.level || 'Balanced'} DNA</span>.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="bg-white/5 border border-white/10 p-5 md:p-10 rounded-[1.5rem] md:rounded-[4rem] backdrop-blur-xl flex flex-col items-center gap-1 md:gap-3 shadow-inner w-full md:min-w-[280px]">
               <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Expected Yield</p>
               <h4 className="text-3xl md:text-5xl font-black text-white tracking-tighter">{weightedAvgReturn.toFixed(2)}%</h4>
            </div>
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-full">
               <button onClick={() => setActiveTab('strategy')} className={`flex-1 py-2 md:py-3 px-4 md:px-8 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'strategy' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>Strategy</button>
               <button onClick={() => setActiveTab('audit')} className={`flex-1 py-2 md:py-3 px-4 md:px-8 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>Audit</button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'audit' ? (
        <div className="bg-white rounded-[1.5rem] md:rounded-[5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6">
          <div className="px-6 md:px-12 py-6 md:py-10 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">Allocation Audit</h3>
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Liquidity Status</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <div className="flex-1 md:flex-none bg-white px-3 md:px-6 py-2 md:py-4 rounded-xl md:rounded-3xl border border-slate-200 text-center">
                  <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase mb-0.5">Total</p>
                  <p className="text-sm md:text-lg font-black text-slate-900">₹{totalAssets.toLocaleString()}</p>
                </div>
                <div className="flex-1 md:flex-none bg-indigo-600 px-3 md:px-6 py-2 md:py-4 rounded-xl md:rounded-3xl text-center text-white">
                  <p className="text-[7px] md:text-[9px] font-black text-indigo-300 uppercase mb-0.5">Liquid</p>
                  <p className="text-sm md:text-lg font-black text-white">₹{totalAvailableForGoals.toLocaleString()}</p>
                </div>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/30">
                      <th className="px-6 md:px-12 py-4 md:py-8 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Instrument</th>
                      <th className="px-4 md:px-8 py-4 md:py-8 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                      <th className="px-4 md:px-8 py-4 md:py-8 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">%</th>
                      <th className="px-4 md:px-8 py-4 md:py-8 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-6 md:px-12 py-4 md:py-8 text-[9px] md:text-[11px] font-black text-indigo-600 uppercase tracking-widest text-right">Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentAllocation.map((row, idx) => {
                    const Icon = ASSET_ICONS[row.category] || Activity;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 md:px-12 py-3 md:py-8">
                            <div className="flex items-center gap-3">
                              <div className="p-2 md:p-3 bg-slate-100 text-slate-400 rounded-lg md:rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                  <Icon size={14} className="md:w-[18px] md:h-[18px]"/>
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[11px] md:text-sm font-black text-slate-900 leading-tight truncate max-w-[120px] md:max-w-[200px]">{row.instrument}</p>
                                  <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.category}</p>
                              </div>
                            </div>
                        </td>
                        <td className="px-4 md:px-8 py-3 md:py-8 text-right text-[10px] md:text-sm font-black text-slate-900">₹{row.value.toLocaleString()}</td>
                        <td className="px-4 md:px-8 py-3 md:py-8 text-center text-[10px] md:text-sm font-black text-slate-900">{row.allocation.toFixed(1)}%</td>
                        <td className="px-4 md:px-8 py-3 md:py-8 text-center">
                            <div className={`mx-auto w-fit px-2 md:px-3 py-0.5 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest border ${row.availableForGoals ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                              {row.availableForGoals ? 'Liquid' : 'Locked'}
                            </div>
                        </td>
                        <td className="px-6 md:px-12 py-3 md:py-8 text-right text-[10px] md:text-sm font-black text-indigo-600">{row.growthRate.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-12 animate-in fade-in slide-in-from-bottom-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
            {/* Allocation Drift Map */}
            <div className="bg-white p-6 md:p-12 rounded-[1.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm flex flex-col h-fit lg:h-full lg:col-span-1">
               <div className="space-y-1 mb-6 md:mb-8">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit"><BarChart3 size={20}/></div>
                  <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Allocation Drift.</h3>
                  <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Ideal Positioning</p>
               </div>

               <div className="w-full h-48 md:h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={driftData}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }} />
                      <Radar name="Ideal" dataKey="A" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.1} />
                      <Radar name="Current" dataKey="B" stroke="#f59e0b" strokeWidth={3} fill="#f59e0b" fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
               </div>
               
               <div className="mt-6 md:mt-8 space-y-2 md:space-y-4">
                  <div className="flex justify-between items-center px-4 py-2 md:py-3 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase">Ideal Strategy</span>
                     </div>
                     <CheckCircle2 size={12} className="text-indigo-600" />
                  </div>
                  <div className="flex justify-between items-center px-4 py-2 md:py-3 bg-amber-50/50 rounded-xl md:rounded-2xl border border-amber-100">
                     <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-[8px] md:text-[10px] font-black text-amber-600 uppercase">Current Drift</span>
                     </div>
                     <AlertCircle size={12} className="text-amber-500" />
                  </div>
               </div>
            </div>

            {/* Strategic Recommendations Feed */}
            <div className="lg:col-span-2 space-y-4 md:space-y-10">
               <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2.5 md:p-3 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl"><Sparkles size={20} className="md:w-[24px] md:h-[24px]"/></div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight italic">Recommended Vehicles.</h3>
                      <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">For {state.riskProfile?.level || 'Moderate'} Risk</p>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm hover:border-indigo-400 transition-all flex flex-col justify-between group">
                       <div className="space-y-4 md:space-y-6">
                          <div className="flex justify-between items-start">
                             <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                               rec.type === 'alpha' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                               rec.type === 'safety' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                               'bg-slate-50 text-slate-600 border-slate-100'
                             }`}>
                                {rec.category}
                             </div>
                             <h4 className="text-xl md:text-2xl font-black text-slate-900">{rec.weight}%</h4>
                          </div>
                          <div className="space-y-2">
                             <h5 className="text-base md:text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{rec.instrument}</h5>
                             <p className="text-[11px] md:text-sm font-medium text-slate-500 leading-relaxed">{rec.reason}</p>
                          </div>
                       </div>
                       
                       <div className="mt-6 md:mt-8 pt-4 md:pt-8 border-t border-slate-50 flex items-center justify-between">
                          <button className="flex items-center gap-1.5 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                             Explore <ChevronRight size={10} className="md:w-[14px] md:h-[14px] group-hover:translate-x-0.5 transition-transform" />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentPlan;
