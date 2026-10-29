import { useEffect, useState, useRef } from 'react';
import { Palette, Image as ImageIcon, LayoutGrid, List, Upload, CheckCircle2 } from 'lucide-react';
import { Button, Input, LoadingSpinner } from '../../components/ui';
import { fetchMyCompany, updateMyCompany, uploadImage, type MyCompany } from '../../lib/api';
import toast from 'react-hot-toast';

export function SellerStoreDesign() {
  const [company, setCompany] = useState<MyCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [tagline, setTagline] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [layoutStyle, setLayoutStyle] = useState<'grid' | 'list'>('grid');
  const [gridColumns, setGridColumns] = useState(3);
  const [bannerUrl, setBannerUrl] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await fetchMyCompany();
    if (data) {
      setCompany(data);
      setTagline(data.tagline || '');
      setAboutText(data.aboutText || '');
      setPrimaryColor(data.primaryColor || '#4f46e5');
      setLayoutStyle(data.layoutStyle || 'grid');
      setGridColumns(data.gridColumns || 3);
      setBannerUrl(data.bannerUrl || '');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    const res = await uploadImage(file, 'sellers');
    setUploadingBanner(false);

    if (!res.ok || !res.url) {
      toast.error(res.error || 'Failed to upload banner');
      return;
    }
    setBannerUrl(res.url);
    toast.success('Banner uploaded');
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      tagline: tagline.trim() || null,
      aboutText: aboutText.trim() || null,
      primaryColor,
      layoutStyle,
      gridColumns,
      bannerUrl: bannerUrl || null,
    };

    const updated = await updateMyCompany(payload);
    setSaving(false);

    if (!updated) {
      toast.error('Failed to save changes');
      return;
    }

    toast.success('Store design updated!');
    setCompany(updated);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Store Design</h1>
        <p className="text-surface-500 mt-1">Customize how your storefront looks to buyers.</p>
      </div>

      <div className="space-y-6">
        {/* Banner Section */}
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary-600" /> Store Banner
          </h2>
          <div className="space-y-4">
            {bannerUrl ? (
              <div className="relative w-full h-48 bg-surface-100 rounded-lg overflow-hidden border border-surface-200">
                <img src={bannerUrl} alt="Store Banner" className="w-full h-full object-cover" />
                <button
                  onClick={() => setBannerUrl('')}
                  className="absolute top-2 right-2 bg-white/90 text-sm font-medium px-3 py-1 rounded-lg hover:bg-white"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploadingBanner}
                className="w-full h-48 border-2 border-dashed border-surface-300 rounded-lg flex flex-col items-center justify-center text-surface-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                <Upload className="w-8 h-8 mb-2" />
                <span>{uploadingBanner ? 'Uploading...' : 'Click to upload banner (recommended 1200x400)'}</span>
              </button>
            )}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
            />
          </div>
        </div>

        {/* Text Content Section */}
        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-2">Brand Info</h2>
          
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Tagline</label>
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Premium denim since 2015"
              maxLength={120}
            />
            <p className="text-xs text-surface-400 mt-1">{tagline.length}/120</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">About Us</label>
            <textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              rows={4}
              maxLength={2000}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"
              placeholder="Tell customers about your business..."
            />
          </div>
        </div>

        {/* Layout & Theme Section */}
        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary-600" /> Layout & Theme
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-sm font-mono text-surface-600">{primaryColor}</span>
              </div>
            </div>

            {/* Layout Style */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Layout Style</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLayoutStyle('grid')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-lg text-sm transition-colors ${
                    layoutStyle === 'grid' ? 'bg-primary-50 border-primary-500 text-primary-700 font-medium' : 'border-surface-300 hover:bg-surface-50 text-surface-600'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" /> Grid
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutStyle('list')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-lg text-sm transition-colors ${
                    layoutStyle === 'list' ? 'bg-primary-50 border-primary-500 text-primary-700 font-medium' : 'border-surface-300 hover:bg-surface-50 text-surface-600'
                  }`}
                >
                  <List className="w-4 h-4" /> List
                </button>
              </div>
            </div>
          </div>

          {/* Grid Columns */}
          {layoutStyle === 'grid' && (
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Products per row</label>
              <div className="flex gap-2">
                {[2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGridColumns(num)}
                    className={`px-6 py-2 border rounded-lg text-sm transition-colors ${
                      gridColumns === num ? 'bg-primary-50 border-primary-500 text-primary-700 font-medium' : 'border-surface-300 hover:bg-surface-50 text-surface-600'
                    }`}
                  >
                    {num} Columns
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg" icon={<CheckCircle2 className="w-4 h-4" />}>
            Save Design
          </Button>
        </div>
      </div>
    </div>
  );
}