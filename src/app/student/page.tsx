"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/teachers");
  }, [router]);

  return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "#64748B" }}>
      <p style={{ fontSize: "15px", fontWeight: "600" }}>Yönlendiriliyorsunuz...</p>
    </div>
  );
}
