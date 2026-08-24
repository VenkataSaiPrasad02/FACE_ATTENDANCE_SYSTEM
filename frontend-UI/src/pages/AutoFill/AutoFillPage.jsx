import React, { useEffect, useState } from 'react';
import {
  Plus,
  Sparkles,
  BookOpen,
  CalendarRange,
  Calendar,
  Layers,
  Pencil,
  Trash2,
  CheckCircle2,
  Power,
} from 'lucide-react';
import { toast } from 'react-toastify';

import autoFillService from '../../services/autoFillService';
import AnimatedGradientBackground from '../../components/ui/AnimatedGradientBackground';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

const emptyForm = {
  name: '',
  course: '',
  batch: '',
  year: '',
  semester: '',
  active: false,
};

export default function AutoFillPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formModal, setFormModal] = useState(null); // null | 'create' | config object
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activatingId, setActivatingId] = useState(null);

  const load = async () => {
    try {
      setError('');
      const data = await autoFillService.getAll();
      setConfigs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load auto-fill configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setFormModal('create');
  };

  const openEdit = (config) => {
    setForm({
      name: config.name || '',
      course: config.course || '',
      batch: config.batch || '',
      year: config.year || '',
      semester: config.semester || '',
      active: Boolean(config.active),
    });
    setFormModal(config);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (formModal === 'create') {
        await autoFillService.create(form);
        toast.success('Auto-fill configuration created');
      } else {
        await autoFillService.update(formModal.id, form);
        toast.success('Auto-fill configuration updated — applies to future students only');
      }
      setFormModal(null);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Unable to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (config) => {
    setActivatingId(config.id);
    try {
      await autoFillService.activate(config.id);
      toast.success(`"${config.name}" is now the default preset`);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Unable to activate configuration');
    } finally {
      setActivatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await autoFillService.remove(deleteTarget.id);
      toast.success('Configuration deleted');
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Unable to delete configuration');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatedGradientBackground className="min-h-full rounded-3xl p-4 sm:p-6" type="students">
      <div className="w-full pb-8 animate-fade-in">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-300 shadow-glow-sm">
              <Sparkles size={12} />
              Bulk Creation Helper
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Manage Auto Fill
            </h1>

            <p className="mt-1 max-w-xl text-xs text-slate-400 sm:text-sm">
              Save common course / batch / year / semester combinations once and
              pre-fill them on the Add Student form. Changes affect future
              student creation only — existing students are never modified.
            </p>
          </div>

          <Button variant="primary" icon={Plus} onClick={openCreate}>
            New Configuration
          </Button>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorState
              title="Failed to load configurations"
              message={error}
              onRetry={load}
            />
          </div>
        )}

        {/* Cards */}
        {!error && loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0d1430]/60"
              />
            ))}
          </div>
        )}

        {!error && !loading && configs.length === 0 && (
          <EmptyState
            icon="GraduationCap"
            title="No auto-fill configurations yet"
            description='Create one like "MCA 2025-2027" to stop typing the same academic details for every student.'
            action={
              <Button variant="secondary" size="sm" icon={Plus} onClick={openCreate}>
                New Configuration
              </Button>
            }
          />
        )}

        {!error && !loading && configs.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {configs.map((config) => (
              <div
                key={config.id}
                className={`group relative overflow-hidden rounded-2xl border p-5 shadow-card backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 ${
                  config.active
                    ? 'border-cyan-300/30 bg-gradient-to-br from-[#101a3f]/90 via-[#0c1430]/85 to-[#0a1229]/80'
                    : 'border-white/[0.08] bg-[#0d1430]/55 hover:border-white/[0.14]'
                }`}
              >
                {config.active && (
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-300">
                    <CheckCircle2 size={11} />
                    DEFAULT
                  </span>
                )}

                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-300/25 bg-violet-400/10 text-violet-300 shadow-glow-sm">
                    <Sparkles size={16} />
                  </div>
                  <div className="min-w-0 pr-14">
                    <h3 className="truncate font-display text-sm font-bold text-white">
                      {config.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Auto-fill preset #{config.id}
                    </p>
                  </div>
                </div>

                <dl className="space-y-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-[11px]">
                  <ConfigRow icon={BookOpen} label="Course" value={config.course} />
                  <ConfigRow icon={CalendarRange} label="Batch" value={config.batch} />
                  <ConfigRow icon={Calendar} label="Year" value={config.year} />
                  <ConfigRow icon={Layers} label="Semester" value={config.semester} />
                </dl>

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Pencil}
                    onClick={() => openEdit(config)}
                  >
                    Edit
                  </Button>

                  {!config.active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Power}
                      loading={activatingId === config.id}
                      onClick={() => handleActivate(config)}
                    >
                      Set Default
                    </Button>
                  )}

                  <Button
                    variant="dangerGhost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setDeleteTarget(config)}
                    className="ml-auto"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={Boolean(formModal)}
        onClose={() => setFormModal(null)}
        title={formModal === 'create' ? 'New Auto Fill Configuration' : 'Edit Auto Fill Configuration'}
        description="These values will pre-fill the Add Student form."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Field
            label="Configuration Name"
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. MCA 2025-2027"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Course"
              required
              name="course"
              value={form.course}
              onChange={handleChange}
              placeholder="e.g. MCA"
            />
            <Field
              label="Batch"
              required
              name="batch"
              value={form.batch}
              onChange={handleChange}
              placeholder="e.g. 2025-2027"
            />
            <Field
              label="Year"
              required
              name="year"
              value={form.year}
              onChange={handleChange}
              placeholder="e.g. 1st Year"
            />
            <Field
              label="Semester"
              required
              name="semester"
              value={form.semester}
              onChange={handleChange}
              placeholder="e.g. 2nd Semester"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="h-4 w-4 accent-cyan-400"
            />
            <span className="text-xs font-medium text-slate-300">
              Make this the default preset on the Add Student form
            </span>
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setFormModal(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              {formModal === 'create' ? 'Save Configuration' : 'Update Configuration'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Delete auto-fill configuration?"
        message={`"${deleteTarget?.name}" will no longer be available on the Add Student form. Existing students are not affected.`}
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AnimatedGradientBackground>
  );
}

function ConfigRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-1.5 font-semibold text-slate-500">
        <Icon size={12} />
        {label}
      </dt>
      <dd className="truncate font-semibold text-slate-200">{value || '—'}</dd>
    </div>
  );
}

function Field({ label, required, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="flex h-10 w-full items-center rounded-xl border border-white/10 bg-[#0a1026]/80 px-3 text-xs font-medium text-slate-100 outline-none transition-all duration-150 placeholder:text-slate-600 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10 sm:text-sm"
      />
    </div>
  );
}
