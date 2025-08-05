import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { EditorContentRenderer } from "@/components/editor-content-renderer";
import { LoreDetailsHeaderSkeleton, LoreDetailsContentSkeleton } from "@/components/skeleton";
import { ArrowLeft, Edit, Trash2, BookOpen, Crown, Scroll, Landmark, Sword, Users, Globe, Calendar } from "lucide-react";
import type { Project, LoreEntry } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

// Lore category config
const LORE_CATEGORY_CONFIG = {
  history: { icon: Calendar, label: "History", bgColor: "bg-brand-500", textColor: "text-white" },
  culture: { icon: Users, label: "Culture", bgColor: "bg-brand-500", textColor: "text-white" },
  religion: { icon: Landmark, label: "Religion", bgColor: "bg-brand-500", textColor: "text-white" },
  politics: { icon: Crown, label: "Politics", bgColor: "bg-brand-500", textColor: "text-white" },
  geography: { icon: Globe, label: "Geography", bgColor: "bg-brand-500", textColor: "text-white" },
  technology: { icon: Sword, label: "Technology", bgColor: "bg-brand-500", textColor: "text-white" },
  magic: { icon: Scroll, label: "Magic", bgColor: "bg-brand-500", textColor: "text-white" },
  language: { icon: BookOpen, label: "Language", bgColor: "bg-brand-500", textColor: "text-white" },
  other: { icon: BookOpen, label: "Other", bgColor: "bg-brand-500", textColor: "text-white" }
};

export default function LoreDetails() {
  const { projectId, loreId } = useParams();
  const [, setLocation] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: lore, isLoading: loreLoading } = useQuery<LoreEntry>({
    queryKey: [`/api/lore/${loreId}`],
    enabled: !!loreId && loreId !== "new" && !isNaN(Number(loreId)),
    staleTime: 0
  });

  // Check if any core data is still loading
  const isLoading = projectLoading || loreLoading;

  // Set page title
  useEffect(() => {
    if (lore?.title && project?.name) {
      document.title = `${lore.title} - ${project.name} | InkAlchemy`;
    } else if (lore?.title) {
      document.title = `${lore.title} | InkAlchemy`;
    } else {
      document.title = "Lore Details | InkAlchemy";
    }
  }, [lore?.title, project?.name]);

  // Redirect if this is the create route
  useEffect(() => {
    if (loreId === "new") {
      setLocation(`/projects/${projectId}/lore/new`);
      return;
    }
  }, [loreId, projectId, setLocation]);

  // Don't render anything if this is the "new" route
  if (loreId === "new") {
    return null;
  }

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/lore`);
  };

  const handleEdit = () => {
    setLocation(`/projects/${projectId}/lore/${loreId}/edit`);
  };

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest(`/api/lore/${loreId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/lore`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/stats`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/activities`] });
      setLocation(`/projects/${projectId}/lore`);
    },
    onError: (error) => {
      console.error('Error deleting lore:', error);
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="lore"
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Back Button Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="md"
              className="flex items-center gap-2"
              disabled
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Lore
            </Button>
          </div>

          {/* Lore Header Skeleton */}
          <LoreDetailsHeaderSkeleton />

          {/* Main Content Skeleton */}
          <LoreDetailsContentSkeleton />
        </main>
      </div>
    );
  }

  if (!lore) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="lore"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Lore entry not found</p>
        </div>
      </div>
    );
  }

  const config = LORE_CATEGORY_CONFIG[lore.category as keyof typeof LORE_CATEGORY_CONFIG] || LORE_CATEGORY_CONFIG.other;
  const Icon = config.icon;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="lore"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lore
          </Button>
        </div>

        {/* Lore Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${config.bgColor}`}>
              <Icon size={24} className={config.textColor} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-950 mb-2">{lore.title}</h1>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor} capitalize`}>
                  {config.label}
                </span>
                {lore.updatedAt && (
                  <span className="text-sm text-brand-500">
                    Updated {format(new Date(lore.updatedAt), "MMM d, yyyy")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={handleEdit} className="flex items-center gap-2">
              <Edit size={16} />
              Edit
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteDialog(true)} className="flex items-center gap-2">
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
          {lore.content ? (
            (() => {
              try {
                // Try to parse as JSON first (new format from WordProcessor)
                const parsedData = JSON.parse(lore.content);
                return <EditorContentRenderer data={parsedData} />;
              } catch {
                // Fallback to plain text display (old format)
                return (
                  <div className="prose prose-brand max-w-none">
                    <p className="text-brand-700 leading-relaxed">{lore.content}</p>
                  </div>
                );
              }
            })()
          ) : (
            <p className="text-brand-700 leading-relaxed">No content available</p>
          )}
        </div>

        {/* Metadata */}
        {lore.createdAt && (
          <div className="mt-6 text-center text-sm text-brand-500">
            Created {format(new Date(lore.createdAt), "MMM d, yyyy")}
          </div>
        )}
      </main>

      <DeleteConfirmation
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Lore Entry"
        description={`Are you sure you want to delete "${lore?.title}"? This action cannot be undone.`}
        itemName={lore?.title || "this lore entry"}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}