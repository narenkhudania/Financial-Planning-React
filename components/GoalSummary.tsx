
import React, { useMemo, useState } from 'react';
import { 
  ClipboardList, Target, Calculator, TrendingUp, 
  Calendar, ArrowUpRight, Info, AlertCircle, Sparkles,
  Layers, CheckCircle2, Circle, ArrowRight, Wallet,
  PieChart, RefreshCw, Zap, Activity, ShieldCheck
} from 'lucide-react';
import { FinanceState, Goal, RelativeDate, ResourceBucket } from '../types';

// Define the icons for each resource bucket
const RESOURCE_ICONS: Record<ResourceBucket, any> = {
  'Equity & MF': PieChart,
  'Bank Balance': Wallet,
  'NPS & EPF': Calculator,
  'Cashflow Surplus': Activity,
  'Insurance Payouts': ShieldCheck
} as any;

const GoalSummary: React.FC<{ state: FinanceState }> = ({ state }) => {
  const [activeView, setActiveView] = useState<'matrix' | 'actuarial'>('matrix');
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

  const goalsData = useMemo(() => {
    return state.goals.sort((a,b) => a.priority - b.priority).map((goal, idx) => {
      const sYear = resolveYear(goal.startDate);
      const eYear = resolveYear(goal.endDate);
      const yearsToStart = Math.max(0, sYear - currentYear);
      const duration = Math.max(1, eYear - sYear + 1);
      
      const inflation = goal.inflationRate / 100;
      const pvPerOccurrence = goal.targetAmountToday;
      const fvAtStart = pvPerOccurrence * Math.pow(1 + inflation, yearsToStart);
      
      let sumCorpus = 0;
      if (goal.isRecurring) {
        for (let i = 0; i < duration; i++) {
          sumCorpus += pvPerOccurrence * Math.pow(1 + inflation, yearsToStart + i);
        }
      } else {
        sumCorpus = fvAtStart;
      }

      return {
        ...goal,
        srNo: idx + 1,
        summary: goal.description || goal.type,
        startYear: sYear,
        endYear: eYear,
        corpusAtStart: fvAtStart,
        sumCorpus: sumCorpus
      };
    });
  }, [state.goals, currentYear, birthYear]);

  const totalSumCorpus = goalsData.reduce((acc, g) => acc + g.sumCorpus, 0);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-24">
      {/* Header Strategy Node */}
      <div className="bg-[#0b0f1a] p-12 md:p-16 rounded-[5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
              <Layers size={14}/> Goal Funding Terminal
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85]">Funding <br/><span className="text-indigo-500">Summary.</span></h2>
            <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
              Consolidated audit of all wealth milestones prioritized by <span className="text-white font-bold">liquidity urgency</span> and resource availability.
            </p>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 p-10 rounded-[4rem] backdrop-blur-xl flex flex-col items-center gap-3 shadow-inner">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Lifecycle Corpus</p>
               <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter">${totalSumCorpus.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
            </div>
            <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl">
               <button onClick={() => setActiveView('matrix')} className={`flex-1 py-3 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'matrix' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>Priority Matrix</button>
               <button onClick={() => setActiveView('actuarial')} className={`flex-1 py-3 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'actuarial' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>Actuarial Audit</button>
            </div>
          </div>
        </div>
      </div>

      {activeView === 'matrix' ? (
        <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {goalsData.length === 0 ? (
                <div className="lg:col-span-2 py-32 bg-white rounded-[5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center opacity-40">
                   <Target size={64} className="text-slate-300 mb-6"/>
                   <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Active Wealth Goals</h4>
                </div>
              ) : (
                goalsData.map((goal) => (
                  <div key={goal.id} className="bg-white p-10 rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition-all flex flex-col justify-between min-h-[360px]">
                     <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl">
                              {goal.priority}
                           </div>
                           <div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{goal.summary}</h3>
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Timeline: {goal.startYear} — {goal.endYear}</p>
                           </div>
                        </div>
                        <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">Priority #{goal.priority}</div>
                     </div>

                     <div className="space-y-6 flex-1">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic text-xs font-medium text-slate-600 leading-relaxed">
                           "Projected cost of ${goal.targetAmountToday.toLocaleString()} inflation-adjusted at {goal.inflationRate}% p.a. {goal.isRecurring ? `until year ${goal.endYear}.` : `payable in year ${goal.startYear}.`}"
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Needed Today (PV)</p>
                              <h4 className="text-2xl font-black text-slate-900">${goal.targetAmountToday.toLocaleString()}</h4>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal Total (FV)</p>
                              <h4 className="text-2xl font-black text-indigo-600">${Math.round(goal.sumCorpus).toLocaleString()}</h4>
                           </div>
                        </div>
                     </div>

                     <div className="mt-10 pt-8 border-t border-slate-50 space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funding Resources</p>
                        <div className="flex flex-wrap gap-2">
                           {goal.resourceBuckets.map(rb => (
                              <span key={rb} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                 <CheckCircle2 size={12}/> {rb}
                              </span>
                           ))}
                           {goal.resourceBuckets.length === 0 && <span className="text-[10px] font-bold text-rose-400 uppercase italic">No resources earmarked</span>}
                        </div>
                     </div>
                  </div>
                ))
              )}
           </div>
           
           {/* Summary Analysis Node */}
           {goalsData.length > 0 && (
             <div className="bg-slate-950 p-12 rounded-[5rem] text-white flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
                <div className="space-y-4 relative z-10">
                   <h4 className="text-3xl font-black tracking-tight">Resource Utilization Plan</h4>
                   <p className="text-slate-400 font-medium max-w-xl">
                     Based on your prioritization, <span className="text-indigo-500 font-bold">{goalsData[0].summary}</span> and <span className="text-indigo-500 font-bold">{goalsData[1]?.summary || 'next priority'}</span> have immediate funding locks on your liquid and surplus buckets.
                   </p>
                </div>
                <button className="px-10 py-5 bg-white text-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all relative z-10">Run Waterfall Simulation</button>
             </div>
           )}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between mb-12">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[2rem]"><Calculator size={28}/></div>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">Actuarial Calculations</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Year-on-Year Goal Audit</p>
                </div>
             </div>
          </div>

          <div className="overflow-x-auto no-scrollbar -mx-12">
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                   <tr>
                      <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Sr No</th>
                      <th className="px-8 py-8 text-[11px] font-black text-slate-900 uppercase tracking-widest">Goal Summary</th>
                      <th className="px-8 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Value Today</th>
                      <th className="px-8 py-8 text-[11px] font-black text-indigo-600 uppercase tracking-widest text-center">Inf. Rate</th>
                      <th className="px-8 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Year Span</th>
                      <th className="px-12 py-8 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">Sum of Corpus</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {goalsData.map((row) => (
                    <tr key={row.srNo} className="hover:bg-indigo-50/30 transition-colors group">
                       <td className="px-12 py-8 text-sm font-black text-slate-300 tracking-tighter">{row.srNo}</td>
                       <td className="px-8 py-8">
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-slate-900">{row.summary}</span>
                             <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Rank {row.priority}</span>
                          </div>
                       </td>
                       <td className="px-8 py-8 text-sm font-bold text-slate-500 text-right">${row.targetAmountToday.toLocaleString()}</td>
                       <td className="px-8 py-8 text-sm font-black text-indigo-600 text-center">{row.inflationRate}%</td>
                       <td className="px-8 py-8 text-sm font-black text-slate-900 text-center">
                          {row.startYear} — {row.endYear}
                       </td>
                       <td className="px-12 py-8 text-right">
                          <div className="flex flex-col items-end">
                             <span className="text-lg font-black text-slate-900 tracking-tighter">${Math.round(row.sumCorpus).toLocaleString()}</span>
                             <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1">
                                <ArrowUpRight size={10}/> Starts at: ${Math.round(row.corpusAtStart).toLocaleString()}
                             </span>
                          </div>
                       </td>
                    </tr>
                   ))}
                </tbody>
                {goalsData.length > 0 && (
                  <tfoot className="bg-slate-50/80">
                     <tr>
                        <td colSpan={5} className="px-12 py-10 text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Total Lifetime Goal Liability</td>
                        <td className="px-12 py-10 text-right">
                           <span className="text-3xl font-black text-indigo-600 tracking-tighter">${totalSumCorpus.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </td>
                     </tr>
                  </tfoot>
                )}
             </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalSummary;
