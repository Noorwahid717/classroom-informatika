"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string | null;
  setValue: (next: string) => void;
  idPrefix: string;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

const useTabsContext = (component: string): TabsContextValue => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error(`${component} must be used within <Tabs>`);
  }
  return context;
};

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(({ value, defaultValue, onValueChange, className, children, ...props }, ref) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string | null>(defaultValue ?? null);
  const activeValue = (isControlled ? value : internalValue) ?? null;

  React.useEffect(() => {
    if (!isControlled && defaultValue && internalValue === null) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, internalValue, isControlled]);

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const idPrefix = React.useId();

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue, idPrefix }}>
      <div ref={ref} className={cn("grid w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
});
Tabs.displayName = "Tabs";

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    role="tablist"
    aria-orientation={orientation}
    className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}
    {...props}
  />
));
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(({ className, value, disabled, onClick, ...props }, ref) => {
  const { value: activeValue, setValue, idPrefix } = useTabsContext("TabsTrigger");
  const isActive = activeValue === value;
  const triggerId = `${idPrefix}-trigger-${value}`;
  const contentId = `${idPrefix}-content-${value}`;

  return (
    <button
      ref={ref}
      id={triggerId}
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-controls={contentId}
      data-state={isActive ? "active" : "inactive"}
      data-disabled={disabled ? "" : undefined}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !disabled) {
          setValue(value);
        }
      }}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(({ className, value, forceMount = false, ...props }, ref) => {
  const { value: activeValue, idPrefix } = useTabsContext("TabsContent");
  const isActive = activeValue === value;
  const triggerId = `${idPrefix}-trigger-${value}`;
  const contentId = `${idPrefix}-content-${value}`;

  if (!forceMount && !isActive) {
    return null;
  }

  return (
    <div
      ref={ref}
      id={contentId}
      role="tabpanel"
      aria-labelledby={triggerId}
      data-state={isActive ? "active" : "inactive"}
      hidden={!isActive}
      className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}
      {...props}
    />
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
