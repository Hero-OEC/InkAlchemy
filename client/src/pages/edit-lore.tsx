import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { LoreForm } from "@/components/lore-form";
import { LoreFormHeaderSkeleton, LoreFormContentSkeleton } from "@/components/skeleton";
import { ArrowLeft, BookOpen, Calendar, Users, Landmark, Crown, Globe, Sword, Scroll } from "lucide-react";
import type { Project, LoreEntry } from "@shared/schema";

// Lore category icons
const LORE_CATEGORY_ICONS = {
  history: Calendar,
  culture: Users,
  religion: Landmark,
  politics: Crown,
  geography: Globe,
  technology: Sword,
  magic: Scroll,
  language: BookOpen,
  other: BookOpen,
};

export default function EditLore() {
  const { projectId, loreId } = useParams();
  const [, setLocation] = useLocation();
  const [currentCategory, setCurrentCategory] = useState<string>("other");

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: lore, isLoading: loreLoading } = useQuery<LoreEntry>({
    queryKey: [`/api/lore/${loreId}`],
    enabled: !!loreId && loreId !== "new" && !isNaN(Number(loreId))
  });

  const isLoading = projectLoading || loreLoading;

  // Set initial category when lore data loads
  useEffect(() => {
    if (lore) {
      setCurrentCategory(lore.category || "other");
    }
  }, [lore]);

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/lore/${loreId}`);
  };

  const handleSuccess = () => {
    setLocation(`/projects/${projectId}/lore/${loreId}`);
  };

  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
  };

  const getCurrentIcon = () => {
    return LORE_CATEGORY_ICONS[currentCategory as keyof typeof LORE_CATEGORY_ICONS] || BookOpen;
  };

  if (isLoading || !lore) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="lore"
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        
        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Header with Back Button Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="md"
              className="flex items-center gap-2"
              disabled
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Lore Entry
            </Button>
          </div>

          {/* Lore Form Skeleton */}
          <LoreFormHeaderSkeleton />
          <LoreFormContentSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="lore"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lore Entry
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-brand-500 p-3 rounded-xl">
              {(() => {
                const Icon = getCurrentIcon();
                return <Icon size={24} className="text-white" />;
              })()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-950">Edit {lore.title}</h1>
              <p className="text-brand-600 mt-1">
                Modify the details of this lore entry
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={handleSuccess}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="lore-form"
              variant="primary"
            >
              Update Lore
            </Button>
          </div>
        </div>

        {/* Form */}
        <LoreForm 
          lore={lore}
          projectId={Number(projectId)} 
          onSuccess={handleSuccess}
          onCancel={handleSuccess}
          onCategoryChange={handleCategoryChange}
        />
      </main>
    </div>
  );
}