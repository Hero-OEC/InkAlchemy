import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  // Log when this component renders to help debug
  console.log("NotFound component is rendering! Current URL:", window.location.href);
  
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-red-500 bg-opacity-90 z-50">
      <Card className="w-full max-w-md mx-4 bg-white border-2 border-red-600">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-bold text-red-900">DEBUG: 404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-red-700">
            URL: {window.location.href}
          </p>
          <p className="mt-2 text-sm text-red-700">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Return to Welcome Page
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
