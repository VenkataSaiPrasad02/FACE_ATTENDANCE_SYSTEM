import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Mail, Pencil, ShieldCheck, Trash2, User, Users, X } from 'lucide-react';
import userService from '../../services/userService';
import ProfileAvatar from '../../components/ProfileAvatar';

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', fullName: '', password: '', confirmPassword: '' });

  // Edit modal state
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '' });
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirmation state
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deletingInProgress, setDeletingInProgress] = useState(false);

  // Backend already returns admins sorted alphabetically by
  // username — no frontend re-sort needed.
  const loadAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const data = await userService.getAllAdmins();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load admins.');
    } finally { setLoadingAdmins(false); }
  };

  useEffect(() => { loadAdmins(); }, []);
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const createAdmin = async (event) => {
    event.preventDefault(); setError(''); setSuccess('');
    if (loadingCreate) return; // prevent duplicate submission
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setLoadingCreate(true);
    try {
      const data = await userService.createAdmin({
        username: form.username.trim(), email: form.email.trim(), fullName: form.fullName.trim(),
        password: form.password, confirmPassword: form.confirmPassword,
      });
      setSuccess(data?.message || 'Admin account created successfully.');
      setForm({ username: '', email: '', fullName: '', password: '', confirmPassword: '' });
      await loadAdmins();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Unable to create the admin account.');
    } finally { setLoadingCreate(false); }
  };

  // ---------------- Edit Admin ----------------
  const openEdit = (admin) => {
    setEditingAdmin(admin);
    setEditForm({ fullName: admin.fullName || '', email: admin.email || '' });
    setEditError('');
  };
  const closeEdit = () => { if (!savingEdit) { setEditingAdmin(null); setEditError(''); } };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (savingEdit || !editingAdmin) return; // prevent duplicate submission
    if (!editForm.fullName.trim() || !editForm.email.trim()) {
      setEditError('Full name and email are required.');
      return;
    }
    setSavingEdit(true); setEditError('');
    try {
      await userService.updateAdmin(editingAdmin.id, {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
      });
      setSuccess('Admin updated successfully.');
      setEditingAdmin(null);
      await loadAdmins();
    } catch (err) {
      setEditError(err?.response?.data?.message || err?.response?.data?.error || 'Unable to update the admin account.');
    } finally { setSavingEdit(false); }
  };

  // ---------------- Delete Admin ----------------
  const openDelete = (admin) => { setDeletingAdmin(admin); setDeleteError(''); };
  const closeDelete = () => { if (!deletingInProgress) { setDeletingAdmin(null); setDeleteError(''); } };

  const confirmDelete = async () => {
    if (deletingInProgress || !deletingAdmin) return; // prevent double-delete
    setDeletingInProgress(true); setDeleteError('');
    try {
      await userService.deleteAdmin(deletingAdmin.id);
      setDeletingAdmin(null);
      setSuccess('Admin deleted successfully.');
      await loadAdmins();
    } catch (err) {
      setDeleteError(err?.response?.data?.message || err?.response?.data?.error || 'Unable to delete the admin account.');
    } finally { setDeletingInProgress(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50"><ShieldCheck size={24} className="text-blue-600" /></div>
        <div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Management</h1><p className="mt-1 text-sm text-slate-500">Create, edit, and remove administrator accounts.</p></div>
      </div>
      {error && <AlertBox message={error} />}{success && <SuccessBox message={success} />}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-6"><h2 className="text-lg font-bold text-slate-900">Create Admin</h2><p className="mt-1 text-xs leading-5 text-slate-500">Only the Super Admin should access this screen.</p></div>
          <form onSubmit={createAdmin} className="space-y-4">
            <Field icon={User} label="Username" value={form.username} onChange={(v) => updateField('username', v)} placeholder="admin01" />
            <Field icon={Mail} label="Email" type="email" value={form.email} onChange={(v) => updateField('email', v)} placeholder="admin@example.com" />
            <Field icon={User} label="Full name" value={form.fullName} onChange={(v) => updateField('fullName', v)} placeholder="Admin Name" />
            <PasswordField label="Password" value={form.password} onChange={(v) => updateField('password', v)} show={showPassword} setShow={setShowPassword} />
            <PasswordField label="Confirm password" value={form.confirmPassword} onChange={(v) => updateField('confirmPassword', v)} show={showConfirm} setShow={setShowConfirm} />
            <button disabled={loadingCreate} className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
              {loadingCreate ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Creating...</> : <><ShieldCheck size={18} /> Create Admin</>}
            </button>
          </form>
        </motion.section>
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div><h2 className="text-lg font-bold text-slate-900">Administrator Accounts</h2><p className="mt-1 text-xs text-slate-500">{admins.length} account{admins.length === 1 ? '' : 's'} · A–Z</p></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Users size={18} /></div>
          </div>
          {loadingAdmins ? (
            <div className="space-y-3 p-6">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div>
          ) : admins.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">No administrator accounts found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {admins.map((admin) => (
                <div key={admin.id ?? admin.username} className="flex items-center gap-4 px-6 py-4">
                  <ProfileAvatar photoUrl={admin.profilePhotoUrl} name={admin.fullName || admin.username} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{admin.fullName || admin.username}</p>
                    <p className="truncate text-xs text-slate-500">{admin.email || 'No email'}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${admin.role === 'SUPER_ADMIN' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                    {admin.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMIN'}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(admin)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                      title="Edit admin"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDelete(admin)}
                      disabled={admin.role === 'SUPER_ADMIN'}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                      title={admin.role === 'SUPER_ADMIN' ? 'Super Admin cannot be deleted' : 'Delete admin'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>

      {/* Edit Admin Modal */}
      <AnimatePresence>
        {editingAdmin && (
          <ModalBackdrop onClose={closeEdit}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Edit Admin</h3>
                <button type="button" onClick={closeEdit} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button>
              </div>
              {editError && <div className="mb-4"><AlertBox message={editError} /></div>}
              <form onSubmit={submitEdit} className="space-y-4">
                <Field icon={User} label="Full name" value={editForm.fullName} onChange={(v) => setEditForm((c) => ({ ...c, fullName: v }))} placeholder="Admin Name" />
                <Field icon={Mail} label="Email" type="email" value={editForm.email} onChange={(v) => setEditForm((c) => ({ ...c, email: v }))} placeholder="admin@example.com" />
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeEdit} className="h-12 flex-1 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                  <button disabled={savingEdit} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                    {savingEdit ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving...</> : 'Save changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </ModalBackdrop>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingAdmin && (
          <ModalBackdrop onClose={closeDelete}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50"><Trash2 size={22} className="text-red-600" /></div>
              <h3 className="text-lg font-bold text-slate-900">Delete this admin?</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Are you sure you want to delete <span className="font-semibold text-slate-700">{deletingAdmin.fullName || deletingAdmin.username}</span>? This action cannot be undone.
              </p>
              {deleteError && <div className="mt-4"><AlertBox message={deleteError} /></div>}
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={closeDelete} className="h-12 flex-1 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deletingInProgress}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingInProgress ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Deleting...</> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalBackdrop({ onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
    >
      {children}
    </motion.div>
  );
}

function Field({ icon: Icon, label, value, onChange, ...props }) { return <div><label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label><div className="group flex h-13 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100"><div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 group-focus-within:text-blue-600"><Icon size={19} /></div><input value={value} onChange={(e) => onChange(e.target.value)} required className="h-full w-full bg-transparent px-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400" {...props} /></div></div>; }
function PasswordField({ label, value, onChange, show, setShow }) { return <div><label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label><div className="group flex h-13 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100"><div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 group-focus-within:text-blue-600"><KeyRound size={19} /></div><input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} required className="h-full w-full bg-transparent px-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400" placeholder="Enter password" autoComplete="new-password" /><button type="button" onClick={() => setShow((value) => !value)} className="flex w-12 items-center justify-center text-slate-400 hover:text-slate-700">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>; }
function AlertBox({ message }) { return <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5"><AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" /><p className="text-xs leading-5 text-red-700">{message}</p></div>; }
function SuccessBox({ message }) { return <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" /><p className="text-xs leading-5 text-emerald-700">{message}</p></div>; }
