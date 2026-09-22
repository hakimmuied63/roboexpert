import { useState } from 'react';
import { ArrowLeft, Upload, ImagePlus } from 'lucide-react';
import { Button, Input, Textarea, Select } from '../../components/ui';
import { productService } from '../../mocks/services';
import { useAuth } from '../../contexts/AuthContext';
import type { Product } from '../../types';
import toast from 'react-hot-toast';

interface ProductFormProps {
  product?: Product;
  onSave: () => void;
  onCancel: () => void;
}

const categoryOptions = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Fashion & Apparel', label: 'Fashion & Apparel' },
  { value: 'Home & Living', label: 'Home & Living' },
  { value: 'Books & Stationery', label: 'Books & Stationery' },
  { value: 'Sports & Fitness', label: 'Sports & Fitness' },
  { value: 'Beauty & Health', label: 'Beauty & Health' },
];

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const { user } = useAuth();
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    compareAtPrice: product?.compareAtPrice?.toString() || '',
    category: product?.category || '',
    stock: product?.stock?.toString() || '',
    tags: product?.tags?.join(', ') || '',
    featured: product?.featured || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Valid price is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.stock || Number(form.stock) < 0) e.stock = 'Valid stock quantity is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setLoading(true);
    try {
      const productData = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        category: form.category,
        stock: Number(form.stock),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        featured: form.featured,
        sellerId: user.id,
        sellerName: user.name,
        images: product?.images || [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        ],
      };

      if (isEditing && product) {
        await productService.update(product.id, productData);
        toast.success('Product updated successfully');
      } else {
        await productService.create(productData);
        toast.success('Product created successfully');
      }
      onSave();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onCancel}
          className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-surface-500 mt-0.5">
            {isEditing ? 'Update your product details' : 'Fill in the details to list a new product'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <h2 className="text-sm font-semibold text-surface-900 mb-4">Product Images</h2>
          <div className="flex gap-4 flex-wrap">
            {(product?.images || []).map((img, i) => (
              <div
                key={i}
                className="w-24 h-24 rounded-lg border border-surface-200 overflow-hidden"
              >
                <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            <button
              type="button"
              className="w-24 h-24 rounded-lg border-2 border-dashed border-surface-300 flex flex-col items-center justify-center gap-1 text-surface-400 hover:border-primary-400 hover:text-primary-500 transition-colors cursor-pointer"
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-[10px]">Add Photo</span>
            </button>
          </div>
          <p className="text-xs text-surface-400 mt-2">
            Upload up to 5 images. First image will be the cover. (Mock — no actual upload)
          </p>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-surface-900">Product Details</h2>

          <Input
            label="Product Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            error={errors.title}
            placeholder="e.g., Premium Wireless Headphones"
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            error={errors.description}
            placeholder="Describe your product in detail..."
            rows={5}
          />

          <Select
            label="Category"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            error={errors.category}
            options={categoryOptions}
            placeholder="Select a category"
          />

          <Input
            label="Tags"
            value={form.tags}
            onChange={e => setForm({ ...form, tags: e.target.value })}
            placeholder="e.g., wireless, bluetooth, premium (comma-separated)"
            helperText="Add comma-separated tags for better discoverability"
          />
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-surface-900">Pricing & Inventory</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Price (₹)"
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              error={errors.price}
              placeholder="0.00"
              min="0"
            />
            <Input
              label="Compare at Price (₹)"
              type="number"
              value={form.compareAtPrice}
              onChange={e => setForm({ ...form, compareAtPrice: e.target.value })}
              placeholder="Optional — original price"
              helperText="Shows as crossed-out price"
              min="0"
            />
          </div>

          <Input
            label="Stock Quantity"
            type="number"
            value={form.stock}
            onChange={e => setForm({ ...form, stock: e.target.value })}
            error={errors.stock}
            placeholder="0"
            min="0"
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={e => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <p className="text-sm font-medium text-surface-700">Featured Product</p>
              <p className="text-xs text-surface-400">Show this product in featured sections</p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={<Upload className="w-4 h-4" />}>
            {isEditing ? 'Update Product' : 'Publish Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
