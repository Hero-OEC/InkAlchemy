import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Search, Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { EventForm } from "@/components/event-form";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const DEFAULT_PROJECT_ID = 1;

export default function Timeline() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "events"],
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "events"] 
      });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, order }: { id: number; order: number }) => 
      apiRequest("PATCH", `/api/events/${id}`, { order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "events"] 
      });
    },
  });

  const filteredEvents = events?.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.type?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getImportanceColor = (importance?: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      default: return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'active': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'planned': return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
      default: return 'bg-primary/20 text-primary';
    }
  };

  const getEventNumber = (index: number) => {
    return index + 1;
  };

  const getEventColor = (index: number, status?: string) => {
    if (status === 'completed') return 'bg-green-400';
    if (status === 'active') return 'bg-primary';
    if (index === 0) return 'bg-primary';
    if (index === 1) return 'bg-blue-400';
    return 'bg-gray-300 dark:bg-gray-600';
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  const handleDeleteEvent = (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate(id);
    }
  };

  const handleMoveEvent = (event: Event, direction: 'up' | 'down') => {
    const currentIndex = filteredEvents.findIndex(e => e.id === event.id);
    const newOrder = direction === 'up' ? event.order - 1 : event.order + 1;
    updateEventMutation.mutate({ id: event.id, order: newOrder });
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Timeline</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your story's chronological events ({filteredEvents.length} total)
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedEvent(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedEvent ? "Edit Event" : "Create New Event"}
              </DialogTitle>
            </DialogHeader>
            <EventForm
              event={selectedEvent}
              projectId={DEFAULT_PROJECT_ID}
              onSuccess={handleFormSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No events found" : "No timeline events yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {searchQuery 
                ? `No events match "${searchQuery}"`
                : "Start building your story timeline by creating your first event"
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600"></div>
            
            {filteredEvents.map((event, index) => (
              <div key={event.id} className="relative flex items-start space-x-4 pb-8 timeline-event">
                <div className={`w-12 h-12 ${getEventColor(index, event.status)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 relative z-10 shadow-lg`}>
                  {getEventNumber(index)}
                </div>
                
                <Card className="flex-1 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(event.status)}>
                            {event.status || "Planned"}
                          </Badge>
                          <Badge className={getImportanceColor(event.importance)}>
                            {event.importance || "Medium"} Priority
                          </Badge>
                          {event.type && (
                            <Badge variant="outline">
                              {event.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveEvent(event, 'up')}
                          disabled={index === 0 || updateEventMutation.isPending}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveEvent(event, 'down')}
                          disabled={index === filteredEvents.length - 1 || updateEventMutation.isPending}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={deleteEventMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {event.description && (
                        <p className="text-gray-600 dark:text-gray-300">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {event.date && (
                          <span className="text-sm font-medium text-primary">
                            {event.date}
                          </span>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Created {new Date(event.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
