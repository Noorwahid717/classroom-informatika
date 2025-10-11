"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

const Slot = React.forwardRef<HTMLElement, SlotProps>(({ children, className, ...props }, ref) => {
  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      ...props,
      ref,
      className: cn((children as React.ReactElement).props.className, className)
    });
  }

  return (
    <span ref={ref} className={className} {...props}>
      {children}
    </span>
  );
});

Slot.displayName = "Slot";

export { Slot };
