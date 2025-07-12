import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/button-variations";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentCard } from "@/components/content-card";
import { Input, Select } from "@/components/form-inputs";
import { Sword, Zap, Plus, FolderOpen, Book } from "lucide-react";
import { useLocation } from "wouter";
import type { Project, InsertProject } from "@shared/schema";

const genreOptions = [
  { value: "High Fantasy", label: "High Fantasy", description: "Epic worlds with magic, quests, and mythical creatures" },
  { value: "Low Fantasy", label: "Low Fantasy", description: "Subtle magic in realistic settings" },
  { value: "Urban Fantasy", label: "Urban Fantasy", description: "Magic hidden in modern city life" },
  { value: "Dark Fantasy", label: "Dark Fantasy", description: "Horror meets fantasy with gothic themes" },
  { value: "Sword & Sorcery", label: "Sword & Sorcery", description: "Adventure-focused with warriors and magic" },
  { value: "Romantic Fantasy", label: "Romantic Fantasy", description: "Love stories with magical elements" },
  { value: "Portal Fantasy", label: "Portal Fantasy", description: "Characters travel to magical worlds" },
  { value: "Fairy Tale Retellings", label: "Fairy Tale Retellings", description: "Classic tales with fresh twists" },
  { value: "Mythic Fantasy", label: "Mythic Fantasy", description: "Stories rooted in ancient myths" },
  { value: "Historical Fantasy", label: "Historical Fantasy", description: "Magic woven into historical periods" },
  { value: "Cozy Fantasy", label: "Cozy Fantasy", description: "Gentle, comforting magical stories" },
  { value: "Flintlock Fantasy", label: "Flintlock Fantasy", description: "Fantasy with early firearms technology" },
  { value: "Progression Fantasy", label: "Progression Fantasy", description: "Characters grow stronger through systems" },
  { value: "Cultivation (Xianxia / Wuxia)", label: "Cultivation (Xianxia / Wuxia)", description: "Martial arts and spiritual power growth" },
  { value: "LitRPG", label: "LitRPG", description: "Game mechanics in story format" },
  { value: "GameLit", label: "GameLit", description: "Gaming elements without strict rules" },
  { value: "Dungeon Core", label: "Dungeon Core", description: "Building and managing dungeons" },
  { value: "Cyberpunk", label: "Cyberpunk", description: "High tech, low life dystopian future" },
  { value: "Biopunk", label: "Biopunk", description: "Biotechnology and genetic engineering focus" },
  { value: "Time Travel", label: "Time Travel", description: "Stories involving temporal journeys" },
  { value: "AI & Robots", label: "AI & Robots", description: "Artificial intelligence and robotics themes" },
  { value: "Dystopian", label: "Dystopian", description: "Oppressive future societies" },
  { value: "Post-Apocalyptic", label: "Post-Apocalyptic", description: "Survival after civilization's collapse" },
  { value: "Alien Invasion", label: "Alien Invasion", description: "Earth under extraterrestrial attack" },
  { value: "LitRPG Sci-Fi", label: "LitRPG Sci-Fi", description: "Game systems in futuristic settings" },
  { value: "Cozy Mystery", label: "Cozy Mystery", description: "Gentle mysteries in small communities" },
  { value: "Detective Noir", label: "Detective Noir", description: "Dark, gritty crime investigations" },
  { value: "Spy / Espionage", label: "Spy / Espionage", description: "Secret agents and international intrigue" },
  { value: "Crime Fiction", label: "Crime Fiction", description: "Criminal activities and investigations" },
  { value: "Techno-thriller", label: "Techno-thriller", description: "Technology-driven suspense stories" },
  { value: "Domestic Thriller", label: "Domestic Thriller", description: "Suspense in everyday relationships" },
  { value: "Psychological Horror", label: "Psychological Horror", description: "Fear from mental manipulation" },
  { value: "Supernatural Horror", label: "Supernatural Horror", description: "Ghosts, demons, and otherworldly terror" },
  { value: "Slasher", label: "Slasher", description: "Killer stalking multiple victims" },
  { value: "Gothic Horror", label: "Gothic Horror", description: "Dark atmosphere with classic monsters" },
  { value: "Occult Horror", label: "Occult Horror", description: "Dark magic and forbidden knowledge" },
  { value: "Survival Horror", label: "Survival Horror", description: "Characters fighting to stay alive" },
  { value: "Monster Horror", label: "Monster Horror", description: "Creatures terrorizing protagonists" },
  { value: "YA Fantasy", label: "YA Fantasy", description: "Young adult fantasy adventures" },
  { value: "YA Sci-Fi", label: "YA Sci-Fi", description: "Teen-focused science fiction" },
  { value: "YA Romance", label: "YA Romance", description: "Young love and relationships" },
  { value: "YA Contemporary", label: "YA Contemporary", description: "Modern teen life and issues" },
  { value: "YA Dystopian", label: "YA Dystopian", description: "Young heroes in broken societies" },
  { value: "YA Thriller", label: "YA Thriller", description: "Teen suspense and danger" },
  { value: "YA Paranormal", label: "YA Paranormal", description: "Young adult supernatural stories" },
  { value: "Romantic Comedy (Rom-Com)", label: "Romantic Comedy (Rom-Com)", description: "Light-hearted love stories" },
  { value: "Coming-of-Age", label: "Coming-of-Age", description: "Growing up and self-discovery" },
  { value: "Literary Fiction", label: "Literary Fiction", description: "Character-driven artistic prose" },
  { value: "Contemporary Fiction", label: "Contemporary Fiction", description: "Modern life and relationships" },
  { value: "Slice of Life", label: "Slice of Life", description: "Everyday moments and experiences" },
  { value: "Magical Realism", label: "Magical Realism", description: "Subtle magic in realistic settings" },
  { value: "Satire", label: "Satire", description: "Humor to critique society" },
  { value: "Drama", label: "Drama", description: "Serious emotional conflicts" },
  { value: "Alt-History", label: "Alt-History", description: "What if history went differently" },
  { value: "Dark Academia", label: "Dark Academia", description: "Academic settings with dark secrets" },
  { value: "Antihero Fiction", label: "Antihero Fiction", description: "Morally complex protagonists" },
];

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectGenre, setNewProjectGenre] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const queryClient = useQueryClient();

  const selectedGenreDescription = genreOptions.find(g => g.value === newProjectGenre)?.description;

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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ContentCard
                  key={project.id}
                  id={project.id}
                  title={project.name}
                  type="project"
                  subtype={project.genre || "story"}
                  description={project.description || "No description provided"}
                  icon={project.genre === "Fantasy" ? Sword : project.genre === "Sci-Fi" ? Zap : Book}
                  createdAt={new Date(project.createdAt)}
                  lastEditedAt={project.lastEditedAt ? new Date(project.lastEditedAt) : undefined}
                  onClick={() => handleOpenProject(project.id)}
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