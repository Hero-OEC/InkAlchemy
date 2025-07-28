import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/button-variations";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentCard } from "@/components/content-card";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { SearchComponent } from "@/components/search-component";
import { Input, Select } from "@/components/form-inputs";
import { WelcomeHeaderSkeleton, ProjectsSectionHeaderSkeleton, ProjectsGridSkeleton } from "@/components/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, FolderOpen, Book,
  Castle, Globe, Building, Flame, Swords, Heart, DoorOpen, Wand, BookOpen, ScrollText,
  Coffee, Zap, TrendingUp, Leaf, Dice5, MonitorPlay, Layers3, Cpu, Dna, Clock,
  Bot, Factory, Radiation, Satellite, Gamepad, Search, Key, Gavel, Server, Home,
  Brain, Ghost, Moon, Hexagon, Shield, Bug, Feather, Rocket, Smile,
  Calendar, AlertOctagon, AlertCircle, Eye, Laugh, User, Users,
  Sparkles, Megaphone, GraduationCap, Pen, Swords as SwordsIcon
} from "lucide-react";
import { useLocation } from "wouter";
import type { Project, InsertProject } from "@shared/schema";

const genreOptions = [
  { value: "High Fantasy", label: "High Fantasy", description: "Epic worlds with magic, quests, and mythical creatures", icon: Castle },
  { value: "Low Fantasy", label: "Low Fantasy", description: "Subtle magic in realistic settings", icon: Globe },
  { value: "Urban Fantasy", label: "Urban Fantasy", description: "Magic hidden in modern city life", icon: Building },
  { value: "Dark Fantasy", label: "Dark Fantasy", description: "Horror meets fantasy with gothic themes", icon: Flame },
  { value: "Sword & Sorcery", label: "Sword & Sorcery", description: "Adventure-focused with warriors and magic", icon: Swords },
  { value: "Romantic Fantasy", label: "Romantic Fantasy", description: "Love stories with magical elements", icon: Heart },
  { value: "Portal Fantasy", label: "Portal Fantasy", description: "Characters travel to magical worlds", icon: DoorOpen },
  { value: "Fairy Tale Retellings", label: "Fairy Tale Retellings", description: "Classic tales with fresh twists", icon: Wand },
  { value: "Mythic Fantasy", label: "Mythic Fantasy", description: "Stories rooted in ancient myths", icon: BookOpen },
  { value: "Historical Fantasy", label: "Historical Fantasy", description: "Magic woven into historical periods", icon: ScrollText },
  { value: "Cozy Fantasy", label: "Cozy Fantasy", description: "Gentle, comforting magical stories", icon: Coffee },
  { value: "Flintlock Fantasy", label: "Flintlock Fantasy", description: "Fantasy with early firearms technology", icon: Zap },
  { value: "Progression Fantasy", label: "Progression Fantasy", description: "Characters grow stronger through systems", icon: TrendingUp },
  { value: "Cultivation (Xianxia / Wuxia)", label: "Cultivation (Xianxia / Wuxia)", description: "Martial arts and spiritual power growth", icon: Leaf },
  { value: "LitRPG", label: "LitRPG", description: "Game mechanics in story format", icon: Dice5 },
  { value: "GameLit", label: "GameLit", description: "Gaming elements without strict rules", icon: MonitorPlay },
  { value: "Dungeon Core", label: "Dungeon Core", description: "Building and managing dungeons", icon: Layers3 },
  { value: "Cyberpunk", label: "Cyberpunk", description: "High tech, low life dystopian future", icon: Cpu },
  { value: "Biopunk", label: "Biopunk", description: "Biotechnology and genetic engineering focus", icon: Dna },
  { value: "Time Travel", label: "Time Travel", description: "Stories involving temporal journeys", icon: Clock },
  { value: "AI & Robots", label: "AI & Robots", description: "Artificial intelligence and robotics themes", icon: Bot },
  { value: "Dystopian", label: "Dystopian", description: "Oppressive future societies", icon: Factory },
  { value: "Post-Apocalyptic", label: "Post-Apocalyptic", description: "Survival after civilization's collapse", icon: Radiation },
  { value: "Alien Invasion", label: "Alien Invasion", description: "Earth under extraterrestrial attack", icon: Satellite },
  { value: "LitRPG Sci-Fi", label: "LitRPG Sci-Fi", description: "Game systems in futuristic settings", icon: Gamepad },
  { value: "Cozy Mystery", label: "Cozy Mystery", description: "Gentle mysteries in small communities", icon: Book },
  { value: "Detective Noir", label: "Detective Noir", description: "Dark, gritty crime investigations", icon: Search },
  { value: "Spy / Espionage", label: "Spy / Espionage", description: "Secret agents and international intrigue", icon: Key },
  { value: "Crime Fiction", label: "Crime Fiction", description: "Criminal activities and investigations", icon: Gavel },
  { value: "Techno-thriller", label: "Techno-thriller", description: "Technology-driven suspense stories", icon: Server },
  { value: "Domestic Thriller", label: "Domestic Thriller", description: "Suspense in everyday relationships", icon: Home },
  { value: "Psychological Horror", label: "Psychological Horror", description: "Fear from mental manipulation", icon: Brain },
  { value: "Supernatural Horror", label: "Supernatural Horror", description: "Ghosts, demons, and otherworldly terror", icon: Ghost },
  { value: "Slasher", label: "Slasher", description: "Killer stalking multiple victims", icon: Zap },
  { value: "Gothic Horror", label: "Gothic Horror", description: "Dark atmosphere with classic monsters", icon: Moon },
  { value: "Occult Horror", label: "Occult Horror", description: "Dark magic and forbidden knowledge", icon: Hexagon },
  { value: "Survival Horror", label: "Survival Horror", description: "Characters fighting to stay alive", icon: Shield },
  { value: "Monster Horror", label: "Monster Horror", description: "Creatures terrorizing protagonists", icon: Bug },
  { value: "YA Fantasy", label: "YA Fantasy", description: "Young adult fantasy adventures", icon: Feather },
  { value: "YA Sci-Fi", label: "YA Sci-Fi", description: "Teen-focused science fiction", icon: Rocket },
  { value: "YA Romance", label: "YA Romance", description: "Young love and relationships", icon: Smile },
  { value: "YA Contemporary", label: "YA Contemporary", description: "Modern teen life and issues", icon: Calendar },
  { value: "YA Dystopian", label: "YA Dystopian", description: "Young heroes in broken societies", icon: AlertOctagon },
  { value: "YA Thriller", label: "YA Thriller", description: "Teen suspense and danger", icon: AlertCircle },
  { value: "YA Paranormal", label: "YA Paranormal", description: "Young adult supernatural stories", icon: Eye },
  { value: "Romantic Comedy (Rom-Com)", label: "Romantic Comedy (Rom-Com)", description: "Light-hearted love stories", icon: Laugh },
  { value: "Coming-of-Age", label: "Coming-of-Age", description: "Growing up and self-discovery", icon: User },
  { value: "Literary Fiction", label: "Literary Fiction", description: "Character-driven artistic prose", icon: Pen },
  { value: "Contemporary Fiction", label: "Contemporary Fiction", description: "Modern life and relationships", icon: Users },
  { value: "Slice of Life", label: "Slice of Life", description: "Everyday moments and experiences", icon: Coffee },
  { value: "Magical Realism", label: "Magical Realism", description: "Subtle magic in realistic settings", icon: Sparkles },
  { value: "Satire", label: "Satire", description: "Humor to critique society", icon: Megaphone },
  { value: "Drama", label: "Drama", description: "Serious emotional conflicts", icon: Zap },
  { value: "Alt-History", label: "Alt-History", description: "What if history went differently", icon: Clock },
  { value: "Dark Academia", label: "Dark Academia", description: "Academic settings with dark secrets", icon: GraduationCap },
  { value: "Antihero Fiction", label: "Antihero Fiction", description: "Morally complex protagonists", icon: User },
];

