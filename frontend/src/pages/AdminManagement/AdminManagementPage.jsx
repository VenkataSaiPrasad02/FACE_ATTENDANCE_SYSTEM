import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Pencil,
  ShieldCheck,
  Trash2,
  User,
  Users,
  UserPlus,
  Shield,
} from 'lucide-react';
import AnimatedGradientBackground from '../../components/ui/AnimatedGradientBackground';
import userService from '../../services/userService';
import ProfileAvatar from '../../components/ProfileAvatar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });

  // Edit modal state
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '' });
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirmation state
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);

  const loadAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const data = await userService.getAllAdmins();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load administrator accounts.');
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const updateField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const createAdmin = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (loadingCreate) return;
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoadingCreate(true);
    try {
      const data = await userService.createAdmin({
        username: form.username.trim(),
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(data?.message || 'Admin account created successfully.');
      setForm({
        username: '',
        email: '',
        fullName: '',
        password: '',
        confirmPassword: '',
      });
      await loadAdmins();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to create the admin account.'
      );
    } finally {
      setLoadingCreate(false);
    }
  };

  // Edit Admin
  const openEdit = (admin) => {
    setEditingAdmin(admin);
    setEditForm({
      fullName: admin.fullName || '',
      email: admin.email || '',
    });
    setEditError('');
  };

  const closeEdit = () => {
    if (!savingEdit) {
      setEditingAdmin(null);
      setEditError('');
    }
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (savingEdit || !editingAdmin) return;
    if (!editForm.fullName.trim() || !editForm.email.trim()) {
      setEditError('Full name and email are required.');
      return;
    }
    setSavingEdit(true);
    setEditError('');
    try {
      await userService.updateAdmin(editingAdmin.id, {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
      });
      setSuccess('Admin updated successfully.');
      setEditingAdmin(null);
      await loadAdmins();
    } catch (err) {
      setEditError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to update the admin account.'
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Admin
  const openDelete = (admin) => {
    setDeletingAdmin(admin);
  };

  const confirmDelete = async () => {
    if (deletingInProgress || !deletingAdmin) return;
    setDeletingInProgress(true);
    try {
      await userService.deleteAdmin(deletingAdmin.id);
      setDeletingAdmin(null);
      setSuccess('Admin account removed successfully.');
      await loadAdmins();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to delete the admin account.'
      );
    } finally {
      setDeletingInProgress(false);
    }
  };

  return (
    <AnimatedGradientBackground
  type="admin"
  className="min-h-full rounded-2xl"
>
    <div className="w-full animate-fade-in pb-8">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xs">
            <ShieldCheck size={26} strokeWidth={2} />
          </div>

          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Access Governance
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Administrator Management
            </h1>

            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Super Admin terminal: Provision, configure, and audit institutional system administrators.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-xs">
          <Shield size={15} className="text-indigo-600" />
          <span>Root Privilege Area</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 shadow-xs animate-fade-in">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 shadow-xs animate-fade-in">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
          <p className="font-semibold">{success}</p>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        {/* Left Column: Create Admin Card */}
        <Card glass className="p-6 sm:p-7">
          <div className="mb-5 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UserPlus size={18} className="text-indigo-600" />
              Provision New Administrator
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Create an administrative user with full management privileges.
            </p>
          </div>

          <form onSubmit={createAdmin} className="space-y-4">
            <Field
              icon={User}
              label="Username"
              value={form.username}
              onChange={(v) => updateField('username', v)}
              placeholder="e.g. admin_cs"
              required
            />

            <Field
              icon={Mail}
              label="Institutional Email"
              type="email"
              value={form.email}
              onChange={(v) => updateField('email', v)}
              placeholder="admin@institution.edu"
              required
            />

            <Field
              icon={User}
              label="Full Administrator Name"
              value={form.fullName}
              onChange={(v) => updateField('fullName', v)}
              placeholder="e.g. Prof. R. K. Sharma"
              required
            />

            <PasswordField
              label="Access Password"
              value={form.password}
              onChange={(v) => updateField('password', v)}
              show={showPassword}
              setShow={setShowPassword}
              placeholder="Minimum 8 characters"
            />

            <PasswordField
              label="Confirm Access Password"
              value={form.confirmPassword}
              onChange={(v) => updateField('confirmPassword', v)}
              show={showConfirm}
              setShow={setShowConfirm}
              placeholder="Re-enter password"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loadingCreate}
                className="w-full shadow-sm font-bold"
              >
                Provision Administrator Account
              </Button>
            </div>
          </form>
        </Card>

        {/* Right Column: Existing Administrators List */}
        <Card glass className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Administrator Accounts
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {admins.length} registered administrator{admins.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={18} />
            </div>
          </div>

          {loadingAdmins ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-shimmer rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : admins.length === 0 ? (
            <div className="p-10 text-center text-xs font-semibold text-slate-400">
              No administrator accounts found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {admins.map((admin) => (
                <div
                  key={admin.id ?? admin.username}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-indigo-50/30"
                >
                  <ProfileAvatar
                    photoUrl={admin.profilePhotoUrl}
                    name={admin.fullName || admin.username}
                    size="md"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs sm:text-sm font-bold text-slate-900">
                      {admin.fullName || admin.username}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {admin.email || `@${admin.username}`}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider ${
                      admin.role === 'SUPER_ADMIN'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {admin.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMIN'}
                  </span>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(admin)}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      title="Edit admin details"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => openDelete(admin)}
                      disabled={admin.role === 'SUPER_ADMIN'}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-20 disabled:cursor-not-allowed"
                      title={
                        admin.role === 'SUPER_ADMIN'
                          ? 'Super Admin cannot be removed'
                          : 'Delete administrator'
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Edit Admin Modal */}
      <Modal
        open={Boolean(editingAdmin)}
        onClose={closeEdit}
        title="Edit Administrator Details"
        size="md"
      >
        {editError && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700 font-semibold">
            {editError}
          </div>
        )}

        <form onSubmit={submitEdit} className="space-y-4">
          <Field
            icon={User}
            label="Full Administrator Name"
            value={editForm.fullName}
            onChange={(v) => setEditForm((c) => ({ ...c, fullName: v }))}
            placeholder="Admin Name"
            required
          />

          <Field
            icon={Mail}
            label="Institutional Email"
            type="email"
            value={editForm.email}
            onChange={(v) => setEditForm((c) => ({ ...c, email: v }))}
            placeholder="admin@example.com"
            required
          />

          <div className="flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={closeEdit}
              disabled={savingEdit}
              className="w-full sm:w-auto font-semibold"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={savingEdit}
              className="w-full sm:w-auto shadow-sm font-bold"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Admin Confirmation Modal */}
      <ConfirmationModal
        open={Boolean(deletingAdmin)}
        title="Delete Administrator Account"
        message={
          deletingAdmin
            ? `Are you sure you want to delete administrator "${deletingAdmin.fullName || deletingAdmin.username}"? They will permanently lose system access.`
            : ''
        }
        confirmText="Delete Admin"
        cancelText="Cancel"
        loading={deletingInProgress}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingAdmin(null)}
      />
    </div>
    </AnimatedGradientBackground>
  );
}

function Field({ icon: Icon, label, value, onChange, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
        <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-slate-100 bg-slate-50/50 text-slate-400">
          <Icon size={16} />
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full bg-transparent px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          {...props}
        />
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, setShow, placeholder }) {
  return (
    <AnimatedGradientBackground
  type="admin"
  className="min-h-full rounded-2xl"
>
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
        <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-slate-100 bg-slate-50/50 text-slate-400">
          <KeyRound size={16} />
        </div>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="h-full w-full bg-transparent px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          placeholder={placeholder}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow((val) => !val)}
          className="flex h-full w-10 shrink-0 items-center justify-center text-slate-400 transition-colors hover:text-slate-700"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
    </AnimatedGradientBackground>
  );
}
