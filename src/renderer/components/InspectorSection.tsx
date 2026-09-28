import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface InspectorSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  headerActions?: React.ReactNode;
}

export default function InspectorSection({ title, icon, children, defaultOpen = true, headerActions }: InspectorSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`inspector-section ${open ? 'open' : ''}`}>
      <div
        role="button"
        tabIndex={0}
        className="inspector-section-header"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } }}
        aria-expanded={open}
        title={open ? `Collapse ${title}` : `Expand ${title}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
          {icon && <span className="inspector-section-icon">{icon}</span>}
          <span className="inspector-section-title">{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
          {headerActions}
          <ChevronDown className="inspector-section-chevron w-4 h-4" aria-hidden="true" />
        </div>
      </div>
      <div className="inspector-section-content">
        <div className="inspector-section-inner">
          <div className="inspector-section-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
