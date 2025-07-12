import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import type { Project } from "@shared/schema";

export default function Lore() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="lore"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="container mx-auto px-6 py-8" style={{ marginLeft: '100px', marginRight: '100px' }}>
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold text-brand-900 mb-4">Lore</h1>
          <p className="text-brand-600">Ready for content</p>
        </div>
      </main>
    </div>
  );
}