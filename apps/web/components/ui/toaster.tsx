"use client";

import { useEffect } from "react";

export function Toaster() {
  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    let container = document.getElementById("toast-root");
    if (!container) {
      container = document.createElement("div");
      container.setAttribute("id", "toast-root");
      container.setAttribute("aria-live", "polite");
      container.setAttribute("role", "status");
      container.className = "pointer-events-none fixed inset-0 z-50 flex items-end justify-center p-4";
      document.body.appendChild(container);
    }

    return () => {
      if (container && container.parentElement && container.childElementCount === 0) {
        container.parentElement.removeChild(container);
      }
    };
  }, []);

  return null;
}
