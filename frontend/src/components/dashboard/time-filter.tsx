import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TimeFilterProps {
  filters: { value: string; label: string }[];
  activeFilter: string;
  onChange: (filter: string) => void;
}

export function TimeFilterButtons({ filters, activeFilter, onChange }: TimeFilterProps) {
  return (
    <div className="flex items-center space-x-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(filter.value)}
          className={cn(
            activeFilter === filter.value ? 'bg-primary text-primary-foreground' : '',
            'transition-all'
          )}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}