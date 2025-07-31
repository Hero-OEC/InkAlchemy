import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WordProcessor } from "@/components/word-processor";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertLocationSchema, type Location } from "@shared/schema";
import { MapPin, Mountain, Building2, Castle, TreePine, Waves, Crown, Home, Landmark, Trees, Globe } from "lucide-react";
import { z } from "zod";

const formSchema = insertLocationSchema.extend({
  type: z.string().optional(),
});

interface LocationFormProps {
  location?: Location | null;
  projectId: number;
  onSuccess: () => void;
  onTypeChange?: (type: string) => void;
}

export function LocationForm({ location, projectId, onSuccess, onTypeChange }: LocationFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId,
      name: location?.name || "",
      type: location?.type || "",
      content: location?.content || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("/api/locations", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/projects', projectId, 'locations'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/projects', projectId, 'stats'] 
      });
      toast({
        title: "Success",
        description: "Location created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create location",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest(`/api/locations/${location?.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/projects', projectId, 'locations'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/locations', location?.id] 
      });
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (location) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Get icon based on location type - matches LOCATION_TYPE_ICONS in all pages
  const getLocationIcon = (type: string) => {
    const iconMap = {
      settlement: Building2,
      city: Building2,
      village: Home,
      town: Home,
      natural: Trees,
      forest: TreePine,
      mountain: Mountain,
      river: Waves,
      lake: Waves,
      ocean: Waves,
      desert: Mountain,
      building: Building2,
      fortress: Castle,
      castle: Castle,
      temple: Landmark,
      academy: Landmark,
      tower: Castle,
      dungeon: Landmark,
      realm: Crown,
      dimension: Landmark,
      other: MapPin,
    };
    return iconMap[type as keyof typeof iconMap] || MapPin;
  };

  const selectedType = form.watch("type");
  const LocationIcon = getLocationIcon(selectedType || "");

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-brand-500 p-3 rounded-xl">
            <LocationIcon size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-brand-950">
              {location ? "Edit Location" : "Create Location"}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-500 text-white">
                {selectedType ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1) : 'Location'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onSuccess}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="location-form"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : location ? "Update Location" : "Create Location"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form id="location-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Container */}
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-brand-950 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-900">Location Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter location name" 
                      {...field} 
                      className="border-brand-200 focus:border-brand-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-900">Location Type</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      onTypeChange?.(value);
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-brand-200 focus:border-brand-500">
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="city">City</SelectItem>
                      <SelectItem value="town">Town</SelectItem>
                      <SelectItem value="village">Village</SelectItem>
                      <SelectItem value="forest">Forest</SelectItem>
                      <SelectItem value="mountain">Mountain</SelectItem>
                      <SelectItem value="ocean">Ocean</SelectItem>
                      <SelectItem value="river">River</SelectItem>
                      <SelectItem value="desert">Desert</SelectItem>
                      <SelectItem value="building">Building</SelectItem>
                      <SelectItem value="castle">Castle</SelectItem>
                      <SelectItem value="dungeon">Dungeon</SelectItem>
                      <SelectItem value="realm">Realm</SelectItem>
                      <SelectItem value="dimension">Dimension</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
          </div>

          {/* Content Container */}
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-brand-950 mb-6">Content</h2>
            <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <WordProcessor
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Describe this location - its appearance, culture, history, significance, and any important details..."
                    className="min-h-[400px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}