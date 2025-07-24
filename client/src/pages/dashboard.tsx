import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { DashboardHeaderSkeleton, StatsGridSkeleton, EditHistorySkeleton } from "@/components/skeleton";
import { 
  Users, MapPin, Calendar, Sparkles, BookOpen, StickyNote,
  Edit3, Plus, Trash2, Clock
} from "lucide-react";
import type { Project, Character, Location, Event, MagicSystem, LoreEntry, Note } from "@shared/schema";

export default function Dashboard() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    events: number;
    characters: number;
    locations: number;
    magicSystems: number;
  }>({
    queryKey: [`/api/projects/${projectId}/stats`],
  });

  const { data: characters, isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: locations, isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
  });

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: [`/api/projects/${projectId}/events`],
  });

  const { data: magicSystems, isLoading: magicSystemsLoading } = useQuery<MagicSystem[]>({
    queryKey: [`/api/projects/${projectId}/magic-systems`],
  });

  const { data: loreEntries, isLoading: loreLoading } = useQuery<LoreEntry[]>({
    queryKey: [`/api/projects/${projectId}/lore`],
  });

  const { data: notes, isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: [`/api/projects/${projectId}/notes`],
  });

  // Check if any data is still loading
  const isLoading = projectLoading || statsLoading || charactersLoading || 
                   locationsLoading || eventsLoading || magicSystemsLoading || 
                   loreLoading || notesLoading;

  // Set page title
  useEffect(() => {
    if (project?.name) {
      document.title = `${project.name} | InkAlchemy`;
    } else {
      document.title = "Dashboard | InkAlchemy";
    }
  }, [project?.name]);

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  // Create edit history from all elements
  const createEditHistory = () => {
    const history: Array<{
      id: string;
      type: 'create' | 'edit' | 'delete';
      category: string;
      title: string;
      summary: string;
      icon: typeof Users;
      timestamp: Date;
    }> = [];

    // Add characters to history
    characters?.forEach(char => {
      history.push({
        id: `character-${char.id}`,
        type: 'create',
        category: 'Characters',
        title: char.name,
        summary: `Created ${char.role || 'character'} - ${char.description?.substring(0, 50) || 'No description'}...`,
        icon: Users,
        timestamp: char.createdAt || new Date()
      });
      
      if (char.updatedAt && char.updatedAt > char.createdAt) {
        history.push({
          id: `character-edit-${char.id}`,
          type: 'edit',
          category: 'Characters',
          title: char.name,
          summary: `Updated character details and properties`,
          icon: Users,
          timestamp: char.updatedAt
        });
      }
    });

    // Add locations to history
    locations?.forEach(loc => {
      history.push({
        id: `location-${loc.id}`,
        type: 'create',
        category: 'Locations',
        title: loc.name,
        summary: `Created ${loc.type || 'location'} - ${loc.content?.substring(0, 50) || 'No content'}...`,
        icon: MapPin,
        timestamp: loc.createdAt || new Date()
      });
    });

    // Add events to history
    events?.forEach(event => {
      history.push({
        id: `event-${event.id}`,
        type: 'create',
        category: 'Timeline',
        title: event.title,
        summary: `Added timeline event - ${event.description?.substring(0, 50) || 'No description'}...`,
        icon: Calendar,
        timestamp: event.createdAt || new Date()
      });
    });

    // Add magic systems to history
    magicSystems?.forEach(magic => {
      history.push({
        id: `magic-${magic.id}`,
        type: 'create',
        category: 'Magic Systems',
        title: magic.name,
        summary: `Created magic system - ${magic.description?.substring(0, 50) || 'No description'}...`,
        icon: Sparkles,
        timestamp: magic.createdAt || new Date()
      });
    });

    // Add lore entries to history
    loreEntries?.forEach(lore => {
      history.push({
        id: `lore-${lore.id}`,
        type: 'create',
        category: 'Lore',
        title: lore.title,
        summary: `Added lore entry - ${lore.content?.substring(0, 50) || 'No content'}...`,
        icon: BookOpen,
        timestamp: lore.createdAt || new Date()
      });
    });

    // Add notes to history
    notes?.forEach(note => {
      history.push({
        id: `note-${note.id}`,
        type: 'create',
        category: 'Notes',
        title: note.title,
        summary: `Created note - ${note.content?.substring(0, 50) || 'No content'}...`,
        icon: StickyNote,
        timestamp: note.createdAt || new Date()
      });
    });

    // Sort by timestamp (most recent first)
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const editHistory = createEditHistory();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'create': return Plus;
      case 'edit': return Edit3;
      case 'delete': return Trash2;
      default: return Edit3;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'create': return 'text-white bg-brand-600';
      case 'edit': return 'text-white bg-brand-700';
      case 'delete': return 'text-white bg-brand-800';
      default: return 'text-white bg-brand-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          hasActiveProject={true} 
          currentPage="dashboard"
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <DashboardHeaderSkeleton />

          {/* Stats Grid Skeleton */}
          <StatsGridSkeleton />

          {/* Edit History Skeleton */}
          <EditHistorySkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="dashboard"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-brand-900 mb-2">
            {project?.name || "Project Dashboard"}
          </h1>
          <p className="text-brand-700">
            {project?.description || "Manage and organize your story elements"}
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-brand-100 rounded-lg p-6 border border-brand-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-700">Timeline Events</p>
                  <p className="text-3xl font-bold text-brand-900">{stats.events}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-12 h-12 bg-brand-200 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-brand-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-100 rounded-lg p-6 border border-brand-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-700">Characters</p>
                  <p className="text-3xl font-bold text-brand-900">{stats.characters}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-12 h-12 bg-brand-200 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-brand-700" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-brand-100 rounded-lg p-6 border border-brand-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-700">Locations</p>
                  <p className="text-3xl font-bold text-brand-900">{stats.locations}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-12 h-12 bg-brand-200 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-brand-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-100 rounded-lg p-6 border border-brand-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-700">Magic Systems</p>
                  <p className="text-3xl font-bold text-brand-900">{stats.magicSystems}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-12 h-12 bg-brand-200 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-brand-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit History */}
        <div className="bg-brand-100 rounded-lg border border-brand-200 shadow-sm">
          <div className="px-6 py-4 border-b border-brand-200">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-700" />
              <h2 className="text-xl font-semibold text-brand-900">Editing History</h2>
            </div>
            <p className="text-sm text-brand-600 mt-1">Track all changes made to your project</p>
          </div>
          
          <div className="p-6">
            {editHistory.length > 0 ? (
              <div className="space-y-4">
                {editHistory.slice(0, 20).map((item) => {
                  const TypeIcon = getTypeIcon(item.type);
                  const CategoryIcon = item.icon;
                  
                  return (
                    <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-brand-200 transition-colors">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(item.type)}`}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CategoryIcon className="w-4 h-4 text-brand-700" />
                          <span className="text-sm font-medium text-brand-700">{item.category}</span>
                          <span className="text-sm text-brand-500">•</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-600 text-white capitalize">{item.type}</span>
                        </div>
                        
                        <h3 className="font-semibold text-brand-900 truncate">{item.title}</h3>
                        <p className="text-sm text-brand-700 mt-1">{item.summary}</p>
                      </div>
                      
                      <div className="flex-shrink-0 text-right">
                        <span className="text-sm text-brand-600">{formatDate(item.timestamp)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-brand-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-brand-600 mb-2">No activity yet</h3>
                <p className="text-brand-500">Start creating characters, locations, and events to see activity here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}