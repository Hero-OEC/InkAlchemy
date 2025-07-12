import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  fullWidth?: boolean;
}

const buttonVariants = {
  variant: {
    primary: "bg-brand-400 text-white hover:bg-brand-500 active:bg-brand-600 focus:ring-brand-400 shadow-sm",
    secondary: "bg-brand-200 text-brand-900 hover:bg-brand-300 active:bg-brand-400 active:text-white focus:ring-brand-200",
    outline: "border-2 border-brand-400 text-brand-700 hover:bg-brand-50 hover:border-brand-500 active:bg-brand-100 focus:ring-brand-400",
    ghost: "text-brand-700 hover:bg-brand-100 active:bg-brand-200 focus:ring-brand-200",
    danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500 shadow-sm",
    success: "bg-green-500 text-white hover:bg-green-600 active:bg-green-700 focus:ring-green-500 shadow-sm"
  },
  size: {
    sm: "px-3 py-1.5 text-sm font-medium",
    md: "px-4 py-2 text-sm font-medium", 
    lg: "px-6 py-3 text-base font-medium",
    xl: "px-8 py-4 text-lg font-semibold"
  }
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "primary", 
    size = "md", 
    loading = false,
    fullWidth = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed",
          // Variant styles
          buttonVariants.variant[variant],
          // Size styles
          buttonVariants.size[size],
          // Full width
          fullWidth && "w-full",
          // Custom className
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };

// Demo component to showcase all variations
export function ButtonShowcase() {
  return (
    <div className="space-y-8">
      {/* Button Variants */}
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Button Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
        </div>
      </div>

      {/* Button Sizes */}
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Button Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </div>

      {/* Loading States */}
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Loading States</h3>
        <div className="flex flex-wrap gap-3">
          <Button loading>Loading...</Button>
          <Button variant="secondary" loading>Processing</Button>
          <Button variant="outline" loading>Saving</Button>
        </div>
      </div>

      {/* Disabled States */}
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Disabled States</h3>
        <div className="flex flex-wrap gap-3">
          <Button disabled>Disabled Primary</Button>
          <Button variant="secondary" disabled>Disabled Secondary</Button>
          <Button variant="outline" disabled>Disabled Outline</Button>
        </div>
      </div>

      {/* Full Width */}
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Full Width</h3>
        <div className="space-y-3 max-w-md">
          <Button fullWidth>Full Width Primary</Button>
          <Button variant="secondary" fullWidth>Full Width Secondary</Button>
        </div>
      </div>

      {/* Interactive Examples */}
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Interactive Examples</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => alert("Primary clicked!")}>
            Click Me
          </Button>
          <Button 
            variant="outline" 
            onClick={() => console.log("Outline clicked!")}
          >
            Log to Console
          </Button>
          <Button 
            variant="danger" 
            onClick={() => confirm("Are you sure?")}
          >
            Confirm Action
          </Button>
        </div>
      </div>
    </div>
  );
}