import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Printer, Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      return toast.error('يرجى إدخال الهاتف وكلمة المرور');
    }

    try {
      setIsSubmitting(true);
      const result = await login(phone, password);
      
      if (result.success) {
        toast.success('تم تسجيل الدخول بنجاح');
        navigate('/');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="p-8 md:p-12 space-y-8">
          {/* Logo & Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-teal-600 rounded-[30px] flex items-center justify-center text-white shadow-xl shadow-teal-600/30 mx-auto rotate-3">
              <Printer size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">مركز الطباعة</h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Studify Production Terminal</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-4">رقم الهاتف</label>
              <div className="relative group">
                <Phone size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-600 transition-colors" />
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+20xxxxxxxxx"
                  dir="ltr"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-600/20 focus:bg-white rounded-[24px] py-5 pr-14 pl-6 font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-4">كلمة المرور</label>
              <div className="relative group">
                <Lock size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-600 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-600/20 focus:bg-white rounded-[24px] py-5 pr-14 pl-14 font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-teal-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-6 rounded-[24px] shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                'تسجيل الدخول للنظام'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
            © 2026 Studify Enterprise
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
