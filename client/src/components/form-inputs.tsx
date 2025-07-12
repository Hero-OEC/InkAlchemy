import { useState, forwardRef } from "react";
import { ChevronDown, Eye, EyeOff, Search, X } from "lucide-react";
import { cn } from "../lib/utils";

// Base Input Component
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "search" | "password";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, variant = "default", type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [searchValue, setSearchValue] = useState(props.value || "");

    const isPassword = variant === "password" || type === "password";
    const isSearch = variant === "search";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const handleSearchClear = () => {
      setSearchValue("");
      if (props.onChange) {
        props.onChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-brand-900 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {/* Left Icon */}
          {(leftIcon || isSearch) && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-600">
              {isSearch ? <Search className="w-4 h-4" /> : leftIcon}
            </div>
          )}

          <input
            type={inputType}
            className={cn(
              "w-full px-3 py-2.5 text-sm font-normal text-brand-950 bg-brand-50 border border-brand-300 rounded-lg",
              "placeholder:text-brand-500 placeholder:font-light",
              "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400",
              "transition-colors duration-200",
              "disabled:bg-brand-100 disabled:text-brand-500 disabled:cursor-not-allowed",
              error && "border-red-500 focus:ring-red-400 focus:border-red-500",
              (leftIcon || isSearch) && "pl-10",
              (rightIcon || isPassword || (isSearch && searchValue)) && "pr-10",
              className
            )}
            ref={ref}
            value={isSearch ? searchValue : props.value}
            onChange={isSearch ? handleSearchChange : props.onChange}
            {...props}
          />

          {/* Right Icon */}
          {(rightIcon || isPassword || (isSearch && searchValue)) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-brand-600 hover:text-brand-800 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              ) : isSearch && searchValue ? (
                <button
                  type="button"
                  onClick={handleSearchClear}
                  className="text-brand-600 hover:text-brand-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        {/* Helper Text or Error */}
        {(error || helperText) && (
          <p className={cn(
            "mt-1 text-xs font-light",
            error ? "text-red-600" : "text-brand-600"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Textarea Component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, resize = true, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-brand-900 mb-2">
            {label}
          </label>
        )}
        
        <textarea
          className={cn(
            "w-full px-3 py-2.5 text-sm font-normal text-brand-950 bg-brand-50 border border-brand-300 rounded-lg",
            "placeholder:text-brand-500 placeholder:font-light",
            "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400",
            "transition-colors duration-200",
            "disabled:bg-brand-100 disabled:text-brand-500 disabled:cursor-not-allowed",
            !resize && "resize-none",
            error && "border-red-500 focus:ring-red-400 focus:border-red-500",
            className
          )}
          ref={ref}
          {...props}
        />

        {(error || helperText) && (
          <p className={cn(
            "mt-1 text-xs font-light",
            error ? "text-red-600" : "text-brand-600"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

// Select/Dropdown Component
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function Select({
  label,
  error,
  helperText,
  placeholder = "Select an option...",
  options,
  value,
  onChange,
  disabled = false,
  className
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-brand-900 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "w-full px-3 py-2.5 text-sm font-normal text-left bg-brand-50 border border-brand-300 rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400",
            "transition-colors duration-200 flex items-center justify-between",
            disabled && "bg-brand-100 text-brand-500 cursor-not-allowed",
            error && "border-red-500 focus:ring-red-400 focus:border-red-500",
            className
          )}
          disabled={disabled}
        >
          <span className={cn(
            "flex items-center gap-2",
            selectedOption ? "text-brand-950" : "text-brand-500 font-light"
          )}>
            {selectedOption?.icon && (
              <selectedOption.icon className="w-4 h-4 text-brand-600" />
            )}
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 text-brand-600 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-brand-50 border border-brand-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => !option.disabled && handleSelect(option.value)}
                className={cn(
                  "w-full px-3 py-2.5 text-sm font-normal text-left hover:bg-brand-100 transition-colors",
                  "first:rounded-t-lg last:rounded-b-lg flex items-center gap-2",
                  option.disabled && "text-brand-400 cursor-not-allowed hover:bg-transparent",
                  value === option.value && "bg-brand-200 text-brand-950 font-medium"
                )}
                disabled={option.disabled}
              >
                {option.icon && (
                  <option.icon className="w-4 h-4 text-brand-600 flex-shrink-0" />
                )}
                <span className="truncate">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={cn(
          "mt-1 text-xs font-light",
          error ? "text-red-600" : "text-brand-600"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

// Demo Component
export function FormInputsDemo() {
  const [formData, setFormData] = useState({
    characterName: "",
    characterType: "",
    description: "",
    search: "",
    password: ""
  });

  const characterTypes = [
    { value: "protagonist", label: "Protagonist" },
    { value: "antagonist", label: "Antagonist" },
    { value: "supporting", label: "Supporting Character" },
    { value: "ally", label: "Ally" },
    { value: "neutral", label: "Neutral" },
    { value: "love-interest", label: "Love Interest" },
    { value: "villain", label: "Villain" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-6">Form Input Components</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Text Input */}
          <Input
            label="Character Name"
            placeholder="Enter character name..."
            value={formData.characterName}
            onChange={(e) => setFormData(prev => ({ ...prev, characterName: e.target.value }))}
            helperText="The main name your character goes by"
          />

          {/* Select Dropdown */}
          <Select
            label="Character Type"
            placeholder="Choose character type..."
            options={characterTypes}
            value={formData.characterType}
            onChange={(value) => setFormData(prev => ({ ...prev, characterType: value }))}
            helperText="Select the role this character plays in your story"
          />

          {/* Search Input */}
          <Input
            label="Search Characters"
            variant="search"
            placeholder="Search by name, type, or description..."
            value={formData.search}
            onChange={(e) => setFormData(prev => ({ ...prev, search: e.target.value }))}
            helperText="Find characters in your project"
          />

          {/* Password Input */}
          <Input
            label="Project Password"
            variant="password"
            placeholder="Enter secure password..."
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            helperText="Password to protect your project"
          />
        </div>

        {/* Textarea */}
        <div className="mt-6">
          <Textarea
            label="Character Description"
            placeholder="Describe your character's appearance, personality, background..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            helperText="Detailed description helps bring your character to life"
          />
        </div>
      </div>

      {/* Error State Examples */}
      <div>
        <h4 className="text-md font-medium text-brand-900 mb-4">Error States</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Invalid Input"
            placeholder="This field has an error..."
            error="This field is required"
          />
          
          <Select
            label="Required Selection"
            placeholder="Please select an option..."
            options={characterTypes}
            error="You must choose a character type"
          />
        </div>
      </div>

      {/* Design Features */}
      <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
        <h4 className="text-md font-medium text-brand-900 mb-3">Input Features</h4>
        <ul className="text-sm text-brand-700 space-y-2">
          <li>• <strong>Cairo typography:</strong> Consistent font weights and hierarchy</li>
          <li>• <strong>Brand colors:</strong> Uses brand-50 backgrounds with brand-300 borders</li>
          <li>• <strong>Focus states:</strong> Brand-400 ring and border on focus</li>
          <li>• <strong>Search variant:</strong> Built-in search icon and clear functionality</li>
          <li>• <strong>Password variant:</strong> Toggle visibility with eye icon</li>
          <li>• <strong>Error handling:</strong> Red borders and error messages</li>
          <li>• <strong>Disabled states:</strong> Proper styling for inactive inputs</li>
          <li>• <strong>Helper text:</strong> Additional context below inputs</li>
        </ul>
      </div>
    </div>
  );
}