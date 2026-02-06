
import React, { useState } from 'react';
import { FinanceState, Asset, AssetType } from '../types';
import { Plus, Trash2, Coins, TrendingUp, Home, Landmark, Briefcase, Car, Gem, CheckCircle2, Circle } from 'lucide-react';

const ASSET_CLASSES: { name: AssetType, icon: any }[] = [
  { name: 'Liquid', icon: Landmark },
  { name: 'Debt', icon: Briefcase },
  { name: 'Equity', icon: TrendingUp },
  { name: 'Real Estate', icon: Home },
  { name: 'Gold/Silver', icon: Coins },
  { name: 'Personal', icon: Car },
];

const Assets: React.FC<{ state: FinanceState, updateState: (data: Partial<FinanceState>) => void }> = ({ state, updateState }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    category: 'Equity',
    owner: 'self',
    currentValue: 0,
    growthRate: 10,
    availableForGoals: true,
    availableFrom: new Date().getFullYear(),
    name: ''
  });

  const handleAdd = () => {
    const asset = { ...newAsset, id: Math.random().toString(36).substr(2, 9) } as Asset;
    updateState({ assets: [...state.assets, asset] });
    setShowAdd(false);
  };

  const removeAsset = (id: string) => {
    updateState({ assets: state.assets.filter(a => a.id !== id) });
  };

  const getOwnerName = (id: string) => {
    if (id === 'self') return state.profile.firstName || 'Self';
    return state.family.find(f => f.id === id)?.name || 'Unknown';
  };

  const totalAssetsValue = state.assets.reduce((sum, a) => sum + a.currentValue, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-900">Step 5: Asset Inventory</h3>
          <p className="text-sm font-medium text-slate-500">Log your multi-owner holdings across fixed, liquid, and market-linked classes.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="px-10 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-2xl"
        >
          <Plus size={20} /> Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex flex-col justify-center">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Assets</p>
          <h4 className="text-3xl font-black text-emerald-900">${totalAssetsValue.toLocaleString()}</h4>
        </div>
        {ASSET_CLASSES.map(ac => {
          const val = state.assets.filter(a => a.category === ac.name).reduce((sum, a) => sum + a.currentValue, 0);
          return (
            <div key={ac.name} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{ac.name}</p>
              <h4 className="text-lg font-black text-slate-900">${val.toLocaleString()}</h4>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {state.assets.map((asset) => (
          <div key={asset.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-emerald-400 transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all`}>
                  {ASSET_CLASSES.find(ac => ac.name === asset.category)?.icon && React.createElement(ASSET_CLASSES.find(ac => ac.name === asset.category)!.icon, { size: 24 })}
                </div>
                <div className="flex gap-2">
                  {asset.availableForGoals ? (
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">Liquidity Ready</span>
                  ) : (
                    <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-100">Locked Asset</span>
                  )}
                  <button onClick={() => removeAsset(asset.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
             </div>
             <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-black text-slate-900">{asset.name || asset.category}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{asset.category} • Owner: {getOwnerName(asset.owner)}</p>
                </div>
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Present Value</p>
                      <p className="text-2xl font-black text-slate-900">${asset.currentValue.toLocaleString()}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-emerald-500 uppercase">Growth: {asset.growthRate}%</p>
                      {asset.availableFrom && <p className="text-[9px] font-bold text-slate-400 mt-1">Avail: {asset.availableFrom}</p>}
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 h-[80vh] flex flex-col">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-2xl font-black text-slate-900">Add Holding</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-900">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-10 space-y-6 flex-1 overflow-y-auto no-scrollbar">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Category</label>
                  <select 
                    value={newAsset.category}
                    onChange={e => setNewAsset({...newAsset, category: e.target.value as AssetType})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none"
                  >
                     {ASSET_CLASSES.map(ac => <option key={ac.name}>{ac.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Name</label>
                  <input type="text" placeholder="e.g. HDFC Equity Fund" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold" />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner</label>
                    <select value={newAsset.owner} onChange={e => setNewAsset({...newAsset, owner: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold">
                       <option value="self">Self</option>
                       {state.family.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Rate (%)</label>
                    <input type="number" value={newAsset.growthRate || ''} onChange={e => setNewAsset({...newAsset, growthRate: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Goal Availability</label>
                    <button 
                      type="button" 
                      onClick={() => setNewAsset({...newAsset, availableForGoals: !newAsset.availableForGoals})} 
                      className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 border transition-all font-black text-[10px] uppercase tracking-widest ${newAsset.availableForGoals ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                    >
                      {newAsset.availableForGoals ? <CheckCircle2 size={16}/> : <Circle size={16}/>}
                      {newAsset.availableForGoals ? 'Available' : 'Locked'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available From (Year)</label>
                    <input type="number" value={newAsset.availableFrom || ''} onChange={e => setNewAsset({...newAsset, availableFrom: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold" />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Present Market Value ($)</label>
                  <input type="number" value={newAsset.currentValue || ''} onChange={e => setNewAsset({...newAsset, currentValue: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold" />
               </div>
            </div>
            <div className="p-10 border-t border-slate-50 bg-white">
               <button onClick={handleAdd} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-lg shadow-xl">Secure Asset Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
