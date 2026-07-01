import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  CheckCircle2,
  XCircle,
  FolderOpen,
} from 'lucide-react';
import {
  useFeeCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../api/feeApi';
import type { FeeCategory } from '../types/fee.types';

interface CategoryFormData {
  name: string;
  description: string;
}

const SkeletonRow = () => (
  <tr>
    {[1, 2, 3, 4].map((i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse shimmer" />
      </td>
    ))}
  </tr>
);

const FeeCategories: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<FeeCategory | null>(null);

  const { data: categories, isLoading } = useFeeCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>();

  const openAdd = () => {
    setEditTarget(null);
    reset({ name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (cat: FeeCategory) => {
    setEditTarget(cat);
    reset({ name: cat.name, description: cat.description ?? '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    reset();
  };

  const onSubmit = (data: CategoryFormData) => {
    if (editTarget) {
      updateMutation.mutate(
        { id: editTarget.id, payload: { name: data.name, description: data.description } },
        { onSuccess: closeModal }
      );
    } else {
      createMutation.mutate(
        { name: data.name, description: data.description },
        { onSuccess: closeModal }
      );
    }
  };

  const toggleActive = (cat: FeeCategory) => {
    updateMutation.mutate({ id: cat.id, payload: { isActive: !cat.isActive } });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this category? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const activeCount = categories?.filter((c) => c.isActive).length ?? 0;
  const totalCount = categories?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fee Categories</h2>
          <p className="text-sm text-slate-500 mt-0.5">Define and manage fee categories for your structures.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <Tag className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</p>
            <p className="text-xs text-slate-500 font-medium">Total Categories</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeCount}</p>
            <p className="text-xs text-slate-500 font-medium">Active</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount - activeCount}</p>
            <p className="text-xs text-slate-500 font-medium">Inactive</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !categories?.length ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <FolderOpen className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 font-medium">No categories yet</p>
                      <p className="text-slate-400 text-xs">Create your first fee category to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => (
                  <tr
                    key={cat.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
                      idx % 2 === 0 ? '' : 'bg-slate-50/40 dark:bg-slate-900/20'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                          <Tag className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate">
                      {cat.description || <span className="italic text-slate-400">No description</span>}
                    </td>
                    <td className="px-6 py-4">
                      {cat.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 px-3 py-1 text-xs font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleActive(cat)}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-violet-600 transition-colors"
                          title={cat.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {cat.isActive ? (
                            <ToggleRight className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-violet-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {editTarget ? 'Edit Category' : 'New Fee Category'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tuition Fee, Library Fee"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  {...register('name', { required: 'Category name is required' })}
                />
                {errors.name && (
                  <span className="text-xs text-red-500 font-medium">{errors.name.message}</span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Description <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of what this fee covers..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                  {...register('description')}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    editTarget ? 'Save Changes' : 'Create Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeCategories;
