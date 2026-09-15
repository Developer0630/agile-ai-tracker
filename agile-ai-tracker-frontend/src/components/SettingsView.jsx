import { Save } from 'lucide-react';
import { PageHeader, Panel, Input, Textarea, Button } from './ui';

export default function SettingsView({ projectId }) {
  return (
    <div className="space-y-4 max-w-2xl">
      <PageHeader title="Settings" description="Project configuration and preferences." />
      <Panel title="Project details">
        <div className="space-y-3">
          <Input label="Project name" defaultValue="FJra Workspace" />
          <Textarea label="Description" rows={3} />
          <div className="flex items-center justify-between pt-3 border-t border-[#DFE1E6]">
            <button type="button" className="text-xs text-[#DE350B] hover:underline cursor-pointer">Delete project</button>
            <Button variant="primary" size="sm">
              <Save className="w-3.5 h-3.5" /> Save changes
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
