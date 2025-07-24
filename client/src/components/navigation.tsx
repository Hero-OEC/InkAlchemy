import { Link, useLocation } from "wouter";
import { Search, Bell, Settings, Feather } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface NavigationProps {
  onSearch?: (query: string) => void;
}

export function Navigation({ onSearch }: NavigationProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: project } = useQuery({
    queryKey: ["/api/projects", 1],
  });

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-home" },
    { path: "/characters", label: "Characters", icon: "fas fa-users" },
    { path: "/locations", label: "Locations", icon: "fas fa-map-marker-alt" },
    { path: "/timeline", label: "Timeline", icon: "fas fa-clock" },
    { path: "/magic-systems", label: "Magic Systems", icon: "fas fa-magic" },
    { path: "/lore", label: "Lore", icon: "fas fa-book" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Feather className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">InkAlchemy</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`${
                      isActive 
                        ? "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary" 
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <i className={`${item.icon} mr-2 text-sm`} />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              type="text"
              placeholder="Search across all elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </form>
          
          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {project?.name || "Loading..."}
            </span>
            <Button variant="ghost" size="sm">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
