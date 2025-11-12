'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStore } from '@/store';

const featureOptions = [
  { value: 'daybook', label: 'Daybook' },
  { value: 'incomingOrder', label: 'Incoming Order' },
  { value: 'outgoingOrder', label: 'Outgoing Order' },
  { value: 'inventory', label: 'Inventory' },
];

export default function PreferencesPage() {
  const [feature, setFeature] = useState('');
  const [customSettings, setCustomSettings] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const { coldStorage } = useStore();

  const handleAddSetting = () => {
    if (!newKey.trim() || !feature) return;
    setCustomSettings({ ...customSettings, [newKey]: newValue });
    setNewKey('');
    setNewValue('');
  };

  return (
    <div className="container mx-auto py-10 px-4 space-y-10">
      {/* Debug preview */}
      <div className="mb-12">
        <pre>{JSON.stringify(coldStorage?.preferences, null, 2)}</pre>
      </div>

      {/* Main Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Feature-Specific Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Choose Feature</Label>
            <Select onValueChange={setFeature}>
              <SelectTrigger>
                <SelectValue placeholder="Select a feature" />
              </SelectTrigger>
              <SelectContent>
                {featureOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Key</Label>
              <Input
                placeholder="Setting name (e.g. theme)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>Value</Label>
              <Input
                placeholder="Value (e.g. dark)"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleAddSetting}>Add Preference</Button>

          {feature && Object.keys(customSettings).length > 0 && (
            <div className="mt-4 border-t pt-4 space-y-2">
              <h3 className="font-medium text-lg">Settings for {feature}</h3>
              {Object.entries(customSettings).map(([key, value]) => (
                <div key={key} className="flex justify-between border rounded-md p-2">
                  <span className="font-medium">{key}</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🟩 TODO: Customization Preferences */}
      <Card className="border-dashed border-2 border-muted">
        <CardHeader>
          <CardTitle>📝 TODO: Extend Preferences Functionality</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">{`// Planned Preferences Enhancements:

// 1️⃣ Location Convention
//    - Define the display and sorting order for location hierarchy.
//    - Example: Floor > Row > Chamber
//    - Store this under preferences.locationConvention

// 2️⃣ Marka Convention
//    - Define how Marka labels (brand/marking) are formatted and displayed.
//    - Example: MarkaPrefix + NumberFormat

// 3️⃣ Daybook Visible Columns
//    - Let users select which columns to display in the daybook view.
//    - Example: ["date", "farmer", "commodity", "variety", "quantity"]

// 4️⃣ Language Preference
//    - Allow the user to set preferred language for UI (e.g., English / Hindi).
//    - Store under preferences.language

// 5️⃣ Variety Management
//    - Allow users to add or rename available varieties for commodities.
//    - Example: Potato -> ["Chipsona", "Jyoti", "Kufri Pukhraj"]

// 6️⃣ Commodity Management
//    - Let users add or remove commodities available in the cold storage.
//    - Example: ["Potato", "Onion", "Garlic"]

// 🔜 These will later have dedicated UI components
// for selection, editing, and saving preferences into coldStorage.preferences.`}</pre>

          <Button variant="outline" className="mt-4">
            Implement Later
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
