import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Tag } from 'lucide-react';
import {
  fetchSellerCategories,
  createSellerCategory,
  updateSellerCategory,
  deleteSellerCategory,
  type Category,
} from '../../lib/api';
import { Button, ConfirmModal, EmptyState, LoadingSpinner, Input } from '../../components/ui';
import toast from 'react-hot-toast';

type CategoryWithCount = Category & { productCount?: number };

export function SellerCategories() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    const data = await fetchSellerCategories();
    setCategories(data as CategoryWithCount[]);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setNameInput('');
    setNameError('');
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setNameInput(category.name);
    setNameError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setNameInput('');
    setNameError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError('Name is required');
      return;
    }
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }

    setSubmitting(true);

    if (editingCategory) {
      const result = await updateSellerCategory(editingCategory._id, trimmed);
      setSubmitting(false);
      if (!result) {
        toast.error('Could not rename category');
        return;
      }
      toast.success('Category renamed');
      setCategories((prev) =>
        prev.map((c) => (c._id === editingCategory._id ? { ...c, name: trimmed } : c))
      );
    } else {
      const result = await createSellerCategory(trimmed);
      setSubmitting(false);
      if (!result) {
        toast.error('Could not create category. It may already exist.');
        return;
      }
      toast.success('Category created');
      // Reload to get the product count (0) attached
      loadCategories();
    }

    closeModal();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deleteSellerCategory(deleteTarget._id);
    if (!ok) {
      toast.error('Could not delete category');
      return;
    }
    toast.success('Category deleted');
    setCategories((prev) => prev.filter((c) => c._id !== deleteTarget._id));
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Categories</h1>
          <p className="text-surface-500 mt-1">
            Organize your products into categories ({categories.length} total)
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAddModal}>
          Add Category
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Tag className="w-8 h-8 text-surface-400" />}
          title="No categories yet"
          description="Create your first category to organize your products."
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={openAddModal}>
              Add Category
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3">Products</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                        <Tag className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-surface-900">
                        {category.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-700">
                    {category.productCount ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-primary-600 transition-colors cursor-pointer"
                        aria-label="Rename category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(category)}
                        className="p-2 rounded-lg text-surface-500 hover:bg-danger-50 hover:text-danger-600 transition-colors cursor-pointer"
                        aria-label="Delete category"
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-surface-900 mb-4">
              {editingCategory ? 'Rename Category' : 'Add Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Category Name"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setNameError('');
                }}
                error={nameError}
                placeholder="e.g., Summer Collection"
                autoFocus
              />

              <div className="flex items-center gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Products in this category will become uncategorized. This cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}