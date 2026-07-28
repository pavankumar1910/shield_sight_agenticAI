import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, Edit2, Save, X, Camera, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useHistoryStore } from '../stores/historyStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { showToast } from '../components/ui/Toast';
import axios from 'axios';

export const Profile = () => {
  const { user, updateUserProfile, lastUpdated } = useAuthStore();
  const { getStats } = useHistoryStore();
  const stats = getStats();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user, lastUpdated]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use fallback if env var is missing during local dev
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';
      const response = await axios.post(`${baseUrl}/user/upload-avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const photoURL = response.data.url;
      await updateUserProfile(user?.displayName || '', photoURL);
      showToast('success', 'Avatar updated successfully!');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      showToast('error', 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    try {
      await updateUserProfile(user?.displayName || '', '');
      showToast('success', 'Avatar removed');
    } catch (error) {
      console.error('Failed to remove avatar:', error);
      showToast('error', 'Failed to remove avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      showToast('error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile(displayName);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.displayName || '');
    setIsEditing(false);
  };

  const memberSince = user?.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    : 'Unknown';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account information
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-background shadow-xl">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.displayName?.charAt(0).toUpperCase() || 'U'
                    )}

                    {uploading && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                    title="Change Avatar"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Profile Picture</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a square image for best results.
                  </p>
                  <Button
                    size="sm"
                    variant="link"
                    className="px-0 h-auto text-primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    Change Picture
                  </Button>
                  {user?.photoURL && (
                    <Button
                      size="sm"
                      variant="link"
                      className="px-0 h-auto text-red-500 hover:text-red-600 ml-3"
                      onClick={handleRemoveAvatar}
                      disabled={uploading}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Display Name
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!isEditing || loading}
                    placeholder="Enter your name"
                  />
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="flex-shrink-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-shrink-0"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        disabled={loading}
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </label>
                <Input
                  type="text"
                  value={memberSince}
                  disabled
                  className="bg-muted"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Usage Stats */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Scans</span>
                <span className="text-lg font-bold text-foreground">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="text-lg font-bold text-foreground">{stats.thisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Threats Found</span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {stats.phishing}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="glass bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Free Plan</p>
                  <p className="text-sm text-muted-foreground">
                    Unlimited URL scans and batch analysis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};