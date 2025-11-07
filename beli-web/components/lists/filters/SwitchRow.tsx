import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

/**
 * Row with switch toggle and label/description
 * Used for boolean filter options (open now, accepts reservations, etc.)
 */
interface SwitchRowProps {
  /** Unique ID for the switch element */
  id: string;
  /** Main label text */
  label: string;
  /** Optional description text */
  description?: string;
  /** Whether the switch is checked */
  checked: boolean;
  /** Callback when switch is toggled */
  onChange: (checked: boolean) => void;
}

export const SwitchRow = ({ id, label, description, checked, onChange }: SwitchRowProps) => {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="flex-1 cursor-pointer">
        <div className="font-medium">{label}</div>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
