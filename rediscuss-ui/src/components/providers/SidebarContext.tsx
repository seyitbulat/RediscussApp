"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";


type SidebarState = {
    collapsed: boolean;
    toggle: () => void;
    set: (v: boolean) => void
};



const SidebarContext = createContext<SidebarState | null>(null);
const STORAGE_KEY = "sidebar:collapsed";


export default function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved != null) setCollapsed(saved === 'true');
        } catch (error) {

        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, String(collapsed));
    });

    const value = useMemo(() => {
        return {
            collapsed,
            toggle: () => setCollapsed(c => !c),
            set: (v: boolean) => setCollapsed(v)
        }
    }, [collapsed]);


     return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}