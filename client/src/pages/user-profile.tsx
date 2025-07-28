import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { User, Mail, Trash2, ArrowLeft, Edit } from "lucide-react";

export default function UserProfile() {
  const [, setLocation] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

        {/* Character Header */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Profile Icon */}
              <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              
              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold text-brand-950">{getUserDisplayName()}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700">
                    <Mail className="w-3 h-3 mr-1" />
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="primary" 
                onClick={() => setLocation("/profile/edit")}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content (2/3) */}
          <div className="lg:col-span-2">
            
            {/* Account Details */}
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-brand-950 mb-6">Account Details</h2>
              
              <div className="space-y-6">
                {/* Username Section */}
                <div>
                  <h3 className="text-lg font-semibold text-brand-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Username
                  </h3>
                  <p className="text-brand-700 leading-relaxed">{getUserDisplayName()}</p>
                </div>

                {/* Email Section */}
                <div>
                  <h3 className="text-lg font-semibold text-brand-900 mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Address
                  </h3>
                  <p className="text-brand-700 leading-relaxed">{user.email}</p>
                </div>


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
                    className="w-full aspect-square object-cover rounded-lg border border-brand-200"
                  />
                ) : (
                  <div className="w-full aspect-square bg-brand-100 border border-brand-200 rounded-lg flex items-center justify-center">
                    <User className="w-16 h-16 text-brand-400" />
                  </div>
                )}
              </div>

              <p className="text-sm text-brand-600 text-center">
                Use the Edit Profile button to update your profile image
              </p>
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