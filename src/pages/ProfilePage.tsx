import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="bg-[#0f1012] font-display text-white antialiased overflow-x-hidden min-h-full relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,140,37,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:30px_30px] opacity-20"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#f48c25]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[300px] h-[300px] bg-[#f48c25]/5 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-full max-w-md mx-auto">
        <header className="fixed top-0 left-0 right-0 mx-auto w-full max-w-md z-50 bg-[#0f1012]/80 backdrop-blur-md flex items-center justify-between px-6 h-[50px] border-b border-white/5">
          <div className="w-6"></div>
          <h1 className="text-lg font-bold tracking-wide">個人中心</h1>
          <button className="text-white/70 hover:text-[#f48c25] transition-colors relative">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#f48c25] rounded-full"></span>
          </button>
        </header>

        <div className="flex flex-col items-center mt-[60px] mb-6 px-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#f48c25]/50 to-[#f48c25]/10 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-24 h-24 rounded-full border-2 border-[#f48c25]/30 p-1 shadow-[0_0_20px_rgba(244,140,37,0.3)] bg-[#1a1c20] overflow-hidden">
              <img alt="User Avatar" className="w-full h-full rounded-full object-cover" src="https://picsum.photos/seed/user/200/200?blur=2" referrerPolicy="no-referrer"/>
            </div>
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#1a1c20] rounded-full flex items-center justify-center border border-[#1a1c20]">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="mt-3 text-xl font-bold text-white tracking-tight">王大明</h2>
          <div className="flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-[#f48c25]/10 border border-[#f48c25]/20">
            <span className="material-symbols-outlined text-[#f48c25] text-[12px]">stars</span>
            <span className="text-[10px] font-medium text-[#f48c25]">黃金會員</span>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="bg-[#1e2023]/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#f48c25]/10 flex items-center justify-center text-[#f48c25]">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">用戶名</span>
              </div>
              <span className="text-xs font-display text-white/90 tracking-wide">WangDaMing88</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#f48c25]/10 flex items-center justify-center text-[#f48c25]">
                  <span className="material-symbols-outlined text-[16px]">phone_iphone</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">手機號碼</span>
              </div>
              <span className="text-xs font-display text-white/90 tracking-wide">+886 912 345 678</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#f48c25]/10 flex items-center justify-center text-[#f48c25]">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">電子郵箱</span>
              </div>
              <span className="text-xs font-display text-white/90 tracking-wide truncate max-w-[150px]">wang@example.com</span>
            </div>
          </div>
        </div>

        <div className="px-4 flex-1">
          <div className="bg-[#1e2023]/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-lg">
            <a className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors group border-b border-white/5 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center group-hover:border-[#f48c25]/50 transition-colors">
                  <span className="material-symbols-outlined text-white/80 group-hover:text-[#f48c25] transition-colors text-[18px]">location_on</span>
                </div>
                <span className="text-sm font-medium text-white/90">地址管理</span>
              </div>
              <span className="material-symbols-outlined text-gray-600 group-hover:text-[#f48c25] group-hover:translate-x-1 transition-all text-[18px]">chevron_right</span>
            </a>
            <a className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors group border-b border-white/5 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center group-hover:border-[#f48c25]/50 transition-colors">
                  <span className="material-symbols-outlined text-white/80 group-hover:text-[#f48c25] transition-colors text-[18px]">settings</span>
                </div>
                <span className="text-sm font-medium text-white/90">設置</span>
              </div>
              <span className="material-symbols-outlined text-gray-600 group-hover:text-[#f48c25] group-hover:translate-x-1 transition-all text-[18px]">chevron_right</span>
            </a>
            <a className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center group-hover:border-[#f48c25]/50 transition-colors">
                  <span className="material-symbols-outlined text-white/80 group-hover:text-[#f48c25] transition-colors text-[18px]">support_agent</span>
                </div>
                <span className="text-sm font-medium text-white/90">在線客服</span>
              </div>
              <span className="material-symbols-outlined text-gray-600 group-hover:text-[#f48c25] group-hover:translate-x-1 transition-all text-[18px]">chevron_right</span>
            </a>
            <button onClick={() => {
              logout();
              navigate('/login');
            }} className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors group cursor-pointer border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center group-hover:border-red-500/50 transition-colors">
                  <span className="material-symbols-outlined text-white/80 group-hover:text-red-500 transition-colors text-[18px]">logout</span>
                </div>
                <span className="text-sm font-medium text-white/90 group-hover:text-red-500 transition-colors">退出登入</span>
              </div>
              <span className="material-symbols-outlined text-gray-600 group-hover:text-red-500 group-hover:translate-x-1 transition-all text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
