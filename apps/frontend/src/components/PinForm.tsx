'use client';

import { useState, useEffect } from 'react';
import { PREFECTURES } from '@maple/shared';
import type { CreatePinRequest, UpdatePinRequest } from '@maple/shared';

interface PinFormProps {
  initialData?: Partial<CreatePinRequest>;
  onSubmit: (data: CreatePinRequest | UpdatePinRequest) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  isLoading?: boolean;
}

export default function PinForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isEdit = false,
  isLoading = false 
}: PinFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    prefecture: initialData?.prefecture || '',
    address: initialData?.address || '',
    visitedAt: initialData?.visitedAt ? new Date(initialData.visitedAt).toISOString().slice(0, 10) : '',
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
        prefecture: initialData.prefecture || '',
        address: initialData.address || '',
        visitedAt: initialData.visitedAt ? new Date(initialData.visitedAt).toISOString().slice(0, 10) : '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create clean submit data with proper types
    const submitData: any = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      prefecture: formData.prefecture,
      address: formData.address.trim() || undefined,
    };
    
    // Only include visitedAt if it has a value
    if (formData.visitedAt) {
      submitData.visitedAt = new Date(formData.visitedAt + 'T00:00:00').toISOString();
    }
    
    console.log('PinForm: Submitting data:', submitData);
    console.log('PinForm: Field validation check:', {
      titleLength: submitData.title.length,
      prefectureSet: !!submitData.prefecture,
      latitudeValid: submitData.latitude >= -90 && submitData.latitude <= 90,
      longitudeValid: submitData.longitude >= -180 && submitData.longitude <= 180,
      visitedAtFormat: submitData.visitedAt ? 'ISO string' : 'undefined'
    });
    
    await onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-honey-200/50 p-6">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-maple-500 bg-clip-text text-transparent flex items-center">
        {isEdit ? '✏️ ピンを編集' : '📍 新しいピンを追加'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-warm-800 mb-2">
            ✨ タイトル *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gradient-to-r from-honey-50 to-primary-50 border-2 border-honey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 text-warm-800 font-medium"
            placeholder="場所の名前を入力してください"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-warm-800 mb-2">
            📝 説明
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gradient-to-r from-honey-50 to-primary-50 border-2 border-honey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 text-warm-800 resize-none"
            placeholder="思い出や詳細を入力してください"
          />
        </div>

        {/* Hidden fields for coordinates */}
        <input type="hidden" name="latitude" value={formData.latitude} />
        <input type="hidden" name="longitude" value={formData.longitude} />

        <div>
          <label htmlFor="prefecture" className="block text-sm font-semibold text-warm-800 mb-2">
            🗾 都道府県 *
          </label>
          <select
            id="prefecture"
            name="prefecture"
            required
            value={formData.prefecture}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gradient-to-r from-honey-50 to-primary-50 border-2 border-honey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 text-warm-800 font-medium"
          >
            <option value="">選択してください</option>
            {PREFECTURES.map(pref => (
              <option key={pref} value={pref}>
                {pref}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-warm-800 mb-2">
            📍 住所
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gradient-to-r from-honey-50 to-primary-50 border-2 border-honey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 text-warm-800 font-medium"
            placeholder="詳細な住所"
          />
        </div>

        <div>
          <label htmlFor="visitedAt" className="block text-sm font-semibold text-warm-800 mb-2">
            📅 訪問日
          </label>
          <input
            id="visitedAt"
            name="visitedAt"
            type="date"
            value={formData.visitedAt}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gradient-to-r from-honey-50 to-primary-50 border-2 border-honey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 text-warm-800 font-medium"
          />
        </div>

        <div className="flex space-x-4 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-primary-500 to-honey-500 hover:from-primary-600 hover:to-honey-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:transform-none"
          >
            {isLoading ? '💫 保存中...' : isEdit ? '✅ 更新' : '🌟 追加'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gradient-to-r from-warm-300 to-warm-400 hover:from-warm-400 hover:to-warm-500 text-warm-800 py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            ❌ キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}