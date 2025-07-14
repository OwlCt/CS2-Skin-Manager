"use client";

import { useEffect } from "react";

export default function ScrollToHash() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        // Add a small delay to ensure the page has rendered
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            // Scroll to the element
            element.scrollIntoView({ behavior: "smooth", block: "center" });

            // Dispatch custom event to notify the card component
            const event = new CustomEvent("hashHighlight", {
              detail: { elementId: hash.substring(1) },
            });
            window.dispatchEvent(event);
          }
        }, 100);
      }
    }
  }, []);

  return null;
}
