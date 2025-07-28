import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { User, Mail, Upload, ArrowLeft, Save, X } from "lucide-react";
import { FandomLogo } from "@/components/fandom-logo";

const editProfileSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
});

type EditProfileData = z.infer<typeof editProfileSchema>;

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();

  // Set page title
  document.title = "Edit Profile | InkAlchemy";

  const getUserDisplayName = () => {
    if (user?.user_metadata?.username) return user.user_metadata.username;
    if (user?.user_metadata?.display_name) return user.user_metadata.display_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserAvatarUrl = () => {
    return user?.user_metadata?.avatar_url || null;
  };

  const form = useForm<EditProfileData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: getUserDisplayName(),
      email: user?.email || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: EditProfileData) => {
      const response = await fetch('/api/user/update-profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      setLocation('/profile');
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/user/update-profile-image', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload image');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleImageUpload = async () => {
    if (selectedImage) {
      await uploadImageMutation.mutateAsync(selectedImage);
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  };

  const onSubmit = (data: EditProfileData) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    setLocation('/profile');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={false}
        currentPage=""
        onNavigate={() => {}}
        projectName=""
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Profile Header */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Profile Icon */}
              <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold text-brand-950">Edit Profile</h1>
                <p className="text-brand-600 mt-1">Update your account information and preferences</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form Content (2/3) */}
          <div className="lg:col-span-2">

            {/* Account Information Form */}
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-brand-950 mb-6">Account Information</h2>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Username Field */}
                <div>
                  <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-brand-900 mb-2">
                    <User className="w-4 h-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    {...form.register('username')}
                    className="w-full"
                    placeholder="Enter your username"
                  />
                  {form.formState.errors.username && (
                    <p className="text-red-600 text-sm mt-1">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-brand-900 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    className="w-full"
                    placeholder="Enter your email address"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-600 text-sm mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Profile Image (1/3) */}
          <div className="space-y-6">

            {/* Profile Image Upload */}
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-brand-950 mb-4">Profile Image</h3>

              {/* Current/Preview Image Display */}
              <div className="mb-4">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full aspect-square object-cover rounded-lg border border-brand-200"
                  />
                ) : getUserAvatarUrl() ? (
                  <img 
                    src={getUserAvatarUrl()!} 
                    alt="Profile" 
                    className="w-full aspect-square object-cover rounded-lg border border-brand-200"
                  />
                ) : (
                  <div className="w-full aspect-square bg-brand-100 border border-brand-200 rounded-lg flex items-center justify-center">
                    <User className="w-16 h-16 text-brand-400" />
                  </div>
                )}
              </div>

              {/* Image Upload Controls */}
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-brand-600
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-brand-100 file:text-brand-700
                    hover:file:bg-brand-200"
                />

                {selectedImage && (
                  <Button 
                    variant="outline"
                    onClick={handleImageUpload}
                    disabled={uploadImageMutation.isPending}
                    className="w-full flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadImageMutation.isPending ? "Uploading..." : "Upload Image"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}