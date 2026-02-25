import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function ParcelsPage() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="bg-[#121212] text-white min-h-screen relative overflow-x-hidden font-display">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#f48c25]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[200px] h-[200px] bg-[#f48c25]/5 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full min-h-screen pb-24 max-w-md mx-auto">
        <header className="pt-10 px-5 pb-4 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold tracking-tight text-white">我的包裹</h1>
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-white/80 text-[18px]">search</span>
              </button>
              <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors relative">
                <span className="material-symbols-outlined text-white/80 text-[18px]">filter_list</span>
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#f48c25] rounded-full"></span>
              </button>
            </div>
          </div>
          
          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-1">
            {['all', 'pending', 'arrived', 'shipping', 'completed'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex flex-col items-center gap-1 min-w-fit group"
              >
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  activeTab === tab ? "text-white font-bold" : "text-white/50 group-hover:text-white/80"
                )}>
                  {tab === 'all' && '全部'}
                  {tab === 'pending' && '待入庫'}
                  {tab === 'arrived' && '已入庫'}
                  {tab === 'shipping' && '運輸中'}
                  {tab === 'completed' && '已簽收'}
                </span>
                <span className={cn(
                  "w-full h-0.5 rounded-full transition-colors",
                  activeTab === tab ? "bg-[#f48c25] shadow-[0_0_8px_rgba(244,140,37,0.6)]" : "bg-transparent group-hover:bg-white/10"
                )}></span>
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 px-4 py-4 space-y-3">
          {/* Card 1 */}
          <div className="bg-[#1e1e24]/60 backdrop-blur-md border border-white/5 rounded-xl p-4 relative overflow-hidden group shadow-lg">
            <div className="absolute left-0 top-0 h-full w-1 bg-[#f48c25] shadow-[0_0_10px_rgba(244,140,37,0.5)]"></div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#f48c25]/20 text-[#f48c25] border border-[#f48c25]/20 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">清關中</span>
                  <span className="text-[10px] text-white/40 tracking-widest">RT-20231024001</span>
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">電子配件 • 5.2kg</h3>
              </div>
              <button className="text-white/40 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>
            
            <div className="flex items-center justify-between relative py-2 mb-3">
              <div className="absolute left-4 right-4 top-1/2 h-[1px] bg-white/10 -translate-y-1/2 z-0"></div>
              <div className="absolute left-4 right-[40%] top-1/2 h-[1px] bg-gradient-to-r from-[#f48c25]/50 to-[#f48c25] -translate-y-1/2 z-0 shadow-[0_0_8px_rgba(244,140,37,0.4)]"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
                <span className="text-[10px] text-white/60 font-medium">台北</span>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-[#1e1e24] border border-[#f48c25] text-[#f48c25] flex items-center justify-center shadow-[0_0_12px_rgba(244,140,37,0.4)]">
                  <span className="material-symbols-outlined text-[12px]">local_shipping</span>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1e1e24] border-2 border-white/20"></div>
                <span className="text-[10px] text-white/60 font-medium">福州</span>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-2.5 border border-white/5 flex gap-2 items-start">
              <span className="material-symbols-outlined text-[#f48c25] text-[16px] mt-0.5">update</span>
              <div>
                <p className="text-xs text-white/90 font-medium leading-tight mb-0.5">包裹正在進行海關查驗</p>
                <p className="text-[10px] text-white/40">2023-10-24 14:30</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1e1e24]/60 backdrop-blur-md border border-white/5 rounded-xl p-4 relative overflow-hidden group shadow-lg">
            <div className="absolute left-0 top-0 h-full w-1 bg-blue-500/50"></div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">運輸中</span>
                  <span className="text-[10px] text-white/40 tracking-widest">RT-20231025088</span>
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">生活日用品 • 2.1kg</h3>
              </div>
              <button className="text-white/40 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>

            <div className="flex items-center justify-between relative py-2 mb-3">
              <div className="absolute left-4 right-4 top-1/2 h-[1px] bg-white/10 -translate-y-1/2 z-0"></div>
              <div className="absolute left-4 right-[60%] top-1/2 h-[1px] bg-gradient-to-r from-blue-500/50 to-blue-500 -translate-y-1/2 z-0"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-white/20"></div>
                <span className="text-[10px] text-white/60 font-medium">基隆</span>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-[#1e1e24] border border-blue-500 text-blue-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[12px]">sailing</span>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1e1e24] border-2 border-white/20"></div>
                <span className="text-[10px] text-white/60 font-medium">廈門</span>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-2.5 border border-white/5 flex gap-2 items-start">
              <span className="material-symbols-outlined text-blue-400 text-[16px] mt-0.5">history</span>
              <div>
                <p className="text-xs text-white/90 font-medium leading-tight mb-0.5">已裝船，準備發往廈門港</p>
                <p className="text-[10px] text-white/40">2023-10-25 09:10</p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#1e1e24]/60 backdrop-blur-md border border-white/5 rounded-xl p-4 relative overflow-hidden group shadow-lg opacity-80">
            <div className="absolute left-0 top-0 h-full w-1 bg-green-500/50"></div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">已簽收</span>
                  <span className="text-[10px] text-white/40 tracking-widest">RT-20231022055</span>
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">服飾樣品 • 1.5kg</h3>
              </div>
              <button className="text-white/40 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>

            <div className="flex items-center justify-between relative py-2 mb-3">
              <div className="absolute left-4 right-4 top-1/2 h-[1px] bg-green-500/30 -translate-y-1/2 z-0"></div>
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                <span className="text-[10px] text-white/40 font-medium">高雄</span>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-green-500/50 text-[14px]">check_circle</span>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-[10px] text-white/40 font-medium">廈門</span>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-2.5 border border-white/5 flex gap-2 items-start">
              <span className="material-symbols-outlined text-green-400 text-[16px] mt-0.5">verified</span>
              <div>
                <p className="text-xs text-white/80 font-medium leading-tight mb-0.5">已送達指定地址，簽收人：前台</p>
                <p className="text-[10px] text-white/40">2023-10-23 09:15</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
