import { useState } from "react";
import { KeyRound, LoaderPinwheel, PcCase, Phone, User } from "lucide-react";

function LoginPage({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [serverIp, setServerIp] = useState("");
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState(""); // ← جدید
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleGetCode = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !serverIp.trim() || !displayName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`https://${serverIp}:3000/api/generate-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (res.ok) {
        alert(`کد شما: ${data.code}`);
        setStep(2);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("خطا در اتصال");
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`https://${serverIp}:3000/api/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, username: displayName }), // ← اسم رو می‌فرسته
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("username", data.username);
        localStorage.setItem("serverIp", serverIp);
        localStorage.setItem("phone", phone);
        onLogin({ username: data.username, serverIp });
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("خطا در اتصال");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-dvh bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <form
        onSubmit={step === 1 ? handleGetCode : handleVerifyCode}
        className="bg-gray-900 p-8 rounded-2xl shadow-lg space-y-5 w-full max-w-sm border border-gray-700"
      >
        <h2 className="text-2xl font-bold text-center text-blue-400">
          {step === 1 ? "ورود" : "تأیید کد"}
        </h2>

        {/* Server IP */}
        <div
          className={`relative ${step === 2 ? "opacity-50 pointer-events-none" : ""}`}
        >
          <PcCase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="سرور IP (e.g. 192.168.1.10)"
            className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={serverIp}
            onChange={(e) => setServerIp(e.target.value)}
            disabled={step === 2}
          />
        </div>

        {step === 1 ? (
          <>
            {/* اسم کاربر */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="اسم شما"
                className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            {/* شماره موبایل */}
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="شماره موبایل (مثلاً 09123456789)"
                className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={11}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-bold flex justify-center items-center"
            >
              {loading ? (
                <LoaderPinwheel className="animate-spin" />
              ) : (
                "دریافت کد"
              )}
            </button>
          </>
        ) : (
          <>
            {/* کد تأیید */}
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="کد ۴ رقمی"
                className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={4}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-bold flex justify-center items-center"
            >
              {loading ? (
                <LoaderPinwheel className="animate-spin" />
              ) : (
                "تأیید و ورود"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-gray-400 hover:text-white text-sm transition"
            >
              ← بازگشت
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default LoginPage;
