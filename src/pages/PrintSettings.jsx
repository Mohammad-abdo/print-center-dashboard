import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Printer, 
  Palette, 
  FileText, 
  Copy, 
  RotateCcw, 
  Save, 
  Plus,
  Trash2,
  Edit3,
  Check,
  X
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PrintPageHeader from '../components/PrintPageHeader';

const PrintSettings = () => {
  const [printOptions, setPrintOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [newOption, setNewOption] = useState({
    colorType: 'BLACK_WHITE',
    paperType: 'A4',
    doubleSide: false,
    copies: 1,
    bookId: null,
  });

  // Available options
  const colorTypes = [
    { value: 'BLACK_WHITE', label: 'أبيض وأسود', icon: '⚫' },
    { value: 'COLOR', label: 'ملون', icon: '🌈' },
  ];

  const paperTypes = [
    { value: 'A4', label: 'A4 (21×29.7 سم)', icon: '📄' },
    { value: 'A3', label: 'A3 (29.7×42 سم)', icon: '📃' },
    { value: 'A5', label: 'A5 (14.8×21 سم)', icon: '🗒️' },
    { value: 'LETTER', label: 'Letter (21.6×27.9 سم)', icon: '📋' },
  ];

  useEffect(() => {
    fetchPrintOptions();
  }, []);

  const fetchPrintOptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/print-options');
      setPrintOptions(response.data.data || []);
    } catch (error) {
      toast.error('خطأ في تحميل إعدادات الطباعة');
      console.error('Error fetching print options:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPrintOption = async () => {
    try {
      setSaving(true);
      const response = await api.post('/print-options', newOption);
      setPrintOptions([...printOptions, response.data.data]);
      setNewOption({
        colorType: 'BLACK_WHITE',
        paperType: 'A4',
        doubleSide: false,
        copies: 1,
        bookId: null,
      });
      toast.success('تم إضافة إعداد الطباعة بنجاح');
    } catch (error) {
      toast.error('خطأ في إضافة إعداد الطباعة');
      console.error('Error creating print option:', error);
    } finally {
      setSaving(false);
    }
  };

  const updatePrintOption = async (id, updatedData) => {
    try {
      setSaving(true);
      const response = await api.put(`/print-options/${id}`, updatedData);
      setPrintOptions(printOptions.map(option => 
        option.id === id ? response.data.data : option
      ));
      setEditingOption(null);
      toast.success('تم تحديث إعداد الطباعة بنجاح');
    } catch (error) {
      toast.error('خطأ في تحديث إعداد الطباعة');
      console.error('Error updating print option:', error);
    } finally {
      setSaving(false);
    }
  };

  const deletePrintOption = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعداد؟')) return;

    try {
      await api.delete(`/print-options/${id}`);
      setPrintOptions(printOptions.filter(option => option.id !== id));
      toast.success('تم حذف إعداد الطباعة بنجاح');
    } catch (error) {
      toast.error('خطأ في حذف إعداد الطباعة');
      console.error('Error deleting print option:', error);
    }
  };

  const getColorTypeInfo = (type) => {
    return colorTypes.find(c => c.value === type) || colorTypes[0];
  };

  const getPaperTypeInfo = (type) => {
    return paperTypes.find(p => p.value === type) || paperTypes[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PrintPageHeader title="إعدادات الطباعة" subtitle="إدارة خيارات وإعدادات الطباعة المتاحة" />
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">

        {/* Add New Option */}
        <div className="card-premium p-8 bg-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
              <Plus size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900">إضافة إعداد جديد</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Color Type */}
            <div>
              <label className="block text-sm font-black text-slate-700 mb-3">نوع الطباعة</label>
              <select
                value={newOption.colorType}
                onChange={(e) => setNewOption({...newOption, colorType: e.target.value})}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-600/20 focus:bg-white rounded-xl py-3 px-4 font-bold text-slate-900 outline-none transition-all"
              >
                {colorTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Paper Type */}
            <div>
              <label className="block text-sm font-black text-slate-700 mb-3">حجم الورق</label>
              <select
                value={newOption.paperType}
                onChange={(e) => setNewOption({...newOption, paperType: e.target.value})}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-600/20 focus:bg-white rounded-xl py-3 px-4 font-bold text-slate-900 outline-none transition-all"
              >
                {paperTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Copies */}
            <div>
              <label className="block text-sm font-black text-slate-700 mb-3">عدد النسخ</label>
              <input
                type="number"
                min="1"
                max="100"
                value={newOption.copies}
                onChange={(e) => setNewOption({...newOption, copies: parseInt(e.target.value) || 1})}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-600/20 focus:bg-white rounded-xl py-3 px-4 font-bold text-slate-900 outline-none transition-all"
              />
            </div>

            {/* Double Side */}
            <div>
              <label className="block text-sm font-black text-slate-700 mb-3">طباعة على الوجهين</label>
              <div className="flex items-center gap-4 h-12">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newOption.doubleSide}
                    onChange={(e) => setNewOption({...newOption, doubleSide: e.target.checked})}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm font-bold text-slate-700">نعم</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={createPrintOption}
              disabled={saving}
              className="px-6 py-3 bg-teal-600 text-white font-black text-sm rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50 flex items-center gap-3"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              إضافة إعداد
            </button>
          </div>
        </div>

        {/* Current Options */}
        <div className="card-premium p-8 bg-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Printer size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900">الإعدادات الحالية</h2>
          </div>

          {printOptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Printer size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-400 mb-2">لا توجد إعدادات طباعة</h3>
              <p className="text-slate-400">قم بإضافة إعدادات الطباعة الأولى</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {printOptions.map((option) => (
                <div key={option.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  {editingOption === option.id ? (
                    <EditOptionForm
                      option={option}
                      colorTypes={colorTypes}
                      paperTypes={paperTypes}
                      onSave={(data) => updatePrintOption(option.id, data)}
                      onCancel={() => setEditingOption(null)}
                      saving={saving}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Palette size={20} className={option.colorType === 'COLOR' ? 'text-purple-600' : 'text-slate-600'} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">
                              {getColorTypeInfo(option.colorType).label}
                            </p>
                            <p className="text-sm text-slate-500">نوع الطباعة</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <FileText size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">
                              {getPaperTypeInfo(option.paperType).label}
                            </p>
                            <p className="text-sm text-slate-500">حجم الورق</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Copy size={20} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{option.copies} نسخة</p>
                            <p className="text-sm text-slate-500">عدد النسخ</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <RotateCcw size={20} className={option.doubleSide ? 'text-orange-600' : 'text-slate-400'} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">
                              {option.doubleSide ? 'وجهين' : 'وجه واحد'}
                            </p>
                            <p className="text-sm text-slate-500">الطباعة</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingOption(option.id)}
                          className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all flex items-center justify-center"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deletePrintOption(option.id)}
                          className="w-10 h-10 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Print Center Info */}
        <div className="card-premium p-8 bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center">
              <Printer size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900">معلومات مهمة</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-black text-slate-900">أنواع الطباعة المتاحة:</h3>
              <ul className="space-y-2">
                {colorTypes.map(type => (
                  <li key={type.value} className="flex items-center gap-3 text-slate-700">
                    <span className="text-lg">{type.icon}</span>
                    <span className="font-bold">{type.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-black text-slate-900">أحجام الورق المدعومة:</h3>
              <ul className="space-y-2">
                {paperTypes.map(type => (
                  <li key={type.value} className="flex items-center gap-3 text-slate-700">
                    <span className="text-lg">{type.icon}</span>
                    <span className="font-bold">{type.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Option Form Component
const EditOptionForm = ({ option, colorTypes, paperTypes, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState({
    colorType: option.colorType,
    paperType: option.paperType,
    doubleSide: option.doubleSide,
    copies: option.copies,
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2">نوع الطباعة</label>
          <select
            value={formData.colorType}
            onChange={(e) => setFormData({...formData, colorType: e.target.value})}
            className="w-full bg-white border-2 border-slate-200 focus:border-teal-600/20 rounded-xl py-2 px-3 font-bold text-slate-900 outline-none transition-all text-sm"
          >
            {colorTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-black text-slate-700 mb-2">حجم الورق</label>
          <select
            value={formData.paperType}
            onChange={(e) => setFormData({...formData, paperType: e.target.value})}
            className="w-full bg-white border-2 border-slate-200 focus:border-teal-600/20 rounded-xl py-2 px-3 font-bold text-slate-900 outline-none transition-all text-sm"
          >
            {paperTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-black text-slate-700 mb-2">عدد النسخ</label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.copies}
            onChange={(e) => setFormData({...formData, copies: parseInt(e.target.value) || 1})}
            className="w-full bg-white border-2 border-slate-200 focus:border-teal-600/20 rounded-xl py-2 px-3 font-bold text-slate-900 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-black text-slate-700 mb-2">طباعة على الوجهين</label>
          <div className="flex items-center gap-4 h-10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.doubleSide}
                onChange={(e) => setFormData({...formData, doubleSide: e.target.checked})}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="text-sm font-bold text-slate-700">نعم</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
        >
          <X size={16} />
          إلغاء
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-teal-600 text-white font-bold text-sm rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check size={16} />
          )}
          حفظ
        </button>
      </div>
    </div>
  );
};

export default PrintSettings;