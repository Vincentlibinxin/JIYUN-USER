import { useNavigate } from 'react-router-dom';

export default function QuotePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#221910] text-white min-h-full relative overflow-x-hidden selection:bg-[#f48c25] selection:text-white font-display flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a120b] via-[#221910] to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,140,37,0.15)_0%,transparent_50%)] opacity-60"></div>
        <div className="absolute inset-0 bg-[size:40px_40px] bg-[linear-gradient(rgba(73,54,34,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(73,54,34,0.1)_1px,transparent_1px)] opacity-20"></div>
        <div className="absolute top-20 right-0 w-64 h-64 bg-[#f48c25]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-[-50px] w-48 h-48 bg-[#f48c25]/10 rounded-full blur-3xl"></div>
      </div>

      <header className="flex items-center justify-between px-4 py-4 pt-6 bg-[#1a120b]/50 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
        <div className="w-10"></div>
        <h1 className="text-lg font-bold tracking-wide">報價查詢</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 px-5 py-6 space-y-6 relative z-10 max-w-md mx-auto w-full">
        <section className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[#f48c25] text-xs font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f48c25] animate-pulse"></span>
              路線選擇
            </h2>
          </div>
          <div className="relative flex flex-col gap-3">
            <div className="absolute left-[19px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-[#f48c25]/50 to-[#f48c25]/10 z-0"></div>
            
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2c2117] border border-[#f48c25]/30 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(244,140,37,0.2)]">
                <span className="material-symbols-outlined text-[#f48c25] text-lg">warehouse</span>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] text-gray-400 mb-1 ml-1">起點</label>
                <div className="w-full bg-[#2c2117]/50 border border-white/10 text-gray-300 px-4 py-2.5 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-sm">大陸倉庫 (集運倉)</span>
                  <span className="material-symbols-outlined text-gray-500 text-xs">lock</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2c2117] border border-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-lg">location_on</span>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] text-gray-400 mb-1 ml-1">終點</label>
                <div className="relative">
                  <select defaultValue="" className="w-full bg-white text-gray-900 font-medium px-4 py-2.5 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f48c25] appearance-none cursor-pointer text-sm">
                    <option disabled value="">請選擇台灣城市</option>
                    <option value="TPE">台北市</option>
                    <option value="NTP">新北市</option>
                    <option value="TAO">桃園市</option>
                    <option value="TCH">台中市</option>
                    <option value="TNN">台南市</option>
                    <option value="KHH">高雄市</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[#f48c25] text-xs font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f48c25]/50"></span>
              貨物信息
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] text-gray-400 mb-1.5 ml-1">預估重量</label>
              <div className="relative">
                <input className="w-full bg-white text-gray-900 font-semibold text-base px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f48c25] placeholder:text-gray-300" inputMode="decimal" placeholder="0.0" type="number"/>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-xs">kg</span>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] text-gray-400 mb-1.5 ml-1">體積 (長 x 寬 x 高)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input className="w-full bg-white text-gray-900 text-center font-medium px-2 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f48c25] placeholder:text-gray-300 text-sm" inputMode="numeric" placeholder="L" type="number"/>
                  <span className="absolute right-2 bottom-1 text-[8px] text-gray-400">cm</span>
                </div>
                <div className="relative flex-1">
                  <input className="w-full bg-white text-gray-900 text-center font-medium px-2 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f48c25] placeholder:text-gray-300 text-sm" inputMode="numeric" placeholder="W" type="number"/>
                  <span className="absolute right-2 bottom-1 text-[8px] text-gray-400">cm</span>
                </div>
                <div className="relative flex-1">
                  <input className="w-full bg-white text-gray-900 text-center font-medium px-2 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f48c25] placeholder:text-gray-300 text-sm" inputMode="numeric" placeholder="H" type="number"/>
                  <span className="absolute right-2 bottom-1 text-[8px] text-gray-400">cm</span>
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] text-gray-400 mb-1.5 ml-1">貨物類別</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <span className="material-symbols-outlined text-sm">category</span>
                </div>
                <select className="w-full bg-white text-gray-900 font-medium px-4 py-2.5 pl-9 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f48c25] appearance-none cursor-pointer text-sm">
                  <option value="general">普通貨 (General Cargo)</option>
                  <option value="special">特貨 (Special Cargo)</option>
                  <option value="battery">含電池 (Battery)</option>
                  <option value="liquid">液體/粉末 (Liquid/Powder)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <button className="w-full bg-[#f48c25] hover:bg-orange-600 text-white font-bold text-base py-3.5 rounded-xl shadow-lg shadow-orange-900/50 transition-all transform active:scale-[0.98] animate-[pulse-glow_2s_infinite] flex items-center justify-center gap-2 group mt-2">
          <span className="material-symbols-outlined group-hover:rotate-12 transition-transform text-lg">calculate</span>
          立即試算
        </button>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/15 rounded-2xl p-4 relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="flex flex-col gap-3 relative z-10">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <p className="text-[10px] text-gray-300 mb-0.5">預計運費總額</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#f48c25]">TWD 350</span>
                  <span className="text-[10px] text-gray-400">.00</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-300 mb-0.5">預計時效</p>
                <div className="flex items-center gap-1 justify-end text-white">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span className="text-base font-bold">3-5</span>
                  <span className="text-[10px]">天</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">flight_takeoff</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">空運特快管道</p>
                  <p className="text-[10px] text-gray-400">含稅 / 雙清 / 派送到門</p>
                </div>
              </div>
              <button className="text-[10px] text-[#f48c25] border border-[#f48c25]/50 px-2.5 py-1 rounded-full hover:bg-[#f48c25] hover:text-white transition-colors">
                查看詳情
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
