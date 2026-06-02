"use client";

import { useEffect } from "react";

export default function VisitorPing() {
  useEffect(() => {
    // Cookie on the server gates double-counting; this just kicks the endpoint
    // once per page load. Fire-and-forget, errors are silenced.
    fetch("/api/visit", { method: "POST", cache: "no-store" }).catch(() => null);
  }, []);
  return null;
}
