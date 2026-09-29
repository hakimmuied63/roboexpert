import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  LayoutGrid,
  List,
  Upload,
} from 'lucide-react';
import {
  fetchSellerProducts,
  deleteSellerProduct,
  type Product,
} from '../../lib/api';
import { Button, ConfirmModal, EmptyState, LoadingSpinner, Badge } from '../../components/ui';
import { ProductForm } from './ProductForm';
import toast from 'react-hot-toast';

export function SellerProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    const data = await fetchSellerProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget._id);
    const ok = await deleteSellerProduct(deleteTarget._id);
    setBusyId(null);

    if (!ok) {
      toast.error('Could not delete product');
      return;
    }

    toast.success('Product deleted');
    setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
    setDeleteTarget(null);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // Show form instead of list when adding/editing
  if (showForm) {
    return (
      <ProductForm
        product={editingProduct ?? undefined}
        onSave={() => {
          setShowForm(false);
          setEditingProduct(null);
          loadProducts();
        }}
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => navigate('/seller/products/bulk')}
          >
            Bulk Upload
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleAdd}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-lg text-sm
              placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-primary-50 text-primary-600'
                : 'text-surface-400 hover:text-surface-600'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-primary-50 text-primary-600'
                : 'text-surface-400 hover:text-surface-600'
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
            <Button icon={<Plus className="w-4 h-4" />} onClick={handleAdd}>
              Add Product
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="relative aspect-[4/3] bg-surface-100 overflow-hidden">
                <img
                  src={product.images[0] ?? 'https://via.placeholder.com/400'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/400?text=No+Image';
                  }}
                />
                {!product.isActive && (
                  <Badge variant="warning" className="absolute top-2 left-2">
                    Hidden
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-surface-900 line-clamp-2 mb-2">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-surface-900">
                  ₹{product.basePrice.toLocaleString('en-IN')}
                </p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-100">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit3 className="w-3.5 h-3.5" />}
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(product)}
                    loading={busyId === product._id}
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
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0] ?? 'https://via.placeholder.com/48'}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-surface-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/48?text=—';
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-surface-900 line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-surface-500">/{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-surface-900">
                    ₹{product.basePrice.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    {product.isActive ? (
                      <Badge variant="success" dot>
                        Visible
                      </Badge>
                    ) : (
                      <Badge>Hidden</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(product)}
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
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}