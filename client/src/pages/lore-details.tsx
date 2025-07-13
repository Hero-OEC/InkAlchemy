import { useParams, useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { ArrowLeft, Edit, BookOpen, Crown, Scroll, Landmark, Sword, Users, Globe, Calendar } from "lucide-react";
import type { Project, LoreEntry } from "@shared/schema";

// Lore category config
const LORE_CATEGORY_CONFIG = {
  history: { icon: Calendar, label: "History", bgColor: "bg-amber-500", textColor: "text-white" },
  culture: { icon: Users, label: "Culture", bgColor: "bg-purple-500", textColor: "text-white" },
  religion: { icon: Landmark, label: "Religion", bgColor: "bg-blue-500", textColor: "text-white" },
  politics: { icon: Crown, label: "Politics", bgColor: "bg-red-500", textColor: "text-white" },
  geography: { icon: Globe, label: "Geography", bgColor: "bg-green-500", textColor: "text-white" },
  technology: { icon: Sword, label: "Technology", bgColor: "bg-gray-500", textColor: "text-white" },
  magic: { icon: Scroll, label: "Magic", bgColor: "bg-indigo-500", textColor: "text-white" },
  language: { icon: BookOpen, label: "Language", bgColor: "bg-teal-500", textColor: "text-white" },
  other: { icon: BookOpen, label: "Other", bgColor: "bg-brand-500", textColor: "text-white" }
};

export default function LoreDetails() {
  const { projectId, loreId } = useParams();
  const [, setLocation] = useLocation();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: lore, isLoading } = useQuery<LoreEntry>({
    queryKey: [`/api/lore/${loreId}`],
    enabled: !!loreId && loreId !== "new" && !isNaN(Number(loreId))
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="lore"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Loading lore entry...</p>
        </div>
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
      
      <main className="max-w-4xl mx-auto px-6 py-8" style={{ marginLeft: '100px', marginRight: '100px' }}>
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
                    Updated {formatDate(lore.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="primary" onClick={handleEdit} className="flex items-center gap-2">
            <Edit size={16} />
            Edit
          </Button>
        </div>

        {/* Content */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
          <div className="prose prose-brand max-w-none">
            <div className="text-brand-700 leading-relaxed whitespace-pre-wrap">
              {lore.content}
            </div>
          </div>
        </div>

        {/* Metadata */}
        {lore.createdAt && (
          <div className="mt-6 text-center text-sm text-brand-500">
            Created {formatDate(lore.createdAt)}
          </div>
        )}
      </main>
    </div>
  );
}