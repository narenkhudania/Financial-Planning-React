
import React, { useState, useMemo } from 'react';
import { FinanceState, Loan, LoanType } from '../types';
import { 
  Plus, Trash2, Home, CreditCard, Car, Landmark, User, 
  Calendar, Percent, ArrowUpRight, TrendingDown, Info, 
  ChevronRight, ChevronDown, Activity, ShieldCheck, Calculator,
  ExternalLink, ArrowDownToLine
} from 'lucide-react';

const LOAN_TYPES: { type: LoanType, icon: any }[] = [
  { type: 'Home Loan', icon: Home },
  { type: 'Car Loan', icon: Car },
  { type: 'Property Purchase', icon: Landmark },
  { type: 'Personal Loan', icon: User },
  { type: 'Credit Card EMI', icon: CreditCard },
  { type: 'OD', icon: Landmark },
];

const Liabilities: React.FC<{ state: FinanceState, updateState: (data: Partial<FinanceState>) => void }> = ({ state, updateState }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  
  const [newLoan, setNewLoan] = useState<Partial<Loan>>({
    type: 'Home Loan',
    owner: 'self',
    source: '',
    sanctionedAmount: 0,
    outstandingAmount: 0,
    interestRate: 8.5,
    remainingTenure: 120,
    emi: 0,
    lumpSumRepayments: []
  });

  const handleAdd = () => {
    const loan = { ...newLoan, id: Math.random().toString(36).substr(2, 9) } as Loan;
    updateState({ loans: [...state.loans, loan] });
    setShowAdd(false);
    setNewLoan({ type: 'Home Loan', owner: 'self', source: '', sanctionedAmount: 0, outstandingAmount: 0, interestRate: 8.5, remainingTenure: 120, emi: 0, lumpSumRepayments: [] });
  };

  const removeLoan = (id: string) => {
    updateState({ loans: state.loans.filter(l => l.id !== id) });
  };

  const totalOutstanding = state.loans.reduce((sum, l) => sum + l.outstandingAmount, 0);
  const totalEMI = state.loans.reduce((sum, l) => sum + l.emi, 0);

  // Amortization Calculator
  const getAmortization = (loan: Loan, periods: number = 12) => {
    const monthlyRate = loan.interestRate / 12 / 100;
    let balance = loan.outstandingAmount;
    const schedule = [];
    
    for (let i = 1; i <= Math.min(periods, loan.remainingTenure); i++) {
      const interest = balance * monthlyRate;
      const principal = Math.min(balance, loan.emi - interest);
      balance -= principal;
      schedule.push({ month: i, interest, principal, balance: Math.max(0, balance) });
    }
    return schedule;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Header Strategy Block */}
      <div className="bg-[#0b0f1a] p-12 md:p-16 rounded-[4rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
              <Activity size={14}/> Liability Architecture
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85]">Debt <br/><span className="text-indigo-500">Inventory.</span></h2>
            <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
              Monitoring <span className="text-white font-bold">{state.loans.length} active credit lines</span> totaling <span className="text-rose-400 font-black">${totalOutstanding.toLocaleString()}</span> in principal liabilities.
            </p>
          </div>
          <button 
            onClick={() => setShowAdd(true)}
            className="px-12 py-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.5rem] transition-all flex items-center gap-4 font-black uppercase text-sm tracking-[0.25em] shadow-2xl shadow-indigo-600/40 active:scale-95 shrink-0"
          >
            <Plus size={22} /> Add Loan Profile
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</p>
          <h4 className="text-3xl font-black text-rose-600 tracking-tighter">${totalOutstanding.toLocaleString()}</h4>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly EMI Load</p>
          <h4 className="text-3xl font-black text-slate-900 tracking-tighter">${totalEMI.toLocaleString()}</h4>
        </div>
        <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white flex flex-col justify-center border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingDown size={100}/></div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">DTI Ratio</p>
           <h4 className="text-3xl font-black text-indigo-400 tracking-tighter">{totalEMI > 0 ? '28.4%' : '0%'}</h4>
        </div>
        <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 flex flex-col justify-center">
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Interest Avoidance</p>
           <h4 className="text-3xl font-black text-emerald-700 tracking-tighter">$14,200</h4>
           <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1 flex items-center gap-1"><ArrowUpRight size={10}/> With extra payments</p>
        </div>
      </div>

      {/* Loan Inventory List */}
      <div className="space-y-6">
        {state.loans.length === 0 ? (
          <div className="py-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center opacity-50 space-y-4">
             <div className="p-6 bg-slate-50 rounded-[2rem] text-slate-300"><Landmark size={48}/></div>
             <p className="font-black text-slate-400 uppercase text-xs tracking-widest">No active liabilities recorded</p>
          </div>
        ) : (
          state.loans.map((loan) => {
            const Icon = LOAN_TYPES.find(lt => lt.type === loan.type)?.icon || Landmark;
            const isExpanded = expandedLoanId === loan.id;
            const payoffProgress = Math.min(100, Math.round(((loan.sanctionedAmount - loan.outstandingAmount) / (loan.sanctionedAmount || 1)) * 100));
            const amort = getAmortization(loan);

            return (
              <div key={loan.id} className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-300 transition-all">
                <div 
                  className="p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 cursor-pointer"
                  onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                >
                  <div className="flex gap-8 flex-1">
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                      <Icon size={32} />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{loan.source || 'Standard Lender'}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{loan.type}</span>
                      </div>
                      <h4 className="text-3xl font-black text-slate-900 tracking-tighter">${loan.outstandingAmount.toLocaleString()}</h4>
                      
                      <div className="flex items-center gap-6 pt-2">
                         <div className="flex-1 max-w-[200px] h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${payoffProgress}%` }} />
                         </div>
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{payoffProgress}% Principal Repaid</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-12 text-center shrink-0 border-l border-slate-100 pl-12">
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly EMI</p>
                        <p className="text-xl font-black text-slate-900">${loan.emi.toLocaleString()}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Int. Rate</p>
                        <p className="text-xl font-black text-indigo-600">{loan.interestRate}%</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
                        <p className="text-xl font-black text-slate-900">{loan.remainingTenure} MO</p>
                     </div>
                  </div>

                  <div className="flex gap-3 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); removeLoan(loan.id); }} className="p-4 bg-rose-50 text-rose-400 hover:text-rose-600 rounded-3xl transition-all"><Trash2 size={20}/></button>
                    <div className={`p-4 bg-slate-50 text-slate-400 rounded-3xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}><ChevronDown size={20}/></div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-slate-50 p-10 md:p-14 border-t border-slate-200 animate-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                       {/* Snapshot */}
                       <div className="space-y-8">
                          <div>
                             <h5 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6 uppercase tracking-tight"><ShieldCheck size={20} className="text-emerald-500"/> Loan Sanction Audit</h5>
                             <div className="space-y-4">
                                <div className="flex justify-between py-3 border-b border-slate-200"><span className="text-[11px] font-bold text-slate-500 uppercase">Original Sanction</span><span className="text-sm font-black text-slate-900">${loan.sanctionedAmount.toLocaleString()}</span></div>
                                <div className="flex justify-between py-3 border-b border-slate-200"><span className="text-[11px] font-bold text-slate-500 uppercase">Total Interest Paid</span><span className="text-sm font-black text-rose-500">$42,800</span></div>
                                <div className="flex justify-between py-3 border-b border-slate-200"><span className="text-[11px] font-bold text-slate-500 uppercase">Lump Sum Repayments</span><span className="text-sm font-black text-emerald-500">${(loan.lumpSumRepayments.reduce((s, r) => s + r.amount, 0)).toLocaleString()}</span></div>
                             </div>
                          </div>
                          <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">Add Additional Payment <ArrowUpRight size={14}/></button>
                       </div>

                       {/* Next 12 Months Amortization */}
                       <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 shadow-inner overflow-hidden">
                          <div className="px-10 py-6 bg-white border-b border-slate-100 flex justify-between items-center">
                             <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Next 12 Months Amortization</h5>
                             <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Mathematical Projection</span>
                          </div>
                          <div className="overflow-x-auto">
                             <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                   <tr>
                                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Period</th>
                                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase text-right">Interest</th>
                                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase text-right">Principal</th>
                                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase text-right">Closing Balance</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                   {amort.map((row) => (
                                      <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                                         <td className="px-8 py-4 text-xs font-black text-slate-600">Month {row.month}</td>
                                         <td className="px-8 py-4 text-xs font-bold text-rose-500 text-right">${Math.round(row.interest).toLocaleString()}</td>
                                         <td className="px-8 py-4 text-xs font-bold text-emerald-500 text-right">${Math.round(row.principal).toLocaleString()}</td>
                                         <td className="px-8 py-4 text-xs font-black text-slate-900 text-right">${Math.round(row.balance).toLocaleString()}</td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Advanced Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-3xl z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 h-[85vh] flex flex-col border border-white/20">
            <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-30">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem]"><Calculator size={28}/></div>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">Debt Origination</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Institutional Credit Profile</p>
                </div>
              </div>
              <button onClick={() => setShowAdd(false)} className="p-4 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-3xl text-slate-400 transition-all"><Plus size={32} className="rotate-45" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
               {/* Identity & Source */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Loan Topology</label>
                    <select 
                      value={newLoan.type}
                      onChange={e => setNewLoan({...newLoan, type: e.target.value as LoanType})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-8 py-5 text-lg font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all"
                    >
                       {LOAN_TYPES.map(lt => <option key={lt.type}>{lt.type}</option>)}
                       <option>Others</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Financial Provider</label>
                    <input 
                      type="text" 
                      placeholder="e.g. SBI Bank, ICICI, etc." 
                      value={newLoan.source} 
                      onChange={e => setNewLoan({...newLoan, source: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-8 py-5 text-lg font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all" 
                    />
                  </div>
               </div>

               {/* Financial Resolution */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sanctioned Principal</label>
                    <input 
                      type="number" 
                      value={newLoan.sanctionedAmount || ''} 
                      onChange={e => setNewLoan({...newLoan, sanctionedAmount: parseFloat(e.target.value)})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-8 py-5 text-lg font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all" 
                      placeholder="$ 0"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Outstanding</label>
                    <input 
                      type="number" 
                      value={newLoan.outstandingAmount || ''} 
                      onChange={e => setNewLoan({...newLoan, outstandingAmount: parseFloat(e.target.value)})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-8 py-5 text-lg font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all" 
                      placeholder="$ 0"
                    />
                  </div>
               </div>

               {/* Terms & Servicing */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Actual EMI ($)</label>
                    <input 
                      type="number" 
                      value={newLoan.emi || ''} 
                      onChange={e => setNewLoan({...newLoan, emi: parseFloat(e.target.value)})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-5 text-lg font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interest Rate (%)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={newLoan.interestRate || ''} 
                      onChange={e => setNewLoan({...newLoan, interestRate: parseFloat(e.target.value)})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-5 text-lg font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remaining (Mo)</label>
                    <input 
                      type="number" 
                      value={newLoan.remainingTenure || ''} 
                      onChange={e => setNewLoan({...newLoan, remainingTenure: parseInt(e.target.value)})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-5 text-lg font-black outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all" 
                    />
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-50 flex items-center gap-6 p-8 bg-indigo-50/50 rounded-[3rem] border border-indigo-100">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0"><Info size={28}/></div>
                  <p className="text-xs font-bold text-indigo-900 leading-relaxed italic">
                    Amortization schedules and repayment trajectories will be generated automatically upon submission. Ensure the interest rate matches your latest bank statement.
                  </p>
               </div>
            </div>

            <div className="p-10 border-t border-slate-100 bg-white sticky bottom-0">
               <button onClick={handleAdd} className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-lg hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center gap-6">Authorize Credit Record <ArrowUpRight size={32}/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Liabilities;