const getGenreIcon = (genre: string) => {
  const genreData = genreOptions.find(g => g.value === genre);
  return genreData?.icon || Book;
};

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectGenre, setNewProjectGenre] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const selectedGenreDescription = genreOptions.find(g => g.value === newProjectGenre)?.description;

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Define search filters for projects
  const searchFilters = [
    {
      key: "genre",
      label: "Genre",
      options: genreOptions.map(genre => ({
        value: genre.value,
        label: genre.label
      }))
    }
  ];

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    // Text search across name, description, and genre
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesName = project.name.toLowerCase().includes(query);
      const matchesDescription = project.description?.toLowerCase().includes(query);
      const matchesGenre = project.genre?.toLowerCase().includes(query);
      
      if (!matchesName && !matchesDescription && !matchesGenre) {
        return false;
      }
    }

    // Filter by genre
    if (activeFilters.genre && project.genre !== activeFilters.genre) {
      return false;
    }

    return true;
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
      // Clear form and close it
      setNewProjectName("");
      setNewProjectGenre("");
      setNewProjectDescription("");
      setShowCreateForm(false);
      // Navigate to the new project
      setLocation(`/projects/${newProject.id}/dashboard`);
    },
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      createProjectMutation.mutate({
        name: newProjectName,
        description: newProjectDescription || undefined,
        genre: newProjectGenre || undefined,
      });
      // Don't close form immediately - let the mutation handle it
    }
  };

  const handleOpenProject = (projectId: number) => {
    setLocation(`/projects/${projectId}/dashboard`);
  };

  const updateProjectMutation = useMutation({
    mutationFn: async (data: { id: number; name: string; genre?: string; description?: string }) => {
      return apiRequest(`/api/projects/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: data.name, genre: data.genre, description: data.description })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowEditForm(false);
      setEditingProject(null);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: number) => apiRequest(`/api/projects/${projectId}`, { method: 'DELETE' }),
    onSuccess: (data, variables) => {
      console.log('Project deleted successfully:', variables);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setDeleteProject(null);
    },
    onError: (error) => {
      console.error('Delete project error:', error);
      // Keep the dialog open so user can try again
    },
  });

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditGenre(project.genre || "");
    setEditDescription(project.description || "");
    setShowEditForm(true);
  };

  const handleDeleteProject = (project: Project) => {
    setDeleteProject(project);
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject && editName.trim()) {
      updateProjectMutation.mutate({
        id: editingProject.id,
        name: editName,
        description: editDescription || undefined,
        genre: editGenre || undefined,
      });
    }
  };

  const confirmDeleteProject = () => {
    if (deleteProject) {
      deleteProjectMutation.mutate(deleteProject.id);
    }
  };

  // Set page title
  useEffect(() => {
    document.title = "InkAlchemy - Worldbuilding Management Platform";
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar hasActiveProject={false} />
        
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Welcome Header Skeleton */}
          <WelcomeHeaderSkeleton />

          {/* Projects Section Skeleton */}
          <div className="mb-12">
            <ProjectsSectionHeaderSkeleton />
            
            {/* Projects Grid Skeleton */}
            <ProjectsGridSkeleton />
          </div>
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
          <h1 className="text-5xl font-bold text-brand-950 mb-6">Welcome to InkAlchemy</h1>
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
            <div className="flex items-center gap-4 flex-shrink-0">
              {projects.length > 0 && (
                <SearchComponent
                  placeholder="Search projects..."
                  onSearch={setSearchQuery}
                  onFilterChange={setActiveFilters}
                  filters={searchFilters}
                  showFilters={true}
                />
              )}
              <Button 
                variant="primary" 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} />
                Create New Project
              </Button>
            </div>
          </div>

          {/* Edit Project Form */}
          {showEditForm && editingProject && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Edit Project</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProject} className="space-y-4">
                  <Input
                    label="Project Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your project name"
                    required
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-900">Genre (Optional)</label>
                    <div className="space-y-2">
                      <Select
                        value={editGenre}
                        onChange={setEditGenre}
                        placeholder="Select a genre for your story"
                        options={genreOptions}
                      />
                      {editGenre && genreOptions.find(g => g.value === editGenre)?.description && (
                        <p className="text-sm text-brand-600 mt-2 italic">
                          {genreOptions.find(g => g.value === editGenre)?.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Input
                    label="Description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Brief description of your story world..."
                  />
                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      variant="primary"
                      loading={updateProjectMutation.isPending}
                    >
                      Update Project
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingProject(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

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
                    <div>
                      <Select
                        label="Genre"
                        value={newProjectGenre}
                        onChange={setNewProjectGenre}
                        placeholder="Select a genre for your story"
                        options={genreOptions}
                      />
                      {selectedGenreDescription && (
                        <p className="text-sm text-brand-600 mt-2 italic">
                          {selectedGenreDescription}
                        </p>
                      )}
                    </div>
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
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-brand-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-brand-900 mb-2">No projects found</h3>
              <p className="text-brand-700 mb-6">
                {searchQuery ? `No projects match "${searchQuery}"` : "No projects match the selected filters"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ContentCard
                  key={project.id}
                  id={project.id}
                  title={project.name}
                  type="project"
                  subtype={project.genre || "story"}
                  description={project.description || "No description provided"}
                  icon={Book}
                  createdAt={new Date(project.createdAt)}
                  onClick={() => handleOpenProject(project.id)}
                  onEdit={() => handleEditProject(project)}
                  onDelete={() => handleDeleteProject(project)}
                />
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
                  <Swords className="w-8 h-8 text-brand-600" />
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
      
      <DeleteConfirmation
        isOpen={!!deleteProject}
        onClose={() => setDeleteProject(null)}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteProject?.name}"? This action cannot be undone and will remove all associated content including characters, locations, magic systems, events, lore, and notes.`}
        itemName={deleteProject?.name || "this project"}
        isLoading={deleteProjectMutation.isPending}
      />
    </div>
  );
}