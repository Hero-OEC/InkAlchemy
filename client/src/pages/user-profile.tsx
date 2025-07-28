import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { User, Mail, Link2, Upload, Trash2, ArrowLeft, ExternalLink } from "lucide-react";

export default function UserProfile() {
  const [, setLocation] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();

  // Set page title
  document.title = "User Profile | InkAlchemy";

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/user/delete-account", {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      // Sign out and redirect to welcome page
      signOut();
      setLocation("/");
    },
    onError: (error) => {
      console.error("Failed to delete account:", error);
    },
  });

  const updateProfileImageMutation = useMutation({
    mutationFn: async (imageFile: File) => {
      const formData = new FormData();
      formData.append("image", imageFile);
      
      const response = await fetch("/api/user/update-profile-image", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile image");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      setSelectedImage(null);
    },
    onError: (error) => {
      console.error("Failed to update profile image:", error);
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleImageUpload = async () => {
    if (selectedImage) {
      setIsUploadingImage(true);
      try {
        await updateProfileImageMutation.mutateAsync(selectedImage);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.user_metadata?.username || 
           user.user_metadata?.display_name || 
           user.user_metadata?.full_name || 
           user.email?.split('@')[0] || 
           "User";
  };

  const getUserAvatarUrl = () => {
    return user?.user_metadata?.avatar_url || null;
  };

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={false}
        currentPage="profile"
        onNavigate={() => {}}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setLocation("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Profile Header */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-4">
            {/* User Icon */}
            <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            
            {/* User Info */}
            <div>
              <h1 className="text-3xl font-bold text-brand-950">User Profile</h1>
              <p className="text-brand-600 mt-1">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Account Information */}
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-brand-950 mb-6">Account Information</h2>
              
              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-brand-900 mb-2">
                    <User className="w-4 h-4" />
                    Username
                  </label>
                  <div className="bg-brand-100 border border-brand-200 rounded-lg p-3">
                    <p className="text-brand-700">{getUserDisplayName()}</p>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-brand-900 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <div className="bg-brand-100 border border-brand-200 rounded-lg p-3">
                    <p className="text-brand-700">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FandomWiki Connection */}
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-brand-950 mb-6 flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                FandomWiki Integration
              </h2>
              
              <div className="bg-brand-100 border border-brand-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-300 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-brand-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-brand-900">Connect to FandomWiki</h3>
                    <p className="text-sm text-brand-600">Link your InkAlchemy account with FandomWiki to sync your world data</p>
                  </div>
                </div>
              </div>

              <div className="text-center py-6">
                <p className="text-brand-600 mb-4">FandomWiki integration is coming soon!</p>
                <Button variant="outline" disabled>
                  Connect Account
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar (1/3) */}
          <div className="space-y-6">
            
            {/* Profile Image */}
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-brand-950 mb-4">Profile Image</h3>
              
              {/* Current Image Display */}
              <div className="mb-4">
                {getUserAvatarUrl() ? (
                  <img 
                    src={getUserAvatarUrl()!} 
                    alt="Profile" 
                    className="w-full h-48 object-cover rounded-lg border border-brand-200"
                  />
                ) : (
                  <div className="w-full h-48 bg-brand-100 border border-brand-200 rounded-lg flex items-center justify-center">
                    <User className="w-16 h-16 text-brand-400" />
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <input
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
                    onClick={handleImageUpload}
                    disabled={isUploadingImage}
                    className="w-full flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploadingImage ? "Uploading..." : "Update Image"}
                  </Button>
                )}
              </div>
            </div>

            {/* Delete Account */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </h3>
              
              <p className="text-sm text-red-700 mb-4">
                This action cannot be undone. This will permanently delete your account and all associated data including projects, characters, locations, and all other content.
              </p>
              
              <Button 
                variant="danger"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Account Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data including projects, characters, locations, and all other content."
        confirmText="Delete Account"
        isLoading={deleteAccountMutation.isPending}
      />
    </div>
  );
}