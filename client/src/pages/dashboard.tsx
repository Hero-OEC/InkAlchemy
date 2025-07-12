import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { useParams, useLocation } from "wouter";
import { 
  Users, MapPin, Clock, Wand2, Book, StickyNote, 
  Plus, Download, UserPlus, MapPinIcon, PlusCircle,
  Edit, Link
} from "lucide-react";
import type { Character, Event, Note, Relationship, Project } from "@shared/schema";

export default function Dashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, setLocation] = useLocation();
  
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/projects", projectId, "stats"],
  });

  const { data: characters, isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: ["/api/projects", projectId, "characters"],
  });

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/projects", projectId, "events"],
  });

  const { data: notes, isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ["/api/projects", projectId, "notes"],
  });

  const { data: relationships, isLoading: relationshipsLoading } = useQuery<Relationship[]>({
    queryKey: ["/api/projects", projectId, "relationships"],
  });

  const recentCharacters = characters?.slice(0, 4) || [];
  const timelineEvents = events?.slice(0, 3) || [];
  const recentNotes = notes?.slice(0, 3) || [];
  const recentRelationships = relationships?.slice(0, 3) || [];

  const getCharacterInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-400';
      case 'developing': return 'bg-orange-400';
      case 'inactive': return 'bg-gray-400';
      default: return 'bg-blue-400';
    }
  };

  const getRelationshipStrengthColor = (strength?: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'medium': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300';
      case 'weak': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  };

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  if (projectLoading || statsLoading || charactersLoading || eventsLoading || notesLoading || relationshipsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
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
      <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Story Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage and develop your story world</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Project
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Element
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Users className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Characters</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.characters || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <MapPin className="text-green-600 dark:text-green-400 w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Locations</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.locations || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Clock className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.events || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Wand2 className="text-primary w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Magic Systems</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.magicSystems || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Book className="text-orange-600 dark:text-orange-400 w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Lore Entries</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.loreEntries || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <StickyNote className="text-red-600 dark:text-red-400 w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Notes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.notes || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Recent Characters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Characters</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCharacters.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No characters created yet</p>
                </div>
              ) : (
                recentCharacters.map((character) => (
                  <div
                    key={character.id}
                    className="flex items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {getCharacterInitials(character.name)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{character.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{character.role || 'No role defined'}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`w-2 h-2 ${getStatusColor(character.status)} rounded-full`}></span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{character.status || 'Active'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Timeline Overview</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                Manage Timeline
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timelineEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No timeline events yet</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600"></div>
                  
                  {timelineEvents.map((event, index) => (
                    <div key={event.id} className="flex items-start space-x-3 relative">
                      <div className={`w-8 h-8 ${index === 0 ? 'bg-primary' : index === 1 ? 'bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'} rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 relative z-10`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0 pb-6">
                        <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.description || 'No description'}</p>
                        <span className="text-xs text-primary font-medium">{event.date || 'No date set'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-auto p-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-3">
                  <UserPlus className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Create Character</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add a new character to your story</p>
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-start h-auto p-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-3">
                  <MapPinIcon className="text-green-600 dark:text-green-400 w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Add Location</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Create a new place in your world</p>
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-start h-auto p-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mr-3">
                  <PlusCircle className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Timeline Event</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add an event to your timeline</p>
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-start h-auto p-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-3">
                  <Wand2 className="text-primary w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Magic System</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Define magical rules and limitations</p>
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-start h-auto p-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mr-3">
                  <StickyNote className="text-orange-600 dark:text-orange-400 w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Quick Note</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Capture a random thought or idea</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Relationships */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Edit className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentNotes.map((note) => (
                  <div key={note.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Edit className="text-blue-600 dark:text-blue-400 w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">Created note:</span>{' '}
                        <span className="text-primary font-medium">{note.content.slice(0, 50)}{note.content.length > 50 ? '...' : ''}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Character Relationships */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Character Relationships</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                Relationship Map
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRelationships.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Link className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No relationships defined</p>
                </div>
              ) : (
                recentRelationships.map((relationship) => (
                  <div key={relationship.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white dark:ring-gray-800">
                            {getCharacterInitials(`${relationship.sourceType} ${relationship.sourceId}`)}
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white dark:ring-gray-800">
                            {getCharacterInitials(`${relationship.targetType} ${relationship.targetId}`)}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {relationship.sourceType} & {relationship.targetType}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{relationship.relationshipType}</p>
                        </div>
                      </div>
                      <Badge className={getRelationshipStrengthColor(relationship.strength)}>
                        {relationship.strength || 'Medium'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
