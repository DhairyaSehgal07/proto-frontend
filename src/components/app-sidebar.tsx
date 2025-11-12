'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users, BarChart3, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    name: 'Daybook',
    href: '/store-admin/daybook',
    icon: BookOpen,
  },
  {
    name: 'People',
    href: '/store-admin/people',
    icon: Users,
  },
  {
    name: 'Analytics',
    href: '/store-admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/store-admin/settings',
    icon: Settings,
    // 👇 all routes that should count as active
    activePaths: [
      '/store-admin/settings',
      '/store-admin/settings/rbac',
      '/store-admin/settings/profile',
      '/store-admin/settings/preferences',
    ],
  },
];

const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <h1 className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Coldop
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                // ✅ Mark active if pathname matches item.href or one of its activePaths
                const isActive =
                  pathname === item.href ||
                  item.activePaths?.some((path) => pathname.startsWith(path));

                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      variant="coldop-variant"
                      tooltip={item.name}
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
