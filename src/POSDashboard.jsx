import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Bell, 
  User, 
  MapPin, 
  Phone, 
  ChevronRight,
  RefreshCcw,
  ExternalLink,
  Navigation,
  LogOut,
  Settings,
  Radar,
  FileDown,
  X,
  Calendar,
  Hash,
  Truck,
} from 'lucide-react';
import DeliveryTrackingMap from './components/DeliveryTrackingMap';
import Logo from './components/Logo';
import { Link } from 'react-router-dom';
import { useSocket } from './context/SocketContext';
import { useAuth } from './context/AuthContext';
import api from './config/api';
import toast from 'react-hot-toast';
import { getRouteDistanceAndEta } from './utils/osrm';

const POSDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [deliveryTracking, setDeliveryTracking] = useState(null);
  const [loadingDeliveryTracking, setLoadingDeliveryTracking] = useState(false);
  const [deliveryRouteStats, setDeliveryRouteStats] = useState(null);
  const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0 });
  const socket = useSocket();
  const { logout, user } = useAuth();
  const printRef = useRef();

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:6008/api';
  const serverBase = apiBase.replace(/\/api\/?$/, '');
  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
    return `${serverBase}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Join print center room to receive assigned orders
  useEffect(() => {
    if (socket && user?.printCenterId) {
      socket.emit('join_print_center', { printCenterId: user.printCenterId });
    }
  }, [socket, user?.printCenterId]);

  useEffect(() => {
    if (socket) {
      socket.on('print_order_assigned', (assignment) => {
        toast.success('طلب طباعة جديد مُعيَّن لك!', { icon: '🖨️', duration: 5000 });
        setAssignments(prev => [assignment, ...prev]);
      });

      socket.on('print_order_status_updated', (updated) => {
        setAssignments(prev => prev.map(a => a.id === updated.id ? updated : a));
      });

      return () => {
        socket.off('print_order_assigned');
        socket.off('print_order_status_updated');
      };
    }
  }, [socket]);

  // Live delivery location: join order room when viewing delivery tracking
  useEffect(() => {
    if (!socket || !deliveryTracking?.hasDelivery || !deliveryTracking?.order?.id) return;
    const orderId = deliveryTracking.order.id;
    socket.emit('track_order', { orderId });
    const onLocation = (data) => {
      setDeliveryTracking(prev => prev && prev.order?.id === orderId
        ? { ...prev, deliveryLatestLocation: { latitude: data.latitude, longitude: data.longitude, address: data.address, createdAt: data.timestamp } }
        : prev);
    };
    socket.on('location_updated', onLocation);
    return () => {
      socket.emit('untrack_order', { orderId });
      socket.off('location_updated', onLocation);
    };
  }, [socket, deliveryTracking?.order?.id, deliveryTracking?.hasDelivery]);

  // OSRM: المسافة والوقت المتوقع بين الدليفري ووجهة الطلب (تتبع الدليفري)
  useEffect(() => {
    if (!deliveryTracking?.deliveryLatestLocation || deliveryTracking?.order?.latitude == null || deliveryTracking?.order?.longitude == null) {
      setDeliveryRouteStats(null);
      return;
    }
    const from = {
      lat: deliveryTracking.deliveryLatestLocation.latitude,
      lng: deliveryTracking.deliveryLatestLocation.longitude,
    };
    const to = {
      lat: deliveryTracking.order.latitude,
      lng: deliveryTracking.order.longitude,
    };
    let cancelled = false;
    getRouteDistanceAndEta(from, to).then((stats) => {
      if (!cancelled && stats) setDeliveryRouteStats(stats);
    });
    return () => { cancelled = true; };
  }, [
    deliveryTracking?.deliveryLatestLocation?.latitude,
    deliveryTracking?.deliveryLatestLocation?.longitude,
    deliveryTracking?.order?.latitude,
    deliveryTracking?.order?.longitude,
  ]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/print-order-assignments?limit=100');
      const data = response.data.data ?? response.data;
      const list = Array.isArray(data) ? data : [];
      setAssignments(list);
      updateStats(list);
    } catch (error) {
      toast.error('فشل في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (currentAssignments) => {
    const list = Array.isArray(currentAssignments) ? currentAssignments : [];
    setStats({
      pending: list.filter(a => a.status === 'PENDING' || a.status === 'ACCEPTED').length,
      processing: list.filter(a => a.status === 'PRINTING').length,
      completed: list.filter(a => a.status === 'COMPLETED').length,
    });
  };

  const updateAssignmentStatus = async (assignmentId, newStatus) => {
    try {
      await api.patch(`/print-order-assignments/${assignmentId}/status`, { status: newStatus });
      toast.success('تم تحديث الحالة');
      fetchAssignments();
    } catch (error) {
      toast.error('فشل في تحديث الحالة');
    }
  };

  const handlePrint = (order) => {
    setSelectedOrder(order);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const fetchDeliveryTracking = async () => {
    if (!selectedAssignment?.id) return;
    try {
      setLoadingDeliveryTracking(true);
      setDeliveryTracking(null);
      const res = await api.get(`/print-order-assignments/${selectedAssignment.id}/delivery-tracking`);
      setDeliveryTracking(res.data.data ?? res.data);
    } catch (err) {
      toast.error('فشل في تحميل تتبع الدليفري');
      setDeliveryTracking({ hasDelivery: false });
    } finally {
      setLoadingDeliveryTracking(false);
    }
  };

  const filteredAssignments = assignments.filter(a => 
    a.order?.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.order?.user?.phone?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen pb-20">
      {/* POS Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-4 md:px-8 shadow-sm no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Logo linkToHome={true} size="default" />
            <div className="hidden sm:block border-r border-slate-200 h-8" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-slate-900 leading-tight">نقطة الطباعة</h1>
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-wider">{user?.name || 'لوحة التحكم'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="بحث برقم الطلب أو الهاتف..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-3 pr-12 text-sm font-bold focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>
            <Link to="/profile" className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all" title="البروفايل">
              <User size={20} />
            </Link>
            <Link to="/tracking" className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all" title="تتبع الطلبات">
              <Radar size={20} />
            </Link>
            <Link to="/settings" className="p-3 bg-purple-50 text-purple-600 rounded-2xl hover:bg-purple-100 transition-all" title="إعدادات الطباعة">
              <Settings size={20} />
            </Link>
            <button onClick={fetchAssignments} className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all">
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={logout} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 no-print">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">بانتظار الطباعة</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">قيد التنفيذ</p>
            <p className="text-3xl font-black text-teal-600 tracking-tighter">{stats.processing}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي اليوم</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{assignments.length}</p>
          </div>
          <div className="bg-teal-600 p-6 rounded-3xl shadow-lg shadow-teal-600/20 text-white">
            <p className="text-[10px] font-black text-teal-100 uppercase tracking-widest mb-1">حالة المركز</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-200 animate-ping"></div>
              <p className="text-xl font-black uppercase">نشط الآن</p>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="pos-grid">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-3xl border border-slate-100 animate-pulse"></div>
            ))
          ) : filteredAssignments.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mb-6">
                <Package size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">لا توجد طلبات طباعة</h3>
              <p className="text-sm font-medium text-slate-400">ستظهر الطلبات الجديدة هنا فور استلامها</p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const order = assignment.order;
              if (!order) return null;
              const statusLabels = { PENDING: 'قيد الانتظار', ACCEPTED: 'مقبول', PRINTING: 'قيد الطباعة', READY_FOR_PICKUP: 'جاهز للاستلام', COMPLETED: 'منتهي', CANCELLED: 'ملغى' };
              return (
              <div key={assignment.id} className="card-pos group">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">#{order.id?.slice(0, 8)}</span>
                      <h4 className="font-black text-slate-900 tracking-tight text-lg leading-tight uppercase">
                        {order.user?.name || order.user?.phone || 'عميل'}
                      </h4>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${
                      assignment.status === 'PENDING' ? 'bg-orange-50 text-orange-600' :
                      assignment.status === 'ACCEPTED' || assignment.status === 'PRINTING' ? 'bg-blue-50 text-blue-600' :
                      assignment.status === 'READY_FOR_PICKUP' ? 'bg-amber-50 text-amber-600' :
                      assignment.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {statusLabels[assignment.status] || assignment.status}
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                          <Clock size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 leading-none mb-1 line-clamp-1">{item.reference?.title || item.reference?.name || 'عنصر طباعة'}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{item.quantity} نسخة</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex flex-col gap-2 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={12} />
                      <span className="text-[10px] font-bold truncate">{order.address || 'استلام من المركز'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone size={12} />
                      <span className="text-[10px] font-bold">{order.user?.phone || 'بدون رقم'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 flex gap-2 flex-wrap">
                  <button 
                    onClick={() => setSelectedAssignment(assignment)}
                    className="flex-1 min-w-[120px] py-3 bg-slate-100 border border-slate-200 hover:border-teal-500 hover:text-teal-600 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Package size={14} />
                    تفاصيل الطلب
                  </button>
                  <button 
                    onClick={() => handlePrint(order)}
                    className="flex-1 min-w-[120px] py-3 bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Printer size={14} />
                    طباعة فاتورة
                  </button>
                  {assignment.status === 'PENDING' && (
                    <button 
                      onClick={() => updateAssignmentStatus(assignment.id, 'ACCEPTED')}
                      className="flex-1 min-w-[120px] py-3 bg-teal-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20"
                    >
                      قبول الطلب
                    </button>
                  )}
                  {assignment.status === 'ACCEPTED' && (
                    <button 
                      onClick={() => updateAssignmentStatus(assignment.id, 'PRINTING')}
                      className="flex-1 min-w-[120px] py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
                    >
                      بدء الطباعة
                    </button>
                  )}
                  {assignment.status === 'PRINTING' && (
                    <button 
                      onClick={() => updateAssignmentStatus(assignment.id, 'READY_FOR_PICKUP')}
                      className="flex-1 min-w-[120px] py-3 bg-amber-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-700 transition-all shadow-md shadow-amber-600/20"
                    >
                      جاهز للاستلام
                    </button>
                  )}
                  {assignment.status === 'READY_FOR_PICKUP' && (
                    <button 
                      onClick={() => updateAssignmentStatus(assignment.id, 'COMPLETED')}
                      className="flex-1 min-w-[120px] py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
                    >
                      تم التسليم
                    </button>
                  )}
                </div>
              </div>
            ); })
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 no-print" onClick={() => { setSelectedAssignment(null); setDeliveryTracking(null); }}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">تفاصيل الطلب</h2>
              <button onClick={() => { setSelectedAssignment(null); setDeliveryTracking(null); }} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              {selectedAssignment.order && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                      <Hash size={18} className="text-teal-600" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">رقم الطلب</p>
                        <p className="font-black text-slate-900">#{selectedAssignment.order.id?.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                      <Calendar size={18} className="text-teal-600" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">الحالة</p>
                        <p className="font-black text-slate-900">
                          {selectedAssignment.status === 'PENDING' ? 'قيد الانتظار' : selectedAssignment.status === 'ACCEPTED' ? 'مقبول' : selectedAssignment.status === 'PRINTING' ? 'قيد الطباعة' : selectedAssignment.status === 'READY_FOR_PICKUP' ? 'جاهز للاستلام' : selectedAssignment.status === 'COMPLETED' ? 'منتهي' : selectedAssignment.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-slate-900 uppercase">العميل</h3>
                    <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-slate-400" />
                        <span className="font-bold text-slate-900">{selectedAssignment.order.user?.student?.name || selectedAssignment.order.user?.phone || 'عميل'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-600">{selectedAssignment.order.user?.phone || '—'}</span>
                      </div>
                      {selectedAssignment.order.user?.email && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-600">{selectedAssignment.order.user.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-600">{selectedAssignment.order.address || 'استلام من المركز'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-slate-900 uppercase">عناصر الطلب</h3>
                    <div className="space-y-3">
                      {selectedAssignment.order.items?.map((item, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-black text-slate-900">{item.reference?.title || 'عنصر طباعة'}</p>
                            <p className="text-sm text-slate-500">{item.quantity} نسخة × {item.price} جنيه</p>
                            <p className="text-sm font-bold text-teal-600">الإجمالي: {item.quantity * item.price} جنيه</p>
                          </div>
                          {item.reference?.fileUrl ? (
                            <a
                              href={getFileUrl(item.reference.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 shrink-0"
                            >
                              <FileDown size={18} />
                              تنزيل للطباعة
                            </a>
                          ) : (
                            <span className="text-sm text-slate-400 font-bold shrink-0">— لا يوجد ملف مرفق</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 flex justify-between items-center">
                    <span className="font-black text-slate-900">إجمالي الطلب</span>
                    <span className="text-xl font-black text-teal-600">{selectedAssignment.order.total} جنيه</span>
                  </div>

                  {/* تتبع الدليفري على الخريطة */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-slate-900 uppercase">تتبع الدليفري</h3>
                    {deliveryTracking === null ? (
                      <button
                        type="button"
                        onClick={fetchDeliveryTracking}
                        disabled={loadingDeliveryTracking}
                        className="w-full py-4 px-4 bg-amber-50 border border-amber-200 rounded-2xl font-black text-amber-700 flex items-center justify-center gap-3 hover:bg-amber-100 transition-all disabled:opacity-50"
                      >
                        {loadingDeliveryTracking ? (
                          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Truck size={22} />
                        )}
                        عرض موقع الدليفري على الخريطة
                      </button>
                    ) : deliveryTracking.hasDelivery ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                          <p className="font-black text-slate-900">الدليفري: {deliveryTracking.delivery?.name}</p>
                          <p className="text-sm font-bold text-slate-600">هاتف: {deliveryTracking.delivery?.phone}</p>
                          <p className="text-xs text-slate-500">الحالة: {deliveryTracking.deliveryAssignment?.status}</p>
                        </div>
                        {deliveryRouteStats && (
                          <div className="grid grid-cols-2 gap-3 p-4 bg-white rounded-2xl border border-slate-200">
                            <div>
                              <p className="text-[10px] font-black uppercase text-teal-600 tracking-widest mb-0.5">المسافة</p>
                              <p className="font-black text-slate-900">{deliveryRouteStats.distanceKm} كم</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-teal-600 tracking-widest mb-0.5">الوصول خلال</p>
                              <p className="font-black text-slate-900">{deliveryRouteStats.estimatedMinutes} دقيقة</p>
                            </div>
                            <p className="col-span-2 text-[10px] font-bold text-slate-500">
                              وقت الوصول تقريباً: {new Date(deliveryRouteStats.eta).toLocaleTimeString('ar-EG')}
                            </p>
                          </div>
                        )}
                        <DeliveryTrackingMap
                          order={deliveryTracking.order}
                          printCenter={deliveryTracking.printCenter}
                          deliveryLatestLocation={deliveryTracking.deliveryLatestLocation}
                          delivery={deliveryTracking.delivery}
                        />
                        <p className="text-xs text-slate-400 text-center">
                          الأخضر: موقع الدليفري — الأصفر: العميل — التركواز: نقطة الطباعة
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                        <Truck size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-slate-600">لم يُعيَّن دليفري لهذا الطلب بعد</p>
                        <p className="text-sm text-slate-400 mt-1">سيظهر موقع الدليفري هنا بعد تعيينه</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Mobile Nav */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex justify-around items-center no-print md:hidden z-40 shadow-2xl">
        <button onClick={() => fetchAssignments()} className="flex flex-col items-center gap-1 text-teal-600">
          <div className="p-2 bg-teal-50 rounded-xl"><Package size={20} /></div>
          <span className="text-[10px] font-black uppercase">الطلبات</span>
        </button>
        <Link to="/profile" className="flex flex-col items-center gap-1 text-slate-600">
          <div className="p-2 bg-slate-100 rounded-xl"><User size={20} /></div>
          <span className="text-[10px] font-black uppercase">البروفايل</span>
        </Link>
        <Link to="/tracking" className="flex flex-col items-center gap-1 text-blue-600">
          <div className="p-2 bg-blue-50 rounded-xl"><Radar size={20} /></div>
          <span className="text-[10px] font-black uppercase">التتبع</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center gap-1 text-purple-600">
          <div className="p-2 bg-purple-50 rounded-xl"><Settings size={20} /></div>
          <span className="text-[10px] font-black uppercase">الإعدادات</span>
        </Link>
      </footer>

      {/* Hidden Thermal Receipt for Printing */}
      <div className="hidden print:block thermal-receipt">
        <div className="text-center mb-6 space-y-2 border-b-2 border-dashed border-black pb-4">
          <h1 className="text-2xl font-bold uppercase">STUDIFY</h1>
          <p className="text-sm font-bold uppercase tracking-widest">PRINT CENTER RECEIPT</p>
          <p className="text-xs">{new Date().toLocaleString('ar-EG')}</p>
        </div>

        {selectedOrder && (
          <>
            <div className="mb-6 space-y-1 border-b-2 border-dashed border-black pb-4">
              <p className="font-bold uppercase">Order: #{selectedOrder.id.slice(0, 8)}</p>
              <p className="font-bold">Client: {selectedOrder.user?.name || 'External'}</p>
              <p className="font-bold">Phone: {selectedOrder.user?.phone}</p>
              <p className="text-xs">Address: {selectedOrder.address || 'Pickup'}</p>
            </div>

            <div className="mb-6 space-y-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-right py-2">Item Description</th>
                    <th className="text-left py-2">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, i) => (
                    <tr key={i} className="border-b border-dashed border-slate-300">
                      <td className="py-2 font-bold">{item.reference?.title || item.reference?.name || 'Printing Job'}</td>
                      <td className="py-2 text-left">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right space-y-1 mb-8 pt-2 border-t-2 border-black">
              <p className="text-lg font-bold">TOTAL: {selectedOrder.total} EGP</p>
              <p className="text-xs">Paid via: Online Payment</p>
            </div>

            <div className="text-center pt-4 space-y-2">
              <div className="flex justify-center mb-2">
                <div className="w-24 h-24 border-2 border-black flex items-center justify-center text-[10px] font-bold p-2 text-center uppercase">
                  Scan to Track Order
                </div>
              </div>
              <p className="text-xs font-bold uppercase">Thank you for choosing Studify!</p>
              <p className="text-[10px]">Production Node: PRT-SYS-01</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default POSDashboard;
