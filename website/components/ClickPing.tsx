"use client";

import { useEffect } from "react";

export default function ClickPing({ status }: { status: string }) {
  useEffect(() => {
    if (!status) return;
    fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, page: "/" }),
    }).catch(() => {});
  }, [status]);

  return null;
}
