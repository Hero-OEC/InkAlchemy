import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertLocationSchema, type Location } from "@shared/schema";
import { z } from "zod";

const formSchema = insertLocationSchema.extend({
  type: z.string().optional(),
});

interface LocationFormProps {
  location?: Location | null;
  projectId: number;
  onSuccess: () => void;
}

export function LocationForm({ location, projectId, onSuccess }: LocationFormProps) {
  const { toast } = useToast();

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="geography"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Geography</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Physical features, terrain, climate, natural resources"
                  className="min-h-[80px]"
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
              <FormLabel>Culture</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Inhabitants, customs, traditions, beliefs, language"
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="politics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Politics & Governance</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Government structure, laws, rulers, conflicts"
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
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
