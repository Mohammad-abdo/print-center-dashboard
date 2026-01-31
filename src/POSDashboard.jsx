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
  LogOut
} from 'lucide-react';
import { useSocket } from './context/SocketContext';
import { useAuth } from './context/AuthContext';
import api from './config/api';
import toast from 'react-hot-toast';

const POSDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0 });
  const socket = useSocket();
  const { logout, user } = useAuth();
  const printRef = useRef();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_order', (order) => {
        if (order.orderType === 'PRINT' || order.items?.some(i => i.referenceType === 'PRINT_OPTION')) {
          toast.success('طلب طباعة جديد وصل!', { icon: '🖨️', duration: 5000 });
          setOrders(prev => [order, ...prev]);
        }
      });

      socket.on('order_updated', (updatedOrder) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      });

      return () => {
        socket.off('new_order');
        socket.off('order_updated');
      };
    }
  }, [socket]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      const data = response.data.data || response.data;
      
      const printOrders = data.filter(o => 
        o.orderType === 'PRINT' || 
        o.orderType === 'CONTENT' || 
        o.items?.some(i => i.referenceType === 'PRINT_OPTION')
      );
      
      setOrders(printOrders);
      updateStats(printOrders);
    } catch (error) {
      toast.error('فشل في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (currentOrders) => {
    setStats({
      pending: currentOrders.filter(o => o.status === 'PAID').length,
      processing: currentOrders.filter(o => o.status === 'PROCESSING').length,
      completed: currentOrders.filter(o => o.status === 'DELIVERED').length,
    });
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`تم تحديث الحالة إلى ${newStatus}`);
      fetchOrders();
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

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.user?.phone?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen pb-20">
      {/* POS Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-4 md:px-8 shadow-sm no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-600/30">
              <Printer size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight tracking-tight uppercase">Studify Print Center</h1>
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">{user?.name || 'Live Production Terminal'}</p>
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
            <button onClick={fetchOrders} className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all">
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
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{orders.length}</p>
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
          ) : filteredOrders.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mb-6">
                <Package size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">لا توجد طلبات طباعة</h3>
              <p className="text-sm font-medium text-slate-400">ستظهر الطلبات الجديدة هنا فور استلامها</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="card-pos group">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">#{order.id.slice(0, 8)}</span>
                      <h4 className="font-black text-slate-900 tracking-tight text-lg leading-tight uppercase">
                        {order.user?.name || 'عميل خارجي'}
                      </h4>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${
                      order.status === 'PAID' ? 'bg-orange-50 text-orange-600' :
                      order.status === 'PROCESSING' ? 'bg-blue-50 text-blue-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {order.status}
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

                <div className="p-4 bg-slate-50 flex gap-2">
                  <button 
                    onClick={() => handlePrint(order)}
                    className="flex-1 py-3 bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Printer size={14} />
                    طباعة فاتورة
                  </button>
                  {order.status === 'PAID' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'PROCESSING')}
                      className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20"
                    >
                      بدء الطباعة
                    </button>
                  )}
                  {order.status === 'PROCESSING' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'SHIPPED')}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
                    >
                      جاهز للتسليم
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer Mobile Nav */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex justify-around items-center no-print md:hidden z-40 shadow-2xl">
        <button onClick={() => fetchOrders()} className="flex flex-col items-center gap-1 text-teal-600">
          <div className="p-2 bg-teal-50 rounded-xl"><Package size={20} /></div>
          <span className="text-[10px] font-black uppercase">الطلبات</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <div className="p-2 bg-slate-50 rounded-xl"><CheckCircle2 size={20} /></div>
          <span className="text-[10px] font-black uppercase">المنتهية</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <div className="p-2 bg-slate-50 rounded-xl"><Navigation size={20} /></div>
          <span className="text-[10px] font-black uppercase">تتبع</span>
        </button>
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
