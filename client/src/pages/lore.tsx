import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import type { Project } from "@shared/schema";

export default function Lore() {
  const { projectId } = useParams();
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="Lore"
        projectName={project?.name}
      />
      
      <main className="container mx-auto px-6 py-8">
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold text-brand-900 mb-4">Lore</h1>
          <p className="text-brand-600">Ready for content</p>
        </div>
      </main>
    </div>
  );
}