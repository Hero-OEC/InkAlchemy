import { useState } from "react";
import { Book, Users, MapPin, Calendar, Sparkles, StickyNote, Home, Menu, X } from "lucide-react";
import { Button } from "./button-variations";
import logoPath from "@assets/inkalchemy_1752303410066.png";

export interface NavbarProps {
  hasActiveProject?: boolean;
  currentPage?: string;
  onNavigate?: (page: string) => void;
  projectName?: string;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "timeline", label: "Timeline", icon: Calendar },
  { id: "characters", label: "Characters", icon: Users },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "magic-systems", label: "Magic", icon: Sparkles },
  { id: "lore", label: "Lore", icon: Book },
  { id: "notes", label: "Notes", icon: StickyNote },
];

export function Navbar({ 
  hasActiveProject = false, 
  currentPage = "dashboard",
  onNavigate,
  projectName 
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (pageId: string) => {
    onNavigate?.(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-brand-100 border-b-2 border-brand-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
          >
            <img 
              src={logoPath} 
              alt="InkAlchemy Logo" 
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-brand-800">InkAlchemy</h1>
              <span className="text-xs text-brand-600 -mt-1 font-normal">
                {hasActiveProject && projectName ? projectName : "Your Creative Writing Companion"}
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          {hasActiveProject && (
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-brand-400 text-white shadow-sm' 
                        : 'text-brand-700 hover:bg-brand-200 hover:text-brand-900'
                      }
                    `}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Mobile Menu Button */}
          {hasActiveProject && (
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          )}

          {/* Welcome State - No Navigation */}
          {!hasActiveProject && (
            <div className="text-brand-600 text-sm font-medium">
              Welcome to your world-building journey
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {hasActiveProject && isMobileMenuOpen && (
          <div className="md:hidden border-t border-brand-200 bg-brand-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`
                      flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-brand-400 text-white' 
                        : 'text-brand-700 hover:bg-brand-100 hover:text-brand-900'
                      }
                    `}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Demo component to showcase different navbar states
export function NavbarDemo() {
  const [currentDemo, setCurrentDemo] = useState<"welcome" | "project">("welcome");
  const [currentPage, setCurrentPage] = useState("dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Navbar States</h3>
        <div className="flex gap-3 mb-6">
          <Button
            variant={currentDemo === "welcome" ? "primary" : "outline"}
            onClick={() => setCurrentDemo("welcome")}
          >
            Welcome State
          </Button>
          <Button
            variant={currentDemo === "project" ? "primary" : "outline"}
            onClick={() => setCurrentDemo("project")}
          >
            Project Active
          </Button>
        </div>
      </div>

      {/* Navbar Preview */}
      <div className="border border-brand-200 rounded-lg overflow-hidden">
        <Navbar
          hasActiveProject={currentDemo === "project"}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          projectName={currentDemo === "project" ? "The Chronicles of Mystara" : undefined}
        />
        
        {/* Content Area Preview */}
        <div className="p-8 bg-brand-50 min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-brand-900 mb-2">
              {currentDemo === "welcome" 
                ? "Welcome Screen" 
                : `${navigationItems.find(item => item.id === currentPage)?.label} Page`
              }
            </h2>
            <p className="text-brand-600">
              {currentDemo === "welcome" 
                ? "Navigation buttons are hidden until a project is selected"
                : `Currently viewing the ${currentPage} section`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-brand-100 border border-brand-200 rounded-lg p-4">
        <h4 className="font-semibold text-brand-900 mb-2">How to Use:</h4>
        <ul className="text-sm text-brand-700 space-y-1">
          <li>• <code>hasActiveProject</code> - Controls whether navigation buttons appear</li>
          <li>• <code>currentPage</code> - Highlights the active page</li>
          <li>• <code>onNavigate</code> - Callback function for page navigation</li>
          <li>• <code>projectName</code> - Optional project name display</li>
        </ul>
      </div>
    </div>
  );
}