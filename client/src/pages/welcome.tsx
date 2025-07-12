import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/button-variations";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/form-inputs";
import { Sword, Zap, Plus, FolderOpen } from "lucide-react";
import { useLocation } from "wouter";
import logoPath from "@assets/inkalchemy_1752303410066.png";
import type { Project, InsertProject } from "@shared/schema";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectGenre, setNewProjectGenre] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: InsertProject) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) throw new Error("Failed to create project");
      return response.json();
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setLocation(`/projects/${newProject.id}/dashboard`);
    },
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      createProjectMutation.mutate({
        name: newProjectName,
        genre: newProjectGenre || undefined,
        description: newProjectDescription || undefined,
      });
      setNewProjectName("");
      setNewProjectGenre("");
      setNewProjectDescription("");
      setShowCreateForm(false);
    }
  };

  const handleOpenProject = (projectId: number) => {
    setLocation(`/projects/${projectId}/dashboard`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar hasActiveProject={false} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-pulse text-brand-600">Loading your projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar hasActiveProject={false} />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Welcome Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={logoPath} 
              alt="InkAlchemy Logo" 
              className="w-16 h-16 object-contain mr-4"
            />
            <h1 className="text-5xl font-bold text-brand-950">Welcome to InkAlchemy</h1>
          </div>
          <p className="text-xl text-brand-700 max-w-2xl mx-auto leading-relaxed">
            Your comprehensive creative writing companion. Organize characters, build worlds, 
            manage timelines, and bring your stories to life.
          </p>
        </div>

        {/* Projects Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-brand-900">Your Projects</h2>
              <p className="text-brand-700 mt-2">Manage and organize your creative writing projects</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <Plus size={18} />
              Create New Project
            </Button>
          </div>

          {/* Create Project Form */}
          {showCreateForm && (
            <Card className="mb-8 bg-brand-100 border-brand-200">
              <CardHeader>
                <CardTitle className="text-brand-900">Create New Project</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Project Name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g., The Chronicles of Mystara"
                      required
                    />
                    <Input
                      label="Genre"
                      value={newProjectGenre}
                      onChange={(e) => setNewProjectGenre(e.target.value)}
                      placeholder="e.g., Fantasy, Sci-Fi, Romance"
                    />
                  </div>
                  <Input
                    label="Description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Brief description of your story world..."
                  />
                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      variant="primary"
                      loading={createProjectMutation.isPending}
                    >
                      Create Project
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-brand-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-12 h-12 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-brand-900 mb-2">No projects yet</h3>
              <p className="text-brand-700 mb-6">Create your first project to start building your story world</p>
              <Button 
                variant="primary" 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="bg-white border-brand-200 hover:border-brand-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => handleOpenProject(project.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-brand-400 rounded-lg flex items-center justify-center text-white">
                          {project.genre === "Fantasy" ? (
                            <Sword className="w-6 h-6" />
                          ) : project.genre === "Sci-Fi" ? (
                            <Zap className="w-6 h-6" />
                          ) : (
                            <span className="font-bold text-lg">
                              {project.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-brand-900 group-hover:text-brand-700 transition-colors">
                            {project.name}
                          </CardTitle>
                          {project.genre && (
                            <div className="inline-block px-2 py-1 bg-brand-100 text-brand-700 text-xs rounded-full mt-1">
                              {project.genre}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-brand-600 text-sm mb-4 line-clamp-2">
                      {project.description || "No description provided"}
                    </p>
                    <div className="text-xs text-brand-500">
                      Last updated: {project.lastEditedAt ? 
                        new Date(project.lastEditedAt).toLocaleDateString() : 
                        new Date(project.createdAt).toLocaleDateString()
                      }
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Getting Started Section */}
        {projects.length === 0 && (
          <div className="bg-white rounded-xl border border-brand-200 p-8">
            <h3 className="text-2xl font-bold text-brand-900 mb-6">Getting Started with InkAlchemy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-brand-600" />
                </div>
                <h4 className="font-semibold text-brand-900 mb-2">Create a Project</h4>
                <p className="text-brand-700 text-sm">Start by creating your first story project with a name and genre</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sword className="w-8 h-8 text-brand-600" />
                </div>
                <h4 className="font-semibold text-brand-900 mb-2">Build Your World</h4>
                <p className="text-brand-700 text-sm">Add characters, locations, magic systems, and lore to your story</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-brand-600" />
                </div>
                <h4 className="font-semibold text-brand-900 mb-2">Organize Everything</h4>
                <p className="text-brand-700 text-sm">Use timelines, relationships, and notes to keep track of your story</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}