export default function ForecastPage() {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-full flex flex-col font-body antialiased overflow-x-hidden relative selection:bg-[#f48c25] selection:text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#0a0a0a] to-[#050505]"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(244,140,37,0.15)_1px,transparent_1px)] bg-[length:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f48c25]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-[#f48c25]/5 rounded-full blur-[80px]"></div>
      </div>

      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 pt-safe-top">
        <div className="flex items-center justify-center px-4 h-14 relative">
          <h1 className="text-lg font-bold tracking-wide">預報包裹</h1>
        </div>
      </header>

      <main className="flex-1 relative z-10 px-5 pt-6 flex flex-col gap-6 max-w-md mx-auto w-full">
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-[#f48c25]">
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/80">快遞單號</h2>
          </div>
          <div className="bg-[#1f1f1f]/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
            <label className="block mb-2 text-[10px] font-medium text-gray-400">輸入單號或掃碼</label>
            <div className="relative">
              <input className="w-full h-10 pl-3 pr-10 bg-white text-gray-900 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f48c25]/50 font-medium font-display tracking-wide text-sm" placeholder="請輸入原賣家物流單號" type="text"/>
              <button className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-[#f48c25] transition-colors">
                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#f48c25]/20 text-[#f48c25] border border-[#f48c25]/30">順豐速運</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-400 border border-white/10">中通快遞</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-400 border border-white/10">圓通速遞</span>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center gap-2 text-[#f48c25]">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/80">物品信息</h2>
          </div>
          <div className="bg-[#1f1f1f]/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-[10px] font-medium text-gray-400">類別</label>
                <div className="relative">
                  <select className="w-full h-10 pl-3 pr-8 bg-white text-gray-900 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#f48c25]/50 font-medium text-sm">
                    <option>普貨</option>
                    <option>特貨</option>
                    <option>敏感貨</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-[10px] font-medium text-gray-400">數量</label>
                <div className="flex items-center bg-white rounded-lg h-10 px-1">
                  <button className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-[#f48c25]">
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <input className="w-full text-center bg-transparent text-gray-900 font-bold focus:outline-none p-0 border-none h-full text-sm" type="number" defaultValue="1"/>
                  <button className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-[#f48c25]">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block mb-2 text-[10px] font-medium text-gray-400">申報價值 (RMB)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">¥</span>
                <input className="w-full h-10 pl-7 pr-4 bg-white text-gray-900 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f48c25]/50 font-medium font-display text-sm" placeholder="0.00" type="number"/>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 pl-1">* 請如實填寫申報價值，以免影響清關。</p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center gap-2 text-[#f48c25]">
            <span className="material-symbols-outlined text-[20px]">stars</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/80">增值服務</h2>
          </div>
          <div className="bg-[#1f1f1f]/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm grid grid-cols-1 gap-2">
            <label className="flex items-center justify-between p-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="bg-[#f48c25]/20 p-1.5 rounded-md text-[#f48c25] group-hover:bg-[#f48c25] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">package_2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">拆箱減重</p>
                  <p className="text-[10px] text-gray-400">去除多餘包裝盒</p>
                </div>
              </div>
              <div className="relative flex items-center">
                <input className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-500 transition-all checked:border-[#f48c25] checked:bg-[#f48c25] hover:border-[#f48c25] focus:outline-none focus:ring-0" type="checkbox"/>
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 material-symbols-outlined text-xs font-bold pointer-events-none">check</span>
              </div>
            </label>
            <label className="flex items-center justify-between p-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="bg-[#f48c25]/20 p-1.5 rounded-md text-[#f48c25] group-hover:bg-[#f48c25] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">拍照驗貨</p>
                  <p className="text-[10px] text-gray-400">開箱拍照確認物品</p>
                </div>
              </div>
              <div className="relative flex items-center">
                <input className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-500 transition-all checked:border-[#f48c25] checked:bg-[#f48c25] hover:border-[#f48c25] focus:outline-none focus:ring-0" type="checkbox"/>
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 material-symbols-outlined text-xs font-bold pointer-events-none">check</span>
              </div>
            </label>
          </div>
        </section>

        <div className="pt-2">
          <button className="w-full bg-[#f48c25] hover:bg-[#d9771e] text-white font-bold text-base h-12 rounded-full shadow-[0_0_20px_rgba(244,140,37,0.3)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
            <span>提交預報</span>
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
          <p className="text-center text-[10px] text-gray-500 mt-3">點擊提交即代表您同意 <a className="text-[#f48c25] hover:underline" href="#">服務條款</a> 及 <a className="text-[#f48c25] hover:underline" href="#">禁運品聲明</a></p>
        </div>
      </main>
    </div>
  );
}
