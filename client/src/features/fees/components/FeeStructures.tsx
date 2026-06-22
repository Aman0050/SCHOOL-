import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  ListTree,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  IndianRupee,
  Calendar,
  BookOpen,
  CheckSquare,
} from 'lucide-react';
import { useFeeStructures, useCreateStructure, useFeeCategories } from '../api/feeApi';
import type { FeeStructure } from '../types/fee.types';

const fmt = (v: string | number) => `₹${parseFloat(String(v)).toLocaleString('en-IN')}`;

interface StructureFormData {
  name: string;
  academicYear: string;
  classId?: string;
  items: {
    feeCategoryId: string;
    amount: string;
    dueDate?: string;
    isOptional: boolean;
  }[];
}

const StructureCard: React.FC<{ structure: FeeStructure }> = ({ structure }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-sm overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <ListTree className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{structure.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {structure.academicYear}
              </span>
              {structure.class && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {structure.class.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{fmt(structure.totalAmount)}</p>
            <p className="text-xs text-slate-500">{structure.items?.length ?? 0} items</p>
          </div>
          {structure.isActive ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 px-3 py-1 text-xs font-semibold">
              Inactive
            </span>
          )}
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-5 pb-4">
          <div className="mt-4 space-y-2">
            {structure.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40"
              >
                <div className="flex items-center gap-3">
                  {item.isOptional && (
                    <CheckSquare className="h-4 w-4 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {item.feeCategory?.name}
                    </p>
                    {item.dueDate && (
                      <p className="text-xs text-slate-500">Due: {new Date(item.dueDate).toLocaleDateString('en-IN')}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.isOptional && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md">
                      Optional
                    </span>
                  )}
                  <span className="font-bold text-slate-900 dark:text-white">{fmt(item.amount)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-sm font-semibold text-slate-500">Total Amount</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{fmt(structure.totalAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const FeeStructures: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  const { data: structures, isLoading } = useFeeStructures();
  const { data: categories } = useFeeCategories();
  const createMutation = useCreateStructure();

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<StructureFormData>({
    defaultValues: {
      name: '',
      academicYear: '2025-2026',
      items: [{ feeCategoryId: '', amount: '', dueDate: '', isOptional: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const watchedItems = watch('items');
  const total = watchedItems.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);

  const onSubmit = (data: StructureFormData) => {
    createMutation.mutate(
      {
        name: data.name,
        academicYear: data.academicYear,
        classId: data.classId || undefined,
        items: data.items.map((item) => ({
          feeCategoryId: item.feeCategoryId,
          amount: parseFloat(item.amount),
          dueDate: item.dueDate || undefined,
          isOptional: item.isOptional,
        })),
      },
      {
        onSuccess: () => {
          setShowForm(false);
          reset();
        },
      }
    );
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fee Structures</h2>
          <p className="text-sm text-slate-500 mt-0.5">Define fee structures with itemised components.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Create Structure'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <ListTree className="h-5 w-5 text-blue-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">New Fee Structure</h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Structure Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grade 10 Annual Fee"
                  className={inputCls}
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025-2026"
                  className={inputCls}
                  {...register('academicYear', { required: true })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Class <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Class ID (optional)"
                  className={inputCls}
                  {...register('classId')}
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Fee Line Items</label>
                <button
                  type="button"
                  onClick={() => append({ feeCategoryId: '', amount: '', dueDate: '', isOptional: false })}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Item
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="grid grid-cols-12 gap-0 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/40 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="col-span-4">Category</span>
                  <span className="col-span-3">Amount (₹)</span>
                  <span className="col-span-3">Due Date</span>
                  <span className="col-span-1 text-center">Opt.</span>
                  <span className="col-span-1" />
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
                  >
                    <div className="col-span-4">
                      <select
                        className={inputCls}
                        {...register(`items.${index}.feeCategoryId`, { required: true })}
                      >
                        <option value="">-- Select --</option>
                        {categories?.filter((c) => c.isActive).map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className={`${inputCls} pl-8`}
                          {...register(`items.${index}.amount`, { required: true, min: 0 })}
                        />
                      </div>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="date"
                        className={inputCls}
                        {...register(`items.${index}.dueDate`)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary accent-primary"
                        {...register(`items.${index}.isOptional`)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total & Submit */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500 font-medium">Computed Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {fmt(total)}
                </p>
              </div>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Structure'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Structure Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse shimmer" />
          ))}
        </div>
      ) : !structures?.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/30 p-16 flex flex-col items-center gap-3">
          <ListTree className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 font-medium">No fee structures configured</p>
          <p className="text-slate-400 text-xs text-center max-w-xs">
            Create a fee structure to define what fees apply to students and when they are due.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {structures.map((s) => (
            <StructureCard key={s.id} structure={s} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeeStructures;
