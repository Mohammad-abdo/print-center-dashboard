import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle2, Printer, MapPin, Phone, User } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PrintPageHeader from '../components/PrintPageHeader';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchOrder = async () => {
    const id = orderId.trim().replace(/^#+/, '').trim();
    if (!id) {
      toast.error('أدخل رقم الطلب');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/print-order-assignments/track/${encodeURIComponent(id)}`);
      setAssignment(response.data.data);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('لم يتم العثور على طلب طباعة بهذا الرقم');
      } else {
        toast.error('خطأ في البحث عن الطلب');
      }
      setAssignment(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: { label: 'قيد الانتظار', color: 'orange', icon: Clock },
      ACCEPTED: { label: 'مقبول', color: 'blue', icon: CheckCircle2 },
      PRINTING: { label: 'قيد الطباعة', color: 'indigo', icon: Printer },
      READY_FOR_PICKUP: { label: 'جاهز للاستلام', color: 'amber', icon: Package },
      COMPLETED: { label: 'منتهي', color: 'emerald', icon: CheckCircle2 },
      CANCELLED: { label: 'ملغى', color: 'red', icon: Clock },
    };
    return statusMap[status] || { label: status, color: 'gray', icon: Clock };
  };

  const statusInfo = assignment ? getStatusInfo(assignment.status) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <PrintPageHeader title="تتبع طلب الطباعة" subtitle="ادخل رقم الطلب لمعرفة حالة الطباعة والموقع" />
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">

        {/* Search */}
        <div className="card-premium p-8 bg-white">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="أدخل رقم الطلب (مثال: 940b0963 أو الرقم الكامل)"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-600/20 focus:bg-white rounded-2xl py-4 px-6 font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none"
                onKeyPress={(e) => e.key === 'Enter' && searchOrder()}
              />
            </div>
            <button
              onClick={searchOrder}
              disabled={loading}
              className="px-8 py-4 bg-teal-600 text-white font-black text-sm rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50 flex items-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={20} />
              )}
              بحث
            </button>
          </div>
        </div>

        {/* Results */}
        {assignment && (
          <div className="card-premium p-8 bg-white space-y-8">
            {/* Status Header */}
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-${statusInfo.color}-100 text-${statusInfo.color}-600 rounded-xl flex items-center justify-center`}>
                  <statusInfo.icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">حالة الطلب</h3>
                  <p className={`text-${statusInfo.color}-600 font-bold`}>{statusInfo.label}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-bold">رقم الطلب</p>
                <p className="font-black text-slate-900">#{assignment.order.id.slice(0, 8)}</p>
              </div>
            </div>

            {/* Order Details */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">تفاصيل الطلب</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-600">
                      {assignment.order.user?.phone || 'عميل'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-600">
                      {assignment.order.address || 'استلام من المركز'}
                      {assignment.order?.latitude != null && assignment.order?.longitude != null && (
                        <span className="block text-xs font-mono text-slate-400 mt-1">
                          الإحداثيات: {Number(assignment.order.latitude).toFixed(4)}, {Number(assignment.order.longitude).toFixed(4)}
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Package size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-600">
                      {assignment.order.items?.length || 0} عنصر للطباعة
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-wide">العناصر</h5>
                  {assignment.order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {item.referenceType} - {item.quantity} نسخة
                        </p>
                        <p className="text-xs text-slate-500">السعر: {item.price} جنيه</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">مركز الطباعة</h4>
                
                <div className="p-6 bg-teal-50 rounded-2xl border border-teal-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white">
                      <Printer size={24} />
                    </div>
                    <div>
                      <h5 className="font-black text-slate-900">{assignment.printCenter?.name}</h5>
                      <p className="text-sm text-slate-600">{assignment.printCenter?.location}</p>
                    </div>
                  </div>
                  
                  {assignment.printCenter?.address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin size={16} className="text-teal-600 mt-0.5" />
                      <span className="text-slate-700 font-medium">{assignment.printCenter.address}</span>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-wide">الجدول الزمني</h5>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">تم التعيين</p>
                        <p className="text-xs text-slate-500">
                          {new Date(assignment.assignedAt).toLocaleString('ar-EG')}
                        </p>
                      </div>
                    </div>
                    
                    {assignment.acceptedAt && (
                      <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">تم القبول</p>
                          <p className="text-xs text-slate-500">
                            {new Date(assignment.acceptedAt).toLocaleString('ar-EG')}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {assignment.completedAt && (
                      <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                        <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">تم الإنتهاء</p>
                          <p className="text-xs text-slate-500">
                            {new Date(assignment.completedAt).toLocaleString('ar-EG')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {assignment.notes && (
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <h5 className="text-sm font-black text-slate-900 mb-2">ملاحظات المركز</h5>
                <p className="text-slate-700">{assignment.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;