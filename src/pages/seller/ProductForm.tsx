import { useEffect, useState } from 'react';
import { ArrowLeft, Upload, Plus, Trash2 } from 'lucide-react';
import { Button, Input, Textarea, Select } from '../../components/ui';
import {
  fetchSellerCategories,
  createSellerProduct,
  type Category,
} from '../../lib/api';
import toast from 'react-hot-toast';

interface ProductFormProps {
  onSave: () => void;
  onCancel: () => void;
}

type VariantDraft = {
  sku: string;
  size: string;
  color: string;
  price: string;
  stock: string;
};

const emptyVariant = (): VariantDraft => ({
  sku: '',
  size: '',
  color: '',
  price: '',
  stock: '',
});

export function ProductForm({ onSave, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    imageUrl: '',
  });

  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const cats = await fetchSellerCategories();
      setCategories(cats);
      setCategoriesLoading(false);
    }
    load();
  }, []);

  const updateVariant = (index: number, patch: Partial<VariantDraft>) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant()]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.basePrice || Number(form.basePrice) <= 0) {
      e.basePrice = 'Valid base price is required';
    }

    if (variants.length === 0) {
      e.variants = 'At least one variant is required';
    } else {
      variants.forEach((v, i) => {
        if (!v.sku.trim()) e[`variant_${i}_sku`] = 'SKU required';
        if (!v.price || Number(v.price) <= 0) e[`variant_${i}_price`] = 'Valid price required';
        if (v.stock === '' || Number(v.stock) < 0) {
          e[`variant_${i}_stock`] = 'Valid stock required';
        }
      });
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        basePrice: Number(form.basePrice),
        categoryId: form.categoryId || undefined,
        images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
        variants: variants.map((v) => ({
          sku: v.sku.trim(),
          attributes: {
            ...(v.size.trim() ? { size: v.size.trim() } : {}),
            ...(v.color.trim() ? { color: v.color.trim() } : {}),
          },
          price: Number(v.price),
          stock: Number(v.stock),
        })),
      };

      const result = await createSellerProduct(payload);

      if (!result) {
        toast.error('Could not create product. Check for duplicate SKUs or try again.');
        return;
      }

      toast.success('Product created');
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
          <h1 className="text-2xl font-bold text-surface-900">Add New Product</h1>
          <p className="text-surface-500 mt-0.5">
            Fill in the details to list a new product
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Details */}
        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-surface-900">Product Details</h2>

          <Input
            label="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            placeholder="e.g., Classic White T-Shirt"
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your product..."
            rows={4}
          />

          <Select
            label="Category"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
            placeholder={categoriesLoading ? 'Loading...' : 'Select a category'}
          />

          <Input
            label="Base Price (₹)"
            type="number"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
            error={errors.basePrice}
            placeholder="0"
            min="0"
          />

          <Input
            label="Image URL"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://..."
            helperText="Paste an image URL. Upload coming soon."
          />
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-surface-900">
              Variants ({variants.length})
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={addVariant}
            >
              Add Variant
            </Button>
          </div>

          {errors.variants && (
            <p className="text-sm text-danger-600">{errors.variants}</p>
          )}

          {variants.map((variant, i) => (
            <div
              key={i}
              className="border border-surface-200 rounded-lg p-4 space-y-4 bg-surface-50"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-surface-600 uppercase">
                  Variant {i + 1}
                </p>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="p-1.5 rounded text-danger-600 hover:bg-danger-50 transition-colors cursor-pointer"
                    aria-label="Remove variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="SKU"
                  value={variant.sku}
                  onChange={(e) => updateVariant(i, { sku: e.target.value })}
                  error={errors[`variant_${i}_sku`]}
                  placeholder="e.g., TSHIRT-WHT-M"
                />
                <Input
                  label="Size (optional)"
                  value={variant.size}
                  onChange={(e) => updateVariant(i, { size: e.target.value })}
                  placeholder="e.g., M, 42"
                />
                <Input
                  label="Color (optional)"
                  value={variant.color}
                  onChange={(e) => updateVariant(i, { color: e.target.value })}
                  placeholder="e.g., White"
                />
                <Input
                  label="Price (₹)"
                  type="number"
                  value={variant.price}
                  onChange={(e) => updateVariant(i, { price: e.target.value })}
                  error={errors[`variant_${i}_price`]}
                  placeholder="0"
                  min="0"
                />
                <Input
                  label="Stock"
                  type="number"
                  value={variant.stock}
                  onChange={(e) => updateVariant(i, { stock: e.target.value })}
                  error={errors[`variant_${i}_stock`]}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={<Upload className="w-4 h-4" />}>
            Publish Product
          </Button>
        </div>
      </form>
    </div>
  );
}