import { Link } from 'react-router-dom';

export default function HomePage() {
  const recipient = "陳小明 (TW8839)";
  const phone = "13800138000";
  const address = "福建省福州市馬尾區亭江鎮長安工業區長興路21號 (TW8839)";

  const handleCopy = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      alert(`${label}已複製`);
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('複製失敗，請手動複製');
    }
  };

  const handleCopyAll = () => {
    const allText = `收件人: ${recipient}\n聯繫電話: ${phone}\n收貨地址: ${address}`;
    handleCopy(allText, "倉庫地址");
  };

  return (
    <div className="bg-[#0f1012] text-white font-display min-h-full relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_0%,#2a2a2a_0%,#121212_100%)]"></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-50 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="relative z-10 flex flex-col flex-1 max-w-md mx-auto w-full">
        <header className="fixed top-0 left-0 right-0 mx-auto w-full max-w-md z-50 bg-[#0f1012]/80 backdrop-blur-md flex items-center justify-between px-5 h-[50px] border-b border-white/5">
          <h1 className="text-xl font-bold tracking-tight text-white">首頁</h1>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-white">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#f48c25] rounded-full ring-2 ring-[#121212]"></span>
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-white">support_agent</span>
            </button>
          </div>
        </header>

        <div className="px-5 mb-6 mt-[60px]">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#f48c25] to-orange-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-white rounded-xl h-12 px-4 shadow-lg border border-white/5">
              <span className="material-symbols-outlined text-gray-500 mr-3">search</span>
              <input className="w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-500 text-sm font-medium h-full p-0 outline-none" placeholder="運單號查詢" type="text"/>
            </div>
          </div>
        </div>

        <div className="px-5 flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white">倉庫地址</h3>
            <button 
              onClick={handleCopyAll}
              className="flex items-center gap-1 bg-[#1E1E1E]/50 hover:bg-[#1E1E1E] border border-white/10 rounded-lg px-2 py-1 transition-all duration-200 group cursor-pointer"
            >
              <span className="material-symbols-outlined text-[#f48c25] text-[12px] group-hover:scale-110 transition-transform">content_copy</span>
              <span className="text-[10px] text-[#f48c25] font-medium">一鍵複製</span>
            </button>
          </div>
          <div className="bg-[#1E1E1E] rounded-2xl p-4 border border-white/5 space-y-3 shadow-lg">
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => handleCopy(recipient, "收件人")}
                className="bg-white p-3 rounded-xl border border-white/5 hover:border-[#f48c25]/30 transition-colors group cursor-pointer relative active:scale-95 duration-200"
              >
                <p className="text-[10px] text-gray-500 mb-1">收件人</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium text-gray-900 truncate">{recipient}</p>
                  <span className="material-symbols-outlined text-gray-400 text-[14px] group-hover:text-[#f48c25] transition-colors">content_copy</span>
                </div>
              </div>
              <div 
                onClick={() => handleCopy(phone, "聯繫電話")}
                className="bg-white p-3 rounded-xl border border-white/5 hover:border-[#f48c25]/30 transition-colors group cursor-pointer relative active:scale-95 duration-200"
              >
                <p className="text-[10px] text-gray-500 mb-1">聯繫電話</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium text-gray-900">{phone}</p>
                  <span className="material-symbols-outlined text-gray-400 text-[14px] group-hover:text-[#f48c25] transition-colors">content_copy</span>
                </div>
              </div>
            </div>
            <div 
              onClick={() => handleCopy(address, "收貨地址")}
              className="bg-white p-3 rounded-xl border border-white/5 hover:border-[#f48c25]/30 transition-colors group cursor-pointer relative active:scale-95 duration-200"
            >
              <p className="text-[10px] text-gray-500 mb-1">收貨地址</p>
              <div className="flex justify-between items-start gap-2">
                <p className="text-xs font-medium text-gray-900 leading-relaxed">{address}</p>
                <span className="material-symbols-outlined text-gray-400 text-[14px] mt-1 group-hover:text-[#f48c25] transition-colors">content_copy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
