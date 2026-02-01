import React from 'react';
import { User, Phone, Mail, MapPin, Building2, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PrintPageHeader from '../components/PrintPageHeader';

const PrintProfile = () => {
  const { user } = useAuth();
  const center = Array.isArray(user?.printCenter) ? user.printCenter[0] : user?.printCenter;

  return (
    <div className="min-h-screen bg-slate-50">
      <PrintPageHeader title="البروفايل" subtitle="معلومات نقطة الطباعة" />

      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 bg-gradient-to-br from-teal-500 to-teal-700">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
                <Printer size={40} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">
                  {center?.name || user?.name || 'نقطة الطباعة'}
                </h2>
                <p className="text-teal-100 text-sm font-bold mt-1">
                  لوحة تحكم نظام الطباعة
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">معلومات الحساب</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase">الاسم</p>
                    <p className="font-bold text-slate-900">{center?.name || user?.name || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase">رقم الهاتف</p>
                    <p className="font-bold text-slate-900">{user?.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase">البريد الإلكتروني</p>
                    <p className="font-bold text-slate-900">{user?.email || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">معلومات نقطة الطباعة</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase">الموقع / المبنى</p>
                    <p className="font-bold text-slate-900">{center?.location || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase">العنوان</p>
                    <p className="font-bold text-slate-900">{center?.address || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintProfile;
