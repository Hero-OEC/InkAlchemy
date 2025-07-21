import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-50">
      <Card className="w-full max-w-md mx-4 bg-brand-100 border-brand-200">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-brand-600" />
            <h1 className="text-2xl font-bold text-brand-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-brand-700">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 w-full bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Return to Welcome Page
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
