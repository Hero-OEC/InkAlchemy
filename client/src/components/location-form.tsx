import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertLocationSchema, type Location } from "@shared/schema";
import { MapPin, Mountain, Crown } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("overview");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId,
      name: location?.name || "",
      type: location?.type || "",
      description: location?.description || "",
      geography: location?.geography || "",
      culture: location?.culture || "",
      politics: location?.politics || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("POST", "/api/locations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", projectId, "locations"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", projectId, "stats"] 
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
      apiRequest("PATCH", `/api/locations/${location?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", projectId, "locations"] 
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

  const tabs = [
    { id: "overview", label: "Overview", icon: MapPin },
    { id: "geography", label: "Geography", icon: Mountain },
    { id: "politics", label: "Politics", icon: Crown },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Location name" {...field} />
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
                    <FormLabel>Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        onTypeChange?.(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="General overview of the location"
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="culture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Culture & Significance</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Inhabitants, customs, traditions, beliefs, language, cultural significance"
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "geography":
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="geography"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Geography & Environment</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Physical features, terrain, climate, natural resources, landmarks, flora and fauna"
                      className="min-h-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "politics":
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="politics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Politics & Governance</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Government structure, laws, rulers, conflicts, alliances, power dynamics"
                      className="min-h-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-brand-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-brand-500 text-brand-600"
                      : "border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300"
                  }`}
                >
                  <TabIcon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-6 border-t border-brand-200">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : location ? "Update Location" : "Create Location"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
