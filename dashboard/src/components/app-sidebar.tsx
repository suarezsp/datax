// src/components/app-sidebar.tsx
"use client";

import * as React from "react";
import {
  IconAperture,
  IconDashboard,
  IconListDetails,
  IconChartBar,
  IconFolder,
  IconUsers,
  IconDatabase,
  IconReport,
  IconSettings,
  IconHelp,
  IconSearch,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const data = {
  user: {
    name: "suarez",
    email: "nefer@suarez.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "#", icon: IconDashboard },
    { title: "Lifecycle", url: "#", icon: IconListDetails },
    { title: "Analytics", url: "#", icon: IconChartBar },
    { title: "Projects", url: "#", icon: IconFolder },
    { title: "Team", url: "#", icon: IconUsers },
  ],
  documents: [
    { name: "Data Library", url: "#", icon: IconDatabase },
    { name: "Reports", url: "#", icon: IconReport },
  ],
  navSecondary: [
    { title: "Settings", url: "#", icon: IconSettings },
    { title: "Help", url: "#", icon: IconHelp },
    { title: "Search", url: "#", icon: IconSearch },
  ],
};

function useDarkMode() {
  const [isDark, setIsDark] = React.useState(() =>
    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
  );

  React.useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("theme");
    if (saved === "dark") setIsDark(true);
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggle = React.useCallback(() => setIsDark((v) => !v), []);
  return { isDark, toggle };
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isDark, toggle } = useDarkMode();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconAperture className="!size-5" />
                <span className="text-lg font-semibold">hydra.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments
          items={data.documents.map((d) => ({ ...d, icon: d.icon }))}
        />

        {/* Toggle de modo oscuro situado por encima de la sección secundaria */}
        <div className="px-3 mt-4">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={toggle}>
            {isDark ? <IconSun className="!size-4 mr-2" /> : <IconMoon className="!size-4 mr-2" />}
            {isDark ? "Light mode" : "Dark mode"}
          </Button>
        </div>

        {/* Navegación secundaria (Settings, Help, Search) */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
