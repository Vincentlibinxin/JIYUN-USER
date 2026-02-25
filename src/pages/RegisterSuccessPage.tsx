import { useNavigate } from 'react-router-dom';

export default function RegisterSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-black font-display text-slate-100 antialiased h-screen flex flex-col items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] to-[#020617]"></div>
      <div className="absolute inset-0 opacity-30 bg-[size:60px_60px] bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(circle_at_center,black_30%,transparent_80%)]"></div>
      
      {/* Glowing dots */}
      <div className="absolute w-1 h-1 bg-[#f48c25] rounded-full shadow-[0_0_6px_1px_rgba(244,140,37,0.5)] top-[20%] left-[15%] animate-pulse"></div>
      <div className="absolute w-1 h-1 bg-[#f48c25] rounded-full shadow-[0_0_6px_1px_rgba(244,140,37,0.5)] top-[80%] right-[20%] animate-pulse delay-700"></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-md px-8">
        <div className="relative mb-10">
          <div className="absolute inset-[-24px] border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-[-20px] border border-orange-500/10 rounded-full animate-pulse"></div>
          <div className="absolute inset-[-10px] border border-orange-500/20 rounded-full"></div>
          <div className="absolute inset-0 bg-[#f48c25]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 w-24 h-24 bg-[#111] rounded-full flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#f48c25]/20 via-transparent to-transparent opacity-60"></div>
            <span className="material-symbols-outlined text-[#f48c25] text-5xl drop-shadow-[0_0_15px_rgba(244,140,37,0.5)]">check_circle</span>
          </div>
        </div>

        <div className="space-y-3 mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
            註冊成功！
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-[280px] mx-auto font-medium opacity-90">
            歡迎加入榕台海峽快運，開啟您的跨境物流之旅。
          </p>
        </div>

        <div className="w-full space-y-3">
          <button 
            onClick={() => navigate('/home')}
            className="w-full bg-gradient-to-r from-[#f48c25] to-orange-600 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(244,140,37,0.2)] active:scale-[0.98] border border-white/10 relative overflow-hidden group"
          >
            <span className="relative">立即開啟我的物流之旅</span>
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="w-full bg-slate-900/40 hover:bg-slate-800/60 backdrop-blur-md text-slate-300 font-medium py-3.5 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-200"
          >
            完善個人資料
          </button>
          <div className="pt-4 text-center">
            <button onClick={() => navigate('/login')} className="text-slate-500 hover:text-white transition-colors text-xs font-medium tracking-wide">
              返回登錄頁面
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
