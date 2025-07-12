import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./button-variations";

export interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  description,
  itemName,
  isLoading = false,
  confirmText = "Delete",
  cancelText = "Cancel"
}: DeleteConfirmationProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Backdrop with blur and dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-brand-50 border-2 border-brand-200 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-brand-950">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-brand-600 hover:text-brand-800 hover:bg-brand-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-brand-800 leading-relaxed">
              {description}
            </p>
            {itemName && (
              <div className="mt-3 p-3 bg-brand-100 border border-brand-200 rounded-lg">
                <p className="text-sm text-brand-700">
                  <span className="font-medium">Item to delete:</span> {itemName}
                </p>
              </div>
            )}
          </div>

          {/* Warning Notice */}
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <span className="font-medium">Warning:</span> This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <Button
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Demo component to showcase the delete confirmation
export function DeleteConfirmationDemo() {
  const [showCharacterDelete, setShowCharacterDelete] = useState(false);
  const [showLocationDelete, setShowLocationDelete] = useState(false);
  const [showMagicSystemDelete, setShowMagicSystemDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (type: string) => {
    setIsDeleting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDeleting(false);
    
    // Close all modals
    setShowCharacterDelete(false);
    setShowLocationDelete(false);
    setShowMagicSystemDelete(false);
    
    alert(`${type} deleted successfully!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Delete Confirmation Popups</h3>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="danger" 
            onClick={() => setShowCharacterDelete(true)}
          >
            Delete Character
          </Button>
          <Button 
            variant="danger" 
            onClick={() => setShowLocationDelete(true)}
          >
            Delete Location
          </Button>
          <Button 
            variant="danger" 
            onClick={() => setShowMagicSystemDelete(true)}
          >
            Delete Magic System
          </Button>
        </div>
      </div>

      {/* Character Delete Confirmation */}
      <DeleteConfirmation
        isOpen={showCharacterDelete}
        onClose={() => setShowCharacterDelete(false)}
        onConfirm={() => handleDelete("Character")}
        title="Delete Character"
        description="Are you sure you want to delete this character? All associated relationships, storylines, and references will also be removed from your project."
        itemName="Lady Aeliana the Wise"
        isLoading={isDeleting}
      />

      {/* Location Delete Confirmation */}
      <DeleteConfirmation
        isOpen={showLocationDelete}
        onClose={() => setShowLocationDelete(false)}
        onConfirm={() => handleDelete("Location")}
        title="Delete Location"
        description="This will permanently remove the location from your world. Any events, characters, or scenes associated with this location will lose their geographical context."
        itemName="The Crystal Caverns of Mystara"
        isLoading={isDeleting}
        confirmText="Remove Location"
      />

      {/* Magic System Delete Confirmation */}
      <DeleteConfirmation
        isOpen={showMagicSystemDelete}
        onClose={() => setShowMagicSystemDelete(false)}
        onConfirm={() => handleDelete("Magic System")}
        title="Delete Magic System"
        description="Deleting this magic system will remove all its rules, limitations, and associated lore. Characters who use this magic system will need to be updated manually."
        itemName="Elemental Weaving System"
        isLoading={isDeleting}
        confirmText="Delete System"
        cancelText="Keep System"
      />
    </div>
  );
}

// Hook for easier state management
export function useDeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  
  const handleConfirm = async (deleteAction: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await deleteAction();
      closeModal();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    isLoading,
    openModal,
    closeModal,
    handleConfirm
  };
}