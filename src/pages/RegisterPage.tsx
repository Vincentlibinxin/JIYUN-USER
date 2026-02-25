import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const validateUsername = (username: string): string | null => {
    if (username.length < 6) {
      return '用户名至少6个字符';
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return '用户名只能包含字母和数字';
    }
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!/^09\d{8}$/.test(phone)) {
      return '请输入10位手机号码（09开头）';
    }
    return null;
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return '密码至少8个字符';
    }
    if (!/[A-Z]/.test(pwd)) {
      return '密码必须包含至少一个大写字母';
    }
    if (!/[a-z]/.test(pwd)) {
      return '密码必须包含至少一个小写字母';
    }
    if (!/[0-9]/.test(pwd)) {
      return '密码必须包含至少一个数字';
    }
    return null;
  };

  const handleSendSMS = async () => {
    setError('');
    
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setSmsSending(true);
    try {
      await api.auth.sendSMS(phone);
      setSmsSent(true);
      setCountdown(60);
      
      // 倒计时
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('发送短信错误:', err);
      setError(err?.message || '发送验证码失败，请稍后重试');
    } finally {
      setSmsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    
    if (!verificationCode.trim()) {
      setError('请输入验证码');
      return;
    }

    try {
      await api.auth.verifyCode(phone, verificationCode);
      setCodeVerified(true);
      setError('');
    } catch (err: any) {
      console.error('验证码错误:', err);
      setError(err?.message || '验证码无效或已过期');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    if (!codeVerified) {
      setError('请先验证手机号码');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    
    try {
      await register(username, password, phone, email);
      navigate('/register-success');
    } catch (err: any) {
      console.error('注册错误:', err);
      // 处理不同类型的错误
      if (err?.message?.includes('用户名')) {
        setError(err.message);
      } else if (err?.message?.includes('密码')) {
        setError(err.message);
      } else if (err?.message?.includes('手机')) {
        setError(err.message);
      } else if (err?.message?.includes('验证')) {
        setError(err.message);
      } else {
        setError(err?.message || '注册失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0E14] text-slate-200 relative font-display overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-[250px] h-[250px] bg-orange-900/10 rounded-full blur-[60px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(244,140,37,0.05)_0%,transparent_40%)]"></div>
      </div>

      <main className="flex-1 px-6 py-8 relative z-10 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white tracking-tight">創建賬戶</h1>
          <p className="text-xs text-slate-400 mt-1">加入榕台海峽快運，開啟無縫跨境物流體驗</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#f48c25]"></span>
              用戶名
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f48c25] transition-colors z-10">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </span>
              <input 
                className="w-full pl-9 pr-4 py-3 bg-white text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-[#f48c25]/50 transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm" 
                placeholder="6位以上字母+數字" 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#f48c25]"></span>
              郵箱 <span className="text-[8px] text-slate-500">(選填)</span>
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f48c25] transition-colors z-10">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </span>
              <input 
                className="w-full pl-9 pr-4 py-3 bg-white text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-[#f48c25]/50 transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm" 
                placeholder="example@domain.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#f48c25]"></span>
              手機號碼
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f48c25] transition-colors z-10">
                  <span className="material-symbols-outlined text-[18px]">phone</span>
                </span>
                <input 
                  className="w-full pl-9 pr-4 py-3 bg-white text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-[#f48c25]/50 transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm" 
                  placeholder="09xxxxxxxx (10位手機號)" 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength="10"
                  disabled={codeVerified}
                />
              </div>
              <button
                type="button"
                onClick={handleSendSMS}
                disabled={smsSending || !phone || codeVerified || countdown > 0}
                className="px-3 py-3 bg-[#f48c25] text-white rounded-lg font-bold text-xs whitespace-nowrap hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {countdown > 0 ? `${countdown}秒` : smsSent ? '重新發送' : '發送驗證碼'}
              </button>
            </div>
          </div>

          {smsSent && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#f48c25]"></span>
                驗證碼
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f48c25] transition-colors z-10">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </span>
                  <input 
                    className="w-full pl-9 pr-4 py-3 bg-white text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-[#f48c25]/50 transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm" 
                    placeholder="請輸入6位驗證碼" 
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                    maxLength="6"
                    disabled={codeVerified}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={!verificationCode || codeVerified}
                  className="px-3 py-3 bg-green-500 text-white rounded-lg font-bold text-xs whitespace-nowrap hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {codeVerified ? '已驗證' : '驗證'}
                </button>
              </div>
              {codeVerified && (
                <div className="text-green-400 text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  手機號碼已驗證
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#f48c25]"></span>
              登錄密碼
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f48c25] transition-colors z-10">
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </span>
              <input 
                className="w-full pl-9 pr-4 py-3 bg-white text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-[#f48c25]/50 transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm" 
                placeholder="至少8位（含大小寫字母和數字）" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#f48c25]"></span>
              確認密碼
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f48c25] transition-colors z-10">
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </span>
              <input 
                className="w-full pl-9 pr-4 py-3 bg-white text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-[#f48c25]/50 transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm" 
                placeholder="請再次輸入您的密碼" 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="group w-full py-3.5 bg-gradient-to-r from-orange-500 to-[#f48c25] text-white text-sm font-bold rounded-xl shadow-[0_4px_20px_-4px_rgba(244,140,37,0.4)] hover:shadow-[0_6px_25px_-4px_rgba(244,140,37,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 tracking-widest">{loading ? '註冊中...' : '立即註冊'}</span>
              {!loading && <span className="material-symbols-outlined text-lg relative z-10 group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-[10px] text-slate-500">
              已有賬號？<button onClick={() => navigate('/login')} className="text-[#f48c25] font-bold hover:text-orange-400 transition-colors ml-1">立即登錄</button>
            </p>
          </div>
        </form>
      </main>

      <footer className="mt-auto pb-6 text-center px-6 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-4 opacity-30">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-400"></div>
          <div className="w-1 h-1 rounded-full bg-slate-500"></div>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-400"></div>
        </div>
        <div className="flex items-center justify-center gap-4 text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
            <span className="material-symbols-outlined text-[10px] text-[#f48c25]">verified_user</span> 安全加密
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
            <span className="material-symbols-outlined text-[10px] text-blue-400">language</span> 跨境直達
          </span>
        </div>
        <p className="text-[9px] text-slate-600 mt-3 uppercase tracking-wider font-medium font-mono">© RONGTAI STRAIT EXPRESS</p>
      </footer>
    </div>
  );
}
