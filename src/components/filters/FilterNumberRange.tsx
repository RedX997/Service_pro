import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FilterNumberRangeProps {
  label: string;
  min: number | '';
  max: number | '';
  onMinChange: (value: number | '') => void;
  onMaxChange: (value: number | '') => void;
  placeholderMin?: string;
  placeholderMax?: string;
}

export function FilterNumberRange({ 
  label, 
  min, 
  max, 
  onMinChange, 
  onMaxChange,
  placeholderMin = 'Min',
  placeholderMax = 'Max'
}: FilterNumberRangeProps) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onMinChange(value === '' ? '' : Number(value));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onMaxChange(value === '' ? '' : Number(value));
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          value={min}
          onChange={handleMinChange}
          placeholder={placeholderMin}
          className="h-9"
          min={0}
        />
        <span className="flex items-center text-muted-foreground">-</span>
        <Input
          type="number"
          value={max}
          onChange={handleMaxChange}
          placeholder={placeholderMax}
          className="h-9"
          min={0}
        />
      </div>
    </div>
  );
}
