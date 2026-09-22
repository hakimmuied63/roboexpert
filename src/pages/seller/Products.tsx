import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Check,
  X,
  LayoutGrid,
  List,
  MoreVertical,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../mocks/services';
import { Button, ConfirmModal, EmptyState, LoadingSpinner, Badge } from '../../components/ui';
import { ProductForm } from './ProductForm';
import type { Product } from '../../types';
import toast from 'react-hot-toast';

export function SellerProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [inlineEditing, setInlineEditing] = useState<{
    id: string;
    field: 'price' | 'stock';
    value: string;
  } | null>(null);

  const loadProducts = async () => {
    if (!user) return;
    setLoading(true);
    const data = await productService.getAll({ sellerId: user.id });
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [user]);

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await productService.delete(deleteTarget.id);
    toast.success('Product deleted successfully');
    setDeleteTarget(null);
    loadProducts();
  };

  const handleInlineSave = async () => {
    if (!inlineEditing) return;
    const value = Number(inlineEditing.value);
    if (isNaN(value) || value < 0) {
      toast.error('Please enter a valid number');
      return;
    }
    await productService.update(inlineEditing.id, {
      [inlineEditing.field]: value,
    });
    toast.success(
      `${inlineEditing.field === 'price' ? 'Price' : 'Stock'} updated`
    );
    setInlineEditing(null);
    loadProducts();
  };

  const handleFormSave = async () => {
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  if (showForm || editingProduct) {
    return (
      <ProductForm
        product={editingProduct || undefined}
        onSave={handleFormSave}
        onCancel={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
      />
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Products</h1>
          <p className="text-surface-500 mt-1">
            Manage your product listings ({products.length} total)
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
          Add Product
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-lg text-sm
              placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-surface-400 hover:text-surface-600'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-surface-400 hover:text-surface-600'
            }`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Start selling by adding your first product."
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
              Add Product
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="relative aspect-[4/3] bg-surface-100 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.stock <= 5 && product.stock > 0 && (
                  <Badge variant="warning" className="absolute top-2 left-2">
                    Low Stock: {product.stock}
                  </Badge>
                )}
                {product.stock === 0 && (
                  <Badge variant="danger" className="absolute top-2 left-2">
                    Out of Stock
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-surface-900 line-clamp-2 mb-2">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between">
                  {/* Inline Price Edit */}
                  {inlineEditing?.id === product.id && inlineEditing.field === 'price' ? (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-surface-500">₹</span>
                      <input
                        type="number"
                        value={inlineEditing.value}
                        onChange={e => setInlineEditing({ ...inlineEditing, value: e.target.value })}
                        className="w-20 px-2 py-1 text-sm border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleInlineSave();
                          if (e.key === 'Escape') setInlineEditing(null);
                        }}
                      />
                      <button onClick={handleInlineSave} className="p-1 text-success-600 hover:bg-success-50 rounded cursor-pointer">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setInlineEditing(null)} className="p-1 text-surface-400 hover:bg-surface-100 rounded cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        setInlineEditing({ id: product.id, field: 'price', value: String(product.price) })
                      }
                      className="text-lg font-bold text-surface-900 hover:text-primary-600 transition-colors cursor-pointer"
                      title="Click to edit price"
                    >
                      ₹{product.price.toLocaleString('en-IN')}
                    </button>
                  )}

                  {/* Inline Stock Edit */}
                  {inlineEditing?.id === product.id && inlineEditing.field === 'stock' ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={inlineEditing.value}
                        onChange={e => setInlineEditing({ ...inlineEditing, value: e.target.value })}
                        className="w-14 px-2 py-1 text-xs border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleInlineSave();
                          if (e.key === 'Escape') setInlineEditing(null);
                        }}
                      />
                      <button onClick={handleInlineSave} className="p-1 text-success-600 hover:bg-success-50 rounded cursor-pointer">
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        setInlineEditing({ id: product.id, field: 'stock', value: String(product.stock) })
                      }
                      className="text-xs text-surface-500 hover:text-primary-600 transition-colors cursor-pointer"
                      title="Click to edit stock"
                    >
                      Stock: {product.stock}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-100">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit3 className="w-3.5 h-3.5" />}
                    onClick={() => setEditingProduct(product)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(product)}
                    className="text-danger-600 hover:bg-danger-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-surface-900 line-clamp-1">
                          {product.title}
                        </p>
                        <p className="text-xs text-surface-500">{product.reviewCount} reviews</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge>{product.category}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    {inlineEditing?.id === product.id && inlineEditing.field === 'price' ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={inlineEditing.value}
                          onChange={e => setInlineEditing({ ...inlineEditing, value: e.target.value })}
                          className="w-24 px-2 py-1 text-sm border border-primary-300 rounded focus:outline-none"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleInlineSave();
                            if (e.key === 'Escape') setInlineEditing(null);
                          }}
                        />
                        <button onClick={handleInlineSave} className="p-1 text-success-600 cursor-pointer">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setInlineEditing(null)} className="p-1 text-surface-400 cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setInlineEditing({ id: product.id, field: 'price', value: String(product.price) })
                        }
                        className="text-sm font-medium text-surface-900 hover:text-primary-600 cursor-pointer"
                      >
                        ₹{product.price.toLocaleString('en-IN')}
                        {product.compareAtPrice && (
                          <span className="ml-2 text-xs text-surface-400 line-through">
                            ₹{product.compareAtPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {inlineEditing?.id === product.id && inlineEditing.field === 'stock' ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={inlineEditing.value}
                          onChange={e => setInlineEditing({ ...inlineEditing, value: e.target.value })}
                          className="w-16 px-2 py-1 text-sm border border-primary-300 rounded focus:outline-none"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleInlineSave();
                            if (e.key === 'Escape') setInlineEditing(null);
                          }}
                        />
                        <button onClick={handleInlineSave} className="p-1 text-success-600 cursor-pointer">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setInlineEditing({ id: product.id, field: 'stock', value: String(product.stock) })
                        }
                        className={`text-sm cursor-pointer ${
                          product.stock <= 5 ? 'text-warning-600 font-medium' : 'text-surface-700'
                        }`}
                      >
                        {product.stock}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-700">
                    ⭐ {product.rating.toFixed(1)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-primary-600 transition-colors cursor-pointer"
                        aria-label="Edit product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="p-2 rounded-lg text-surface-500 hover:bg-danger-50 hover:text-danger-600 transition-colors cursor-pointer"
                        aria-label="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
