
import React, { useState } from 'react';
import { ShieldCheck, BrainCircuit, Activity, ChevronRight, ArrowLeft, RefreshCw, BarChart3, PieChart, Info, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { FinanceState, RiskLevel, RiskProfile as RiskProfileType } from '../types';

const QUESTIONS = [
  {
    id: 1,
    text: "What is your primary goal for your investment portfolio?",
    options: [
      { text: "Preserving capital with zero risk of loss", score: 5 },
      { text: "Stable income with minimal fluctuations", score: 10 },
      { text: "Balanced growth and capital preservation", score: 20 },
      { text: "Maximum long-term wealth growth", score: 30 }
    ]
  },
  {
    id: 2,
    text: "When do you plan to start withdrawing significant funds?",
    options: [
      { text: "Within 1-2 years", score: 5 },
      { text: "In 3-7 years", score: 15 },
      { text: "In 7-12 years", score: 25 },
      { text: "15+ years from now", score: 35 }
    ]
  },
  {
    id: 3,
    text: "If your portfolio dropped by 20% in one month, how would you react?",
    options: [
      { text: "Sell everything immediately to prevent further loss", score: 5 },
      { text: "Shift most funds to safer cash/fixed deposits", score: 15 },
      { text: "Do nothing and wait for the market to recover", score: 25 },
      { text: "Invest more to take advantage of lower prices", score: 40 }
    ]
  },
  {
    id: 4,
    text: "What level of fluctuations are you comfortable with for higher returns?",
    options: [
      { text: "None. I prefer guaranteed returns.", score: 0 },
      { text: "Low. I can handle small, infrequent dips.", score: 15 },
      { text: "Moderate. Ups and downs are part of the game.", score: 30 },
      { text: "High. Volatility is an opportunity for growth.", score: 45 }
    ]
  },
  {
    id: 5,
    text: "How much of your income is available for investment after all expenses?",
    options: [
      { text: "Less than 10%", score: 5 },
      { text: "10% to 25%", score: 15 },
      { text: "25% to 50%", score: 25 },
      { text: "More than 50%", score: 35 }
    ]
  }
];

const RiskProfile: React.FC<{ state: FinanceState, updateState: (data: Partial<FinanceState>) => void }> = ({ state, updateState }) => {
  const [currentStep, setCurrentStep] = useState(state.riskProfile ? 'result' : 'intro');
  const [answers, setAnswers] = useState<number[]>([]);
  const [activeQuestion, setActiveQuestion] = useState(0);

  const calculateResults = (finalAnswers: number[]): RiskProfileType => {
    const totalScore = finalAnswers.reduce((a, b) => a + b, 0);
    // Normalize score to 100
    const maxPossible = 185; // sum of max scores
    const score = Math.min(100, Math.round((totalScore / maxPossible) * 100));
    
    let level: RiskLevel = 'Balanced';
    let recommendedAllocation = { equity: 50, debt: 35, gold: 10, liquid: 5 };

    if (score < 25) {
      level = 'Conservative';
      recommendedAllocation = { equity: 15, debt: 60, gold: 5, liquid: 20 };
    } else if (score < 45) {
      level = 'Moderate';
      recommendedAllocation = { equity: 35, debt: 45, gold: 10, liquid: 10 };
    } else if (score < 70) {
      level = 'Balanced';
      recommendedAllocation = { equity: 55, debt: 30, gold: 10, liquid: 5 };
    } else if (score < 90) {
      level = 'Aggressive';
      recommendedAllocation = { equity: 75, debt: 15, gold: 5, liquid: 5 };
    } else {
      level = 'Very Aggressive';
      recommendedAllocation = { equity: 90, debt: 5, gold: 5, liquid: 0 };
    }

    return {
      score,
      level,
      lastUpdated: new Date().toISOString(),
      recommendedAllocation
    };
  };

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    if (activeQuestion < QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setActiveQuestion(activeQuestion + 1);
    } else {
      const result = calculateResults(newAnswers);
      updateState({ riskProfile: result });
      setCurrentStep('result');
    }
  };

  const reset = () => {
    setAnswers([]);
    setActiveQuestion(0);
    setCurrentStep('quiz');
  };

  if (currentStep === 'intro') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white rounded-[4rem] border border-slate-200 shadow-2xl overflow-hidden p-12 md:p-20 text-center space-y-10 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 blur-[100px] -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="mx-auto w-24 h-24 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-600/30">
            <BrainCircuit size={48} />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">Investment Risk DNA</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              A scientific assessment of your psychological capacity for volatility versus your financial requirements. Discover your ideal asset allocation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { title: 'Time Horizon', desc: 'Alignment with your goals.', icon: Zap },
              { title: 'Volatility Mask', desc: 'Stress response testing.', icon: Activity },
              { title: 'Smart Rebalance', desc: 'AI suggested allocation.', icon: BarChart3 },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <item.icon className="text-indigo-600 mb-3" size={24} />
                <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-tight">{item.desc}</p>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setCurrentStep('quiz')}
            className="px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 mx-auto group"
          >
            Start Risk Check <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'quiz') {
    const q = QUESTIONS[activeQuestion];
    const progress = ((activeQuestion + 1) / QUESTIONS.length) * 100;

    return (
      <div className="max-w-3xl mx-auto py-12 px-6 animate-in fade-in zoom-in-95">
        <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
             <button onClick={() => activeQuestion > 0 ? setActiveQuestion(activeQuestion - 1) : setCurrentStep('intro')} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-indigo-600 transition-colors">
               <ArrowLeft size={24} />
             </button>
             <div className="flex-1 px-8">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
             </div>
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{activeQuestion + 1} / {QUESTIONS.length}</span>
          </div>
          
          <div className="p-10 md:p-16 space-y-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {q.text}
            </h2>
            
            <div className="space-y-4">
              {q.options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleAnswer(opt.score)}
                  className="w-full p-6 text-left border-2 border-slate-100 rounded-[1.5rem] hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group flex items-center justify-between"
                >
                  <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-900">{opt.text}</span>
                  <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-indigo-600 transition-colors">
                    <div className="w-3 h-3 rounded-full bg-indigo-600 scale-0 group-hover:scale-100 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const result = state.riskProfile!;
  const allocation = result.recommendedAllocation;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      <div className="bg-slate-950 p-10 md:p-16 rounded-[4rem] text-white flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative shrink-0">
          <svg className="w-48 h-48 md:w-64 md:h-64 transform -rotate-90">
             <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
             <circle 
                cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent"
                strokeDasharray="450"
                strokeDashoffset={450 - (450 * result.score) / 100}
                className="text-indigo-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
             />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-5xl md:text-6xl font-black">{result.score}</span>
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Risk Score</span>
          </div>
        </div>

        <div className="flex-1 space-y-6 text-center md:text-left">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
              <ShieldCheck size={14} /> Profile Synchronized
           </div>
           <h2 className="text-4xl md:text-6xl font-black leading-none">Your Risk DNA: <br/><span className="text-indigo-500">{result.level}</span></h2>
           <p className="text-slate-400 font-medium text-lg max-w-xl">
             Your profile suggests a healthy appetite for growth with a strategic buffer for capital protection. 
             Last calibrated: {new Date(result.lastUpdated).toLocaleDateString()}
           </p>
           <button onClick={reset} className="flex items-center gap-2 text-xs font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">
             <RefreshCw size={14} /> Retake Assessment
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-12">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <PieChart className="text-indigo-600" size={28} /> Recommended Allocation
              </h3>
              <div className="hidden sm:flex gap-4">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-600" /><span className="text-[9px] font-black uppercase text-slate-400">Equity</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-[9px] font-black uppercase text-slate-400">Debt</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-[9px] font-black uppercase text-slate-400">Gold</span></div>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Equity', value: allocation.equity, color: 'indigo', desc: 'Market Growth' },
                { label: 'Debt', value: allocation.debt, color: 'emerald', desc: 'Fixed Income' },
                { label: 'Gold', value: allocation.gold, color: 'amber', desc: 'Inflation Hedge' },
                { label: 'Liquid', value: allocation.liquid, color: 'slate', desc: 'Ready Cash' }
              ].map((item, i) => (
                <div key={i} className={`p-8 rounded-[2.5rem] border border-slate-100 bg-${item.color}-50/30 text-center space-y-2`}>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                   <h4 className={`text-4xl font-black text-${item.color === 'slate' ? 'slate-900' : item.color + '-600'}`}>{item.value}%</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">{item.desc}</p>
                </div>
              ))}
           </div>

           <div className="mt-12 p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] flex items-start gap-4">
              <Info className="text-indigo-600 shrink-0" size={24} />
              <div>
                <h5 className="font-black text-indigo-900 text-sm">Strategic Insight</h5>
                <p className="text-xs text-indigo-700 font-medium leading-relaxed mt-1">
                  Based on your {result.level} profile, you should maintain a {allocation.equity}% exposure to market-linked instruments. 
                  Your current actual allocation is drifted by 12%. Consider rebalancing your Mutual Fund SIPs.
                </p>
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                 <AlertTriangle className="text-amber-500" size={20} /> Capacity Gaps
              </h3>
              <div className="space-y-6">
                 <div className="flex gap-4 p-4 rounded-2xl border border-slate-50">
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0"><Zap size={20}/></div>
                    <div>
                       <h4 className="text-xs font-black text-slate-900">Volatility Shock</h4>
                       <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">A 15% market correction could delay your "Retirement" goal by 8 months.</p>
                    </div>
                 </div>
                 <div className="flex gap-4 p-4 rounded-2xl border border-slate-50">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><CheckCircle2 size={20}/></div>
                    <div>
                       <h4 className="text-xs font-black text-slate-900">Safety Buffer</h4>
                       <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">Your liquid reserves ($12k) are sufficient to handle 4 months of burn rate.</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-indigo-600 p-8 rounded-[3rem] text-white flex flex-col justify-center gap-4 group cursor-pointer hover:bg-indigo-700 transition-all">
              <div className="p-3 bg-white/10 rounded-2xl w-fit"><PieChart size={24}/></div>
              <div>
                <h4 className="font-black text-lg leading-tight">Sync to Wealth Goals</h4>
                <p className="text-xs text-indigo-200 font-medium mt-1">Automatically align all SIPs to this risk profile.</p>
              </div>
              <ChevronRight className="self-end group-hover:translate-x-2 transition-transform" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default RiskProfile;
