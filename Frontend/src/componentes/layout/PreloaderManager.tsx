"use client";

import React, { useState } from "react";
import Preloader from "@/componentes/ui/Preloader";

interface PreloaderManagerProps {
  children: React.ReactNode;
}

export default function PreloaderManager({ children }: PreloaderManagerProps) {
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <>
      {showPreloader ? (
        <Preloader onComplete={() => setShowPreloader(false)} />
      ) : (
        children
      )}
    </>
  );
}
