import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
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
  const [emailChangeMessage, setEmailChangeMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, signOut, updateEmail } = useAuth();
  const queryClient = useQueryClient();

  // Set page title
  document.title = "Edit Profile | InkAlchemy";

  const getUserDisplayName = () => {
    if (!user) return "User";
    // Prioritize profile data from our API, then fallback to Supabase metadata
    return (profileData as any)?.username || 
           user.user_metadata?.username || 
           user.user_metadata?.display_name || 
           user.user_metadata?.full_name || 
           user.email?.split('@')[0] || 
           "User";
  };

  const { data: profileData, error: profileError } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: 0, // Always fetch fresh profile data
    enabled: !!user, // Only fetch when user is authenticated
  });

  const getUserAvatarUrl = () => {
    return (profileData as any)?.avatar_url || user?.user_metadata?.avatar_url || null;
  };

  const form = useForm<EditProfileData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: (profileData as any)?.username || getUserDisplayName(),
      email: (profileData as any)?.email || user?.email || '',
    },
  });

  // Update form values when profileData changes
  useEffect(() => {
    if (profileData) {
      form.reset({
        username: (profileData as any).username || getUserDisplayName(),
        email: (profileData as any).email || user?.email || '',
      });
    }
  }, [profileData, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: EditProfileData) => {
      // Handle email change separately if it's different
      const currentEmail = user?.email;
      if (data.email !== currentEmail) {
        const { error } = await updateEmail(data.email);
        if (error) {
          throw new Error(error.message || 'Failed to update email');
        }
        setEmailChangeMessage(
          'Email change confirmation emails have been sent to both your old and new email addresses. Please check both inboxes and click the confirmation links to complete the email change.'
        );
      }

      // Update other profile data using apiRequest to include auth headers
      return await apiRequest('/api/user/update-profile', {
        method: 'PATCH',
        body: JSON.stringify({ username: data.username }),
      });
    },
    onSuccess: () => {
      // Invalidate profile cache to refresh the display
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      if (!emailChangeMessage) {
        setLocation('/profile');
      }
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

              {emailChangeMessage && (
                <div className="bg-brand-100 border border-brand-300 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-brand-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-brand-900 mb-1">Email Change Confirmation Required</h3>
                      <p className="text-brand-700 text-sm">{emailChangeMessage}</p>
                    </div>
                  </div>
                </div>
              )}

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
                  className="hidden"
                />
                
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </Button>

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