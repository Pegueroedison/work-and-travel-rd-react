import { useState, type HTMLAttributes, type ReactNode } from 'react';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { variant?: BadgeVariant; children: ReactNode; }
export function Badge({ variant = 'default', children, className = '', ...props }: BadgeProps) {
  return <span className={`badge ${variant !== 'default' ? `badge-${variant}` : ''} ${className}`.trim()} {...props}>{children}</span>;
}

interface ChipProps { active?: boolean; onClick?: () => void; children: ReactNode; className?: string; }
export function Chip({ active, onClick, children, className = '' }: ChipProps) {
  return <button className={`chip ${active ? 'active' : ''} ${className}`.trim()} onClick={onClick} type="button" aria-pressed={active}>{children}</button>;
}

interface TabItem { id: string; label: string; icon?: ReactNode; }
interface TabsProps { items: TabItem[]; activeId: string; onChange: (id: string) => void; className?: string; }
export function Tabs({ items, activeId, onChange, className = '' }: TabsProps) {
  return (
    <div className={`tabs ${className}`.trim()} role="tablist">
      {items.map((item) => <button key={item.id} className={`tab-item ${activeId === item.id ? 'active' : ''}`} role="tab" aria-selected={activeId === item.id} onClick={() => onChange(item.id)} type="button">{item.icon}{item.label}</button>)}
    </div>
  );
}

interface AccordionItemData { id: string; trigger: ReactNode; content: ReactNode; defaultOpen?: boolean; }
interface AccordionProps { items: AccordionItemData[]; allowMultiple?: boolean; }
export function Accordion({ items, allowMultiple = true }: AccordionProps) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(items.filter((item) => item.defaultOpen).map((item) => item.id)));
  const toggle = (id: string) => {
    setOpen((previous) => {
      const next = allowMultiple ? new Set(previous) : new Set<string>();
      if (previous.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  return (
    <div className="accordion">
      {items.map((item) => {
        const isOpen = open.has(item.id);
        return (
          <div key={item.id} className="accordion-item">
            <button className="accordion-trigger" onClick={() => toggle(item.id)} aria-expanded={isOpen} type="button"><span>{item.trigger}</span><Chevron open={isOpen} /></button>
            {isOpen ? <div className="accordion-content">{item.content}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return <svg className={`accordion-chevron ${open ? 'open' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>;
}
