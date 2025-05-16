import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
// import { 
//   // LayoutDashboard, 
//   Sandwich, 
//   Layers, 
//   BookOpen, 
//   Key,
//   Github,
//   Twitter,
//   Send
// } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("flex h-screen flex-col border-r bg-background", className)}>
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center gap-2">
          {/* <Sandwich className="h-6 w-6 text-orange-500" /> */}
          <span className="text-lg font-bold">MEVision</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="flex flex-col gap-1 px-2">
          <Button variant="ghost" className="justify-start gap-2 px-4" asChild>
            <a href="#" className="flex items-center">
              {/* <Sandwich className="h-4 w-4" /> */}
              <span>Sandwiches</span>
            </a>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 px-4" asChild>
            <a href="#" className="flex items-center">
              {/* <Layers className="h-4 w-4" /> */}
              <span>Arbitrages</span>
            </a>
          </Button>
          <Separator className="my-2" />
          <Button variant="ghost" className="justify-start gap-2 px-4" asChild>
            <a href="#" className="flex items-center">
              {/* <BookOpen className="h-4 w-4" /> */}
              <span>Research</span>
            </a>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 px-4" asChild>
            <a href="#" className="flex items-center">
              {/* <Key className="h-4 w-4" /> */}
              <span>Request API Key</span>
            </a>
          </Button>
        </nav>
      </div>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground mb-2">EXTERNAL LINKS</p>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8">
            {/* <Github className="h-4 w-4" /> */}
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            {/* <Twitter className="h-4 w-4" /> */}
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            {/* <Send className="h-4 w-4" /> */}
          </Button>
        </div>
      </div>
    </div>
  );
}