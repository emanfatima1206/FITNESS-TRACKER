import { useState, useEffect, useRef } from 'react';
import { Edit2, Camera, User, Mail, Calendar, Ruler, Weight, Shield, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    profilePic: user?.profilePic || '',
    age: user?.age || '',
    gender: user?.gender || 'Prefer not to say',
    height: user?.height || '',
    weight: user?.weight || '',
  });

  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        profilePic: user.profilePic || '',
        age: user.age || '',
        gender: user.gender || 'Prefer not to say',
        height: user.height || '',
        weight: user.weight || '',
      });
    }
  }, [user]);

  const f = (k) => ({
    value: form[k] !== undefined ? form[k] : '',
    onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  const pf = (k) => ({
    value: pwdForm[k],
    onChange: (e) => setPwdForm((p) => ({ ...p, [k]: e.target.value })),
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return alert('Please select an image smaller than 5MB.');
    }

    // Upload to Cloudinary via backend /api/auth/upload-avatar
    try {
      setSaving(true);
      setStatusMsg({ type: '', text: '' });
      const formData = new FormData();
      formData.append('image', file);
      const res = await userApi.uploadAvatar(formData);
      if (res?.user) {
        updateUser(res.user);
        setStatusMsg({ type: 'success', text: 'Profile photo uploaded successfully!' });
      } else if (res?.profilePic) {
        updateUser({ profilePic: res.profilePic });
        setStatusMsg({ type: 'success', text: 'Profile photo uploaded successfully!' });
      } else {
        setStatusMsg({ type: 'success', text: 'Profile photo updated successfully!' });
      }
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to upload photo. Please try again.' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000);
    } finally {
      setSaving(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await userApi.updateProfile({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        profilePic: form.profilePic,
        age: form.age ? Number(form.age) : null,
        gender: form.gender,
        height: form.height ? Number(form.height) : null,
        weight: form.weight ? Number(form.weight) : null,
      });

      if (res?.user) {
        updateUser(res.user);
      } else if (res) {
        updateUser(res);
      }
      setEditOpen(false);
      setStatusMsg({ type: 'success', text: 'Profile updated in database successfully!' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwdForm.currentPassword) {
      return setPwdMsg({ type: 'error', text: 'Please enter your current password.' });
    }
    if (pwdForm.newPassword.length < 6) {
      return setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
    }
    if (pwdForm.newPassword !== pwdForm.confirm) {
      return setPwdMsg({ type: 'error', text: 'Passwords do not match.' });
    }

    try {
      setSaving(true);
      await userApi.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => {
        setPwdMsg({ type: '', text: '' });
        setPwdOpen(false);
        setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
      }, 1500);
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setSaving(false);
    }
  };

  const infoFields = [
    { label: 'Username', value: `@${user?.username || '—'}`, icon: User },
    { label: 'Email', value: user?.email || '—', icon: Mail },
    { label: 'Age', value: user?.age ? `${user.age} years` : '—', icon: Calendar },
    { label: 'Gender', value: user?.gender || '—', icon: User },
    { label: 'Height', value: user?.height ? `${user.height} cm` : '—', icon: Ruler },
    { label: 'Current Weight', value: user?.weight ? `${user.weight} kg` : '—', icon: Weight },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Profile</h1>
          <p>Personal account information and measurements synchronized with MongoDB</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditOpen(true)}>
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      {statusMsg.text && (
        <div
          style={{
            background: statusMsg.type === 'success' ? 'var(--color-primary-lighter)' : 'var(--color-danger-light)',
            border: `1px solid ${statusMsg.type === 'success' ? 'var(--color-primary-light)' : '#fecaca'}`,
            borderRadius: 'var(--radius)',
            padding: '12px 16px',
            marginBottom: 20,
            color: statusMsg.type === 'success' ? 'var(--color-primary-dark)' : 'var(--color-danger)',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid-cols-3" style={{ alignItems: 'start' }}>
        {/* Profile Avatar Card */}
        <div className="card" style={{ gridColumn: '1', textAlign: 'center' }}>
          <div className="card-body" style={{ padding: '32px 24px' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
              <div
                className="avatar avatar-2xl avatar-green"
                style={{
                  margin: '0 auto',
                  overflow: 'hidden',
                  border: '3px solid var(--color-primary)',
                  boxShadow: 'var(--neu-shadow)',
                }}
              >
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user?.name || 'User avatar'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'
                )}
              </div>

              {/* Hidden file input for photo upload */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handlePhotoUpload}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 32,
                  height: 32,
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
                title="Upload or Change Photo"
              >
                <Camera size={16} />
              </button>
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{user?.name || user?.username}</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>
              @{user?.username}
            </p>
            <div style={{ display: 'inline-block' }}>
              <span className="badge badge-green">Verified Member</span>
            </div>

            <div className="divider" style={{ margin: '20px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Height', value: user?.height ? `${user.height} cm` : '—' },
                { label: 'Weight', value: user?.weight ? `${user.weight} kg` : '—' },
                { label: 'Age', value: user?.age ? `${user.age} yrs` : '—' },
                { label: 'Gender', value: user?.gender || '—' },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: 'var(--color-bg)',
                    borderRadius: 'var(--radius)',
                    padding: '12px 8px',
                    boxShadow: 'var(--neu-shadow-sm)',
                  }}
                >
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details & Security */}
        <div style={{ gridColumn: '2 / span 2', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Personal Information */}
          <div className="card">
            <div className="card-header">
              <h3>Personal Information</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setEditOpen(true)}>
                <Edit2 size={14} /> Edit
              </button>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div className="form-label">Full Name</div>
                  <div style={{ fontSize: '0.9375rem', color: 'var(--color-text)', fontWeight: 500, marginTop: 4 }}>
                    {user?.name || '—'}
                  </div>
                </div>
                {infoFields.map((field) => (
                  <div key={field.label} className="form-group" style={{ marginBottom: 0 }}>
                    <div className="form-label">{field.label}</div>
                    <div
                      style={{
                        fontSize: '0.9375rem',
                        color: 'var(--color-text)',
                        fontWeight: 500,
                        marginTop: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={18} color="var(--color-primary)" />
                <h3>Account Security</h3>
              </div>
            </div>
            <div className="card-body">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border-light)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Password</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Secured with bcrypt hashing
                  </div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => setPwdOpen(true)}>
                  Change Password
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>JWT Token Session</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Validated with authorization middleware
                  </div>
                </div>
                <span className="badge badge-green">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-control" placeholder="Alex Johnson" {...f('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input type="text" className="form-control" placeholder="alexj" {...f('username')} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input type="email" className="form-control" placeholder="you@example.com" {...f('email')} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input type="number" className="form-control" placeholder="28" min="10" max="120" {...f('age')} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-control" {...f('gender')}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input type="number" className="form-control" placeholder="178" min="50" max="250" {...f('height')} />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input
                type="number"
                className="form-control"
                placeholder="75"
                min="20"
                max="300"
                step="0.1"
                {...f('weight')}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={pwdOpen}
        onClose={() => {
          setPwdOpen(false);
          setPwdMsg({ type: '', text: '' });
        }}
        title="Change Password"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setPwdOpen(false);
                setPwdMsg({ type: '', text: '' });
              }}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handlePasswordChange} disabled={saving}>
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </>
        }
      >
        <form onSubmit={handlePasswordChange}>
          {pwdMsg.text && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius)',
                marginBottom: 16,
                fontSize: '0.875rem',
                fontWeight: 500,
                background: pwdMsg.type === 'success' ? 'var(--color-primary-lighter)' : 'var(--color-danger-light)',
                color: pwdMsg.type === 'success' ? 'var(--color-primary-dark)' : 'var(--color-danger)',
              }}
            >
              {pwdMsg.text}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Current Password *</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter current password"
              {...pf('currentPassword')}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Password *</label>
            <input
              type="password"
              className="form-control"
              placeholder="Min. 6 characters"
              {...pf('newPassword')}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password *</label>
            <input
              type="password"
              className="form-control"
              placeholder="Repeat new password"
              {...pf('confirm')}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
