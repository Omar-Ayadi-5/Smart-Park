import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { subscribeApiLoading } from "@smart-park/shared/services/apiLoadingStore";

export default function GlobalApiLoadingOverlay() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    return subscribeApiLoading((count) => {
      setActive(count > 0);
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  if (!active) return null;

  return createPortal(
    <div
      className="global-api-loading-root"
      role="alert"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="global-api-loading-panel">
        <div className="global-api-loading-spinner" aria-hidden="true" />
        <p className="global-api-loading-text">Loading…</p>
      </div>
    </div>,
    document.body
  );
}
