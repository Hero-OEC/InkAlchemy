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
import { insertLoreEntrySchema, type LoreEntry } from "@shared/schema";
import { z } from "zod";

const formSchema = insertLoreEntrySchema.extend({
  category: z.string().optional(),
});

interface LoreFormProps {
  lore?: LoreEntry | null;
  projectId: number;
  onSuccess: () => void;
  onCategoryChange?: (category: string) => void;
}

export function LoreForm({ lore, projectId, onSuccess, onCategoryChange }: LoreFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId,
      title: lore?.title || "",
      category: lore?.category || "",
      content: lore?.content || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("/api/lore", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/lore`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/stats`] 
      });
      toast({
        title: "Success",
        description: "Lore entry created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create lore entry",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest(`/api/lore/${lore?.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/lore`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/lore/${lore?.id}`] 
      });
      toast({
        title: "Success",
        description: "Lore entry updated successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lore entry",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (lore) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Container */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-brand-950 mb-4">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lore Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter lore title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      onCategoryChange?.(value);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                      <SelectItem value="religion">Religion</SelectItem>
                      <SelectItem value="politics">Politics</SelectItem>
                      <SelectItem value="geography">Geography</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="magic">Magic</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
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
          <h3 className="text-lg font-semibold text-brand-950 mb-4">Content</h3>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <WordProcessor
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Write about this lore - its history, significance, details, and any important information..."
                    className="min-h-[400px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-6 border-t border-brand-200">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : lore ? "Update Lore" : "Create Lore"}
          </Button>
        </div>
      </form>
    </Form>
  );
}