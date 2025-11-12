import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight, Shield, User, SlidersHorizontal } from 'lucide-react';

export default function SettingsPage() {
  const settings = [
    {
      title: 'RBAC Settings',
      description: 'Manage roles, permissions, and access levels for users.',
      icon: <Shield className="w-6 h-6 text-primary" />,
      href: 'settings/rbac',
    },
    {
      title: 'Profile Settings',
      description: 'Update your personal information and account details.',
      icon: <User className="w-6 h-6 text-primary" />,
      href: 'settings/profile',
    },
    {
      title: 'Preferences',
      description: 'Customize theme, language, and notification settings.',
      icon: <SlidersHorizontal className="w-6 h-6 text-primary" />,
      href: 'settings/preferences',
    },
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-semibold mb-6">Settings</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {settings.map((setting) => (
          <Link key={setting.href} href={setting.href} className="block">
            <Card className="transition-all hover:shadow-md cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  {setting.icon}
                  <CardTitle>{setting.title}</CardTitle>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>{setting.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
