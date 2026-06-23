import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  containerClassName?: string;
  renderTrigger?: (label: string, isOpen: boolean) => React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  triggerClassName = '',
  containerClassName = '',
  renderTrigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`relative inline-block text-left ${containerClassName}`} ref={dropdownRef}>
      <div 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`cursor-pointer ${className}`}
      >
        {renderTrigger ? (
          renderTrigger(displayLabel, isOpen)
        ) : (
          <div className={`flex items-center justify-between w-full ${triggerClassName}`}>
            <span className="truncate">{displayLabel}</span>
            <ChevronDown className={`w-3 h-3 ml-2 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180 opacity-100 text-primary' : 'opacity-50'}`} />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-max min-w-[140px] max-w-[250px] bg-surface dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[100] py-1.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
            {options.map((option) => {
              const isSelected = value === option.value;
              return (
                <div
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center ${
                    isSelected 
                      ? 'bg-primary/10 text-primary font-semibold' 
                      : 'text-on-surface hover:bg-surface-container-high dark:hover:bg-slate-800'
                  }`}
                >
                  {option.label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
