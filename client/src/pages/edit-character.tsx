import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { Input, Select, Textarea } from "@/components/form-inputs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertCharacterSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { type Character, type Project } from "@shared/schema";
import { ArrowLeft, Users } from "lucide-react";

export default function EditCharacter() {
  const { projectId, characterId } = useParams();
  const [, setLocation] = useLocation();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: character } = useQuery<Character>({
    queryKey: [`/api/characters/${characterId}`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/characters/${characterId}`);
  };

  const handleSuccess = () => {
    setLocation(`/projects/${projectId}/characters/${characterId}`);
  };

  if (!character) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true}
        currentPage="characters"
        onNavigate={handleNavigation}
        projectName={project?.name}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Character
          </Button>
        </div>

        {/* Character Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-brand-500 p-3 rounded-xl">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-950">Edit Character</h1>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-200 text-brand-700">
                    Editing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form Content */}
          <div className="lg:col-span-2">
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              <EditCharacterForm 
                character={character}
                projectId={parseInt(projectId!)}
                onSuccess={handleSuccess}
              />
            </div>
          </div>

          {/* Right Column - Character Preview */}
          <div className="lg:col-span-1">
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6 mb-6">
              {/* Character Image */}
              <div className="aspect-square w-full bg-brand-100 rounded-lg overflow-hidden border-2 border-brand-200 mb-4">
                {character?.imageUrl ? (
                  <img 
                    src={character.imageUrl} 
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-400">
                    <Users size={64} />
                  </div>
                )}
              </div>
              
              {/* Character Info Preview */}
              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-brand-950">{character?.name || "Character Name"}</h3>
                  <p className="text-sm text-brand-600">{character?.type || "Character Type"}</p>
                </div>
                
                {character?.age && (
                  <div className="flex items-center gap-2 p-3 bg-brand-100 border border-brand-200 rounded-lg">
                    <div className="text-xs font-medium text-brand-500 uppercase tracking-wide">Age:</div>
                    <div className="text-sm font-semibold text-brand-900">{character.age}</div>
                  </div>
                )}
                
                {(character as any)?.race && (
                  <div className="flex items-center gap-2 p-3 bg-brand-100 border border-brand-200 rounded-lg">
                    <div className="text-xs font-medium text-brand-500 uppercase tracking-wide">Race:</div>
                    <div className="text-sm font-semibold text-brand-900">{(character as any).race}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}