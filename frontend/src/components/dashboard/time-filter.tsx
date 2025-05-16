import { Button } from '@/components/ui/button';
import { TimeFilter } from '@/types';
import { cn } from '@/lib/utils';

interface TimeFilterProps {
  filters: { value: TimeFilter; label: string }[];
  activeFilter: TimeFilter;
  onChange: (filter: TimeFilter) => void;
}

export function TimeFilterButtons({ filters, activeFilter, onChange }: TimeFilterProps) {
  console.log('active', activeFilter)
  console.log('filters', filters)
  return (
    <div className="flex items-center space-x-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.label ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(filter.value)}
          className={cn(
            activeFilter === filter.label ? 'bg-primary text-primary-foreground' : '',
            'transition-all'
          )}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}