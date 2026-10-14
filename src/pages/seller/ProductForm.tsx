import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Upload, Plus, Trash2, Eye, EyeOff, X, Loader2 } from 'lucide-react';
import { Button, Input, Textarea, Select } from '../../components/ui';
import {
  fetchSellerCategories,
  createSellerProduct,
  updateSellerProduct,
  uploadImage as uploadImageApi,
  type CategoryTreeNode,
  type Product,
} from '../../lib/api';
import toast from 'react-hot-toast';

interface ProductFormProps {
  product?: Product;
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

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
    // Flatten category tree for hierarchical dropdown
    const flatCategoryOptions = (() => {
      const options: { value: string; label: string }[] = [];
      const walk = (nodes: any[], parentName: string, depth: number) => {
        for (const node of nodes) {
          if (depth > 0) {
            const prefix = parentName ? `${parentName} → ` : '';
            options.push({
              value: node._id,
              label: `${prefix}${node.name}`,
            });
          }
          if (node.children && node.children.length > 0) {
            walk(node.children, node.name, depth + 1);
          }
        }
      };
      walk(categories, '', 0);
      return options;
    })();
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    basePrice: product?.basePrice?.toString() ?? '',
    categoryId: '',
    imageUrls: product?.images ?? [],
    isActive: product?.isActive ?? true,
  });

  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (!isEditing) {
      if (variants.length === 0) {
        e.variants = 'At least one variant is required';
      } else {
        variants.forEach((v, i) => {
          if (!v.sku.trim()) e[`variant_${i}_sku`] = 'SKU required';
          if (!v.price || Number(v.price) <= 0) {
            e[`variant_${i}_price`] = 'Valid price required';
          }
          if (v.stock === '' || Number(v.stock) < 0) {
            e[`variant_${i}_stock`] = 'Valid stock required';
          }
        });
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageUpload = async (file: File, index: number) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }

    setUploadingIndex(index);
    const result = await uploadImageApi(file, 'products');
    setUploadingIndex(null);

    if (!result.ok || !result.url) {
      toast.error(result.error ?? 'Upload failed');
      return;
    }

    setForm((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, result.url!],
    }));
    toast.success('Image uploaded');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    (async () => {
      for (let i = 0; i < files.length; i++) {
        await handleImageUpload(files[i], i);
      }
    })();

    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSetPrimary = (index: number) => {
    setForm((prev) => {
      const newUrls = [...prev.imageUrls];
      const [moved] = newUrls.splice(index, 1);
      newUrls.unshift(moved);
      return { ...prev, imageUrls: newUrls };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && product) {
        const payload = {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          basePrice: Number(form.basePrice),
          categoryId: form.categoryId || null,
          images: form.imageUrls,
          isActive: form.isActive,
        };

        const ok = await updateSellerProduct(product._id, payload);

        if (!ok) {
          toast.error('Could not update product');
          return;
        }

        toast.success('Product updated');
      } else {
        const payload = {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          basePrice: Number(form.basePrice),
          categoryId: form.categoryId || undefined,
          images: form.imageUrls,
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
            {isEditing
              ? 'Update your product details'
              : 'Fill in the details to list a new product'}
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
            label="Subcategory"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            options={flatCategoryOptions}
            placeholder={
              categoriesLoading
                ? 'Loading...'
                : flatCategoryOptions.length === 0
                ? 'No subcategories — add some first'
                : 'Select a subcategory'
            }
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

          {/* Product Images */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Product Images
              <span className="text-xs text-surface-400 font-normal ml-2">
                ({form.imageUrls.length}/5)
              </span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {form.imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Product ${index + 1}`}
                    className="w-full aspect-square rounded-lg object-cover border border-surface-200"
                  />

                  {index === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      MAIN
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger-600 text-white flex items-center justify-center hover:bg-danger-700 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(index)}
                      className="absolute bottom-1.5 left-1.5 right-1.5 bg-white/90 hover:bg-white text-surface-700 text-[10px] font-medium py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Set as main
                    </button>
                  )}
                </div>
              ))}

              {form.imageUrls.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingIndex !== null}
                  className="aspect-square rounded-lg border-2 border-dashed border-surface-300 hover:border-primary-500 hover:bg-primary-50/50 transition-colors flex flex-col items-center justify-center gap-1.5 text-surface-500 hover:text-primary-600 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {uploadingIndex !== null ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-xs">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span className="text-xs font-medium">Add</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <p className="mt-2 text-xs text-surface-400">
              Upload up to 5 images. PNG, JPG, WebP (max 5 MB each). First image is the main image.
            </p>
          </div>

          {isEditing && (
            <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-surface-100">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex items-center gap-2">
                {form.isActive ? (
                  <Eye className="w-4 h-4 text-success-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-surface-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-surface-700">
                    {form.isActive ? 'Visible to buyers' : 'Hidden from buyers'}
                  </p>
                  <p className="text-xs text-surface-400">
                    Toggle to hide this product from the storefront without deleting it
                  </p>
                </div>
              </div>
            </label>
          )}
        </div>

        {/* Variants — only when creating */}
        {!isEditing && (
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
        )}

        {/* Note when editing — variants can't be changed */}
        {isEditing && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">Variants can't be edited here</p>
            <p className="text-blue-700">
              Product variants (SKUs, sizes, colors) can't be modified after creation.
              If you need to change them, delete this product and create a new one.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={<Upload className="w-4 h-4" />}>
            {isEditing ? 'Save Changes' : 'Publish Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}