import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Tag, CornerDownRight, FolderPlus } from 'lucide-react';
import {
  fetchSellerCategories,
  createSellerCategory,
  updateSellerCategory,
  deleteSellerCategory,
  type CategoryTreeNode,
} from '../../lib/api';
import { Button, ConfirmModal, EmptyState, LoadingSpinner, Input, Select } from '../../components/ui';
import toast from 'react-hot-toast';

type ModalMode = 'category' | 'subcategory' | null;

export function SellerCategories() {
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryTreeNode | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [nameError, setNameError] = useState('');
  const [parentError, setParentError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<CategoryTreeNode | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    const data = await fetchSellerCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Flatten tree for total count
  const flatCategories: CategoryTreeNode[] = [];
  const flatten = (nodes: CategoryTreeNode[]) => {
    for (const node of nodes) {
      flatCategories.push(node);
      if (node.children) flatten(node.children);
    }
  };
  flatten(categories);
  const totalCount = flatCategories.length;

  const topLevelCategories = categories.filter((c) => !c.parentId);

  // ---------- Modal openers ----------

  const openAddCategory = () => {
    setModalMode('category');
    setEditingCategory(null);
    setNameInput('');
    setParentId('');
    setNameError('');
    setParentError('');
  };

  const openAddSubcategory = () => {
    setModalMode('subcategory');
    setEditingCategory(null);
    setNameInput('');
    setParentId('');
    setNameError('');
    setParentError('');
  };

  const openEdit = (category: CategoryTreeNode) => {
    // Reuse 'category' mode for editing (only name changes)
    setModalMode('category');
    setEditingCategory(category);
    setNameInput(category.name);
    setParentId(category.parentId ?? '');
    setNameError('');
    setParentError('');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingCategory(null);
    setNameInput('');
    setParentId('');
    setNameError('');
    setParentError('');
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

    // Subcategory mode requires a parent
    if (modalMode === 'subcategory' && !editingCategory && !parentId) {
      setParentError('Please select a parent category');
      return;
    }

    setSubmitting(true);

    if (editingCategory) {
      // Edit mode — only name changes
      const result = await updateSellerCategory(editingCategory._id, trimmed);
      setSubmitting(false);
      if (!result) {
        toast.error('Could not update category');
        return;
      }
      toast.success('Category updated');
    } else if (modalMode === 'subcategory') {
      const result = await createSellerCategory(trimmed, parentId);
      setSubmitting(false);
      if (!result) {
        toast.error('Could not create subcategory. It may already exist.');
        return;
      }
      toast.success('Subcategory created');
    } else {
      const result = await createSellerCategory(trimmed, null);
      setSubmitting(false);
      if (!result) {
        toast.error('Could not create category. It may already exist.');
        return;
      }
      toast.success('Category created');
    }

    loadCategories();
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
    loadCategories();
    setDeleteTarget(null);
  };

  // ---------- Row renderer ----------

  const renderRow = (category: CategoryTreeNode, isChild: boolean) => (
    <tr key={category._id} className="hover:bg-surface-50 transition-colors">
      <td className="px-6 py-4">
        <div className={`flex items-center gap-3 ${isChild ? 'pl-10' : ''}`}>
          {isChild && (
            <CornerDownRight className="w-4 h-4 text-surface-300 flex-shrink-0" />
          )}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isChild
                ? 'bg-surface-100 text-surface-500'
                : 'bg-primary-50 text-primary-600'
            }`}
          >
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <span
              className={`text-sm ${
                isChild ? 'text-surface-700' : 'font-medium text-surface-900'
              }`}
            >
              {category.name}
            </span>
            {isChild && (
              <p className="text-xs text-surface-400 mt-0.5">Subcategory</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-surface-500">{category.slug}</td>
      <td className="px-6 py-4 text-sm text-surface-700">
        {category.productCount ?? 0}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEdit(category)}
            className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-primary-600 transition-colors cursor-pointer"
            aria-label="Edit category"
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
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Categories</h1>
          <p className="text-surface-500 mt-1">
            Organize your products into categories and subcategories ({totalCount} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={<FolderPlus className="w-4 h-4" />}
            onClick={openAddSubcategory}
            disabled={topLevelCategories.length === 0}
          >
            Add Subcategory
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openAddCategory}>
            Add Category
          </Button>
        </div>
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
            <Button icon={<Plus className="w-4 h-4" />} onClick={openAddCategory}>
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
              {categories.map((parent) => (
                <>
                  {renderRow(parent, false)}
                  {parent.children?.map((child) => renderRow(child, true))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-surface-900 mb-4">
              {editingCategory
                ? 'Edit Category'
                : modalMode === 'subcategory'
                ? 'Add Subcategory'
                : 'Add Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={modalMode === 'subcategory' && !editingCategory ? 'Subcategory Name' : 'Category Name'}
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setNameError('');
                }}
                error={nameError}
                placeholder={
                  modalMode === 'subcategory'
                    ? 'e.g., T-Shirts'
                    : 'e.g., Summer Collection'
                }
                autoFocus
              />

              {/* Parent dropdown — ONLY in subcategory mode, and not when editing */}
              {modalMode === 'subcategory' && !editingCategory && (
                <Select
                  label="Parent Category *"
                  value={parentId}
                  onChange={(e) => {
                    setParentId(e.target.value);
                    setParentError('');
                  }}
                  options={[
                    { value: '', label: 'Select a parent category' },
                    ...topLevelCategories.map((c) => ({
                      value: c._id,
                      label: c.name,
                    })),
                  ]}
                  error={parentError}
                />
              )}

              {editingCategory && (
                <p className="text-xs text-surface-500">
                  Only the name can be changed. To move a subcategory to a different parent, delete it and create a new one.
                </p>
              )}

              <div className="flex items-center gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  {editingCategory
                    ? 'Save Changes'
                    : modalMode === 'subcategory'
                    ? 'Create Subcategory'
                    : 'Create Category'}
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
        message={
          deleteTarget?.children && deleteTarget.children.length > 0
            ? `Delete "${deleteTarget.name}"? Its ${deleteTarget.children.length} subcategories will become top-level, and products will become uncategorized.`
            : `Are you sure you want to delete "${deleteTarget?.name}"? Products in this category will become uncategorized.`
        }
        confirmText="Delete"
      />
    </div>
  );
}