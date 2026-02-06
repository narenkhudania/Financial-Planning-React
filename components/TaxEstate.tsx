
import React, { useState, useMemo } from 'react';
import { FinanceState } from '../types';
import { 
  Calculator, Scroll, UserCheck, ShieldPlus, AlertCircle, ArrowRight, 
  TrendingDown, Info, ArrowUpRight, DollarSign, Wallet, Landmark,
  ArrowDownRight, CheckCircle2, RefreshCw, BarChart3, PieChart, Zap
} from 'lucide-react';

const TaxEstate: React.FC<{ state: FinanceState }> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'estate'>('calculator');
  
  // Specific data mapping from Ravindra Khudania's sheet for simulation
  const salaryData = {
    basic: 1551000,
    hra: 775500,
    allowances: 775500,
    total: 3102000,
    rentPaid: 600000,
    isMetro: true // Mumbai
  };

  const deductions = {
    sec80C: 407326, // Insurance, EPF, Home Loan Principal
    sec80CCD1B: 50000, // NPS Self
    sec80CCD2: 136800, // Corporate NPS
    sec80D: 75000, // Self & Parents
    sec24: 475390, // Home Loan Interest
    sec80TTA: 5000 // Savings Interest
  };

  const otherIncome = {
    interest: 5000,
    dividend: 1000
  };

  const taxComparison = useMemo(() => {
    const grossIncome = salaryData.total + otherIncome.interest + otherIncome.dividend;
    
    // 1. HRA Exemption Calculation
    const hraA = salaryData.hra;
    const hraB = Math.max(0, salaryData.rentPaid - (0.1 * salaryData.basic));
    const hraC = 0.5 * salaryData.basic; // Mumbai = 50%
    const hraExemption = Math.min(hraA, hraB, hraC);
    const taxableHra = salaryData.hra - hraExemption;

    // 2. Old Regime Logic
    const oldDeductions = 50000 + // Standard
                         Math.min(150000, deductions.sec80C) + 
                         Math.min(50000, deductions.sec80CCD1B) + 
                         deductions.sec80CCD2 + 
                         deductions.sec80D + 
                         Math.min(200000, deductions.sec24) + 
                         Math.min(10000, deductions.sec80TTA);
    
    const oldNetIncome = grossIncome - hraExemption - oldDeductions;
    
    const calculateOldTax = (income: number) => {
      let tax = 0;
      if (income <= 250000) return 0;
      if (income > 250000) tax += Math.min(250000, income - 250000) * 0.05;
      if (income > 500000) tax += Math.min(500000, income - 500000) * 0.20;
      if (income > 1000000) tax += (income - 1000000) * 0.30;
      return tax;
    };

    const oldTaxAmount = calculateOldTax(oldNetIncome);
    const oldCess = oldTaxAmount * 0.04;
    const totalOldTax = oldTaxAmount + oldCess;

    // 3. New Regime Logic (AY 24-25)
    const newStandardDeduction = 75000;
    const newNetIncome = grossIncome - newStandardDeduction;

    const calculateNewTax = (income: number) => {
      let tax = 0;
      if (income <= 300000) return 0;
      if (income > 300000) tax += Math.min(400000, income - 300000) * 0.05;
      if (income > 700000) tax += Math.min(300000, income - 700000) * 0.10;
      if (income > 1000000) tax += Math.min(200000, income - 1000000) * 0.15;
      if (income > 1200000) tax += Math.min(300000, income - 1200000) * 0.20;
      if (income > 1500000) tax += (income - 1500000) * 0.30;
      return tax;
    };

    const newTaxAmount = calculateNewTax(newNetIncome);
    const newCess = newTaxAmount * 0.04;
    const totalNewTax = newTaxAmount + newCess;

    return {
      grossIncome,
      hraExemption,
      old: { netIncome: oldNetIncome, tax: totalOldTax, deductions: oldDeductions },
      new: { netIncome: newNetIncome, tax: totalNewTax, deductions: newStandardDeduction },
      diff: totalNewTax - totalOldTax,
      winner: totalNewTax > totalOldTax ? 'Old Regime' : 'New Regime'
    };
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-24">
      {/* Dynamic Header */}
      <div className="bg-[#0b0f1a] p-12 md:p-16 rounded-[5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
              <Calculator size={14}/> Tax Compliance Node
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85]">Strategic <br/><span className="text-indigo-500">Tax Ops.</span></h2>
            <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
              Comparison of AY 24-25 Old vs New Tax Regimes with optimized exemption mapping.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-10 rounded-[4rem] backdrop-blur-xl flex flex-col items-center gap-3 shadow-inner">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recommended Choice</p>
             <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{taxComparison.winner}</h4>
             <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                <TrendingDown size={12}/> Saves ${Math.abs(Math.round(taxComparison.diff)).toLocaleString()}
             </div>
          </div>
        </div>
      </div>

      <div className="flex p-2 bg-white rounded-[2.5rem] border border-slate-200 w-fit mx-auto shadow-sm">
        <button onClick={() => setActiveTab('calculator')} className={`px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'calculator' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}>Tax Regime Comparison</button>
        <button onClick={() => setActiveTab('estate')} className={`px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'estate' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}>Estate & Compliance</button>
      </div>

      {activeTab === 'calculator' ? (
        <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Old Regime Card */}
              <div className="bg-white p-12 rounded-[4.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity"><Landmark size={120}/></div>
                 <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-center">
                       <h3 className="text-3xl font-black text-slate-900">Old Regime</h3>
                       <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">High Deductions</span>
                    </div>
                    
                    <div className="space-y-4 border-y border-slate-50 py-8">
                       <div className="flex justify-between text-sm font-bold"><span className="text-slate-400 uppercase tracking-widest text-[10px]">Net Taxable Income</span><span className="text-slate-900">${Math.round(taxComparison.old.netIncome).toLocaleString()}</span></div>
                       <div className="flex justify-between text-sm font-bold"><span className="text-slate-400 uppercase tracking-widest text-[10px]">Utilized Deductions</span><span className="text-emerald-500">${Math.round(taxComparison.old.deductions).toLocaleString()}</span></div>
                       <div className="flex justify-between text-sm font-bold"><span className="text-slate-400 uppercase tracking-widest text-[10px]">HRA Exemption</span><span className="text-emerald-500">${Math.round(taxComparison.hraExemption).toLocaleString()}</span></div>
                    </div>

                    <div className="pt-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Effective Annual Tax</p>
                       <h4 className="text-5xl font-black text-slate-900 tracking-tighter">${Math.round(taxComparison.old.tax).toLocaleString()}</h4>
                    </div>
                 </div>
              </div>

              {/* New Regime Card */}
              <div className={`bg-white p-12 rounded-[4.5rem] border-4 transition-all relative overflow-hidden group ${taxComparison.winner === 'New Regime' ? 'border-indigo-600 shadow-2xl' : 'border-slate-100 opacity-80'}`}>
                 <div className="absolute top-0 right-0 p-8 text-indigo-50 opacity-10"><Zap size={120}/></div>
                 <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-center">
                       <h3 className="text-3xl font-black text-slate-900">New Regime</h3>
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${taxComparison.winner === 'New Regime' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{taxComparison.winner === 'New Regime' ? 'Optimized Choice' : 'Higher Tax Outflow'}</span>
                    </div>
                    
                    <div className="space-y-4 border-y border-slate-50 py-8">
                       <div className="flex justify-between text-sm font-bold"><span className="text-slate-400 uppercase tracking-widest text-[10px]">Net Taxable Income</span><span className="text-slate-900">${Math.round(taxComparison.new.netIncome).toLocaleString()}</span></div>
                       <div className="flex justify-between text-sm font-bold"><span className="text-slate-400 uppercase tracking-widest text-[10px]">Standard Deduction</span><span className="text-emerald-500">${Math.round(taxComparison.new.deductions).toLocaleString()}</span></div>
                       <div className="flex justify-between text-sm font-bold opacity-30 line-through"><span className="text-slate-400 uppercase tracking-widest text-[10px]">HRA / Deductions</span><span className="text-slate-900">$0</span></div>
                    </div>

                    <div className="pt-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Effective Annual Tax</p>
                       <h4 className={`text-5xl font-black tracking-tighter ${taxComparison.winner === 'New Regime' ? 'text-indigo-600' : 'text-slate-900'}`}>${Math.round(taxComparison.new.tax).toLocaleString()}</h4>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-slate-950 p-12 rounded-[5rem] text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
              <div className="space-y-4 relative z-10">
                 <h4 className="text-3xl font-black tracking-tight">Strategy Execution Plan</h4>
                 <p className="text-slate-400 font-medium max-w-xl">
                   Based on your ${taxComparison.grossIncome.toLocaleString()} gross income and significant interest on home loan, the <span className="text-indigo-500 font-bold">{taxComparison.winner}</span> is the efficient tactical choice for AY 24-25.
                 </p>
              </div>
              <div className="flex gap-4 relative z-10">
                 <button className="px-10 py-5 bg-white text-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Download Computation</button>
                 <button className="px-10 py-5 bg-white/10 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Analyze with AI</button>
              </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm space-y-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[2rem]"><Scroll size={32} /></div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Intergenerational Will</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inter-family Asset Transfer</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 rounded-3xl border border-slate-50 group hover:border-indigo-400 transition-all cursor-pointer">
                <UserCheck className={state.estate.nominationsUpdated ? 'text-emerald-500' : 'text-slate-300'} size={24} />
                <div>
                  <h4 className="text-sm font-black text-slate-800">Account Nominations</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">Beneficiaries for bank accounts, insurance policies, and mutual funds are up-to-date.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-3xl border border-slate-50 group hover:border-indigo-400 transition-all cursor-pointer">
                <ShieldPlus className={state.estate.hasWill ? 'text-emerald-500' : 'text-slate-300'} size={24} />
                <div>
                  <h4 className="text-sm font-black text-slate-800">Codicil Registration</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">A legally registered Will reduces friction during probate and ensures asset protection.</p>
                  <button className="mt-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 group">Register Legacy Will <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/></button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center space-y-8">
             <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-300 shadow-inner">
                <AlertCircle size={48}/>
             </div>
             <div className="space-y-3">
                <h4 className="text-2xl font-black text-slate-900">Digital Asset Mapping</h4>
                <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">Map your crypto holdings, digital accounts, and private keys for secure estate succession.</p>
             </div>
             <button className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">Enable Crypto Legacy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxEstate;
