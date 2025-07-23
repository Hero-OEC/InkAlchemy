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
import { insertNoteSchema, type Note } from "@shared/schema";
import { z } from "zod";

const formSchema = insertNoteSchema.extend({
  category: z.string().optional(),
});

interface NoteFormProps {
  note?: Note | null;
  projectId: number;
  onSuccess: () => void;
  onCategoryChange?: (category: string) => void;
}

export function NoteForm({ note, projectId, onSuccess, onCategoryChange }: NoteFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId,
      title: note?.title || "",
      category: note?.category || "",
      content: note?.content || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("/api/notes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/notes`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/stats`] 
      });
      toast({
        title: "Success",
        description: "Note created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest(`/api/notes/${note?.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/notes`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/notes/${note?.id}`] 
      });
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (note) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-brand-950 mb-6">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-900">Note Title *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter note title..."
                      {...field} 
                    />
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
                  <FormLabel className="text-brand-900">Category</FormLabel>
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
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="plot">Plot</SelectItem>
                      <SelectItem value="character">Character</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-brand-950 mb-6">Content</h3>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <WordProcessor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Write your note content..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : note ? "Update Note" : "Create Note"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
