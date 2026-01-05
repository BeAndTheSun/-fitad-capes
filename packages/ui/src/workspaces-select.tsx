import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@meltstudio/theme';
import type { FC } from 'react';

type Workspace = {
  id: string;
  name: string;
};

export type WorkspacesSelectProps = {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  onSelectWorkspace: (workspace: string) => void;
  isLoading: boolean;
};

const WorkspacesSelect: FC<WorkspacesSelectProps> = ({
  workspaces,
  selectedWorkspace,
  onSelectWorkspace,
  isLoading,
}) => {
  return (
    <div className="mb-4 w-full">
      <Select onValueChange={onSelectWorkspace} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <span
              className="block max-w-[155px] truncate"
              title={selectedWorkspace?.name}
            >
              {selectedWorkspace?.name}
            </span>
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {workspaces.map((w) => (
            <SelectItem key={w.id} value={w.id}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { WorkspacesSelect };
