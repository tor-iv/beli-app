'use client';

import { useEffect, useState } from 'react';
import { IoList } from 'react-icons/io5';

interface TableOfContentsProps {
  content: string;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Extract headings from content
    const lines = content.split('\n');
    const extractedHeadings: Heading[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        const text = line.replace(/\*\*/g, '');
        const id = `heading-${index}`;
        extractedHeadings.push({
          id,
          text,
          level: 2,
        });
      }
    });

    setHeadings(extractedHeadings);

    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
      }
    );

    // Observe all headings
    const headingElements = document.querySelectorAll('article h2');
    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [content]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors z-40"
      >
        <IoList size={24} />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Table of Contents */}
      <div
        className={`
          fixed z-40 bg-white rounded-xl shadow-xl border border-gray-200 p-6
          lg:sticky lg:top-24 lg:self-start lg:block
          ${isOpen ? 'bottom-20 left-4 right-4' : 'hidden lg:block'}
        `}
      >
        <div className="flex items-center gap-2 mb-4 pb-3 border-b">
          <IoList className="text-primary" size={20} />
          <h3 className="font-bold text-lg">In This Guide</h3>
        </div>

        <nav className="space-y-2 max-h-96 overflow-y-auto">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={`
                block w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                ${
                  activeId === heading.id
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {heading.text}
            </button>
          ))}
        </nav>

        <div className="mt-4 pt-4 border-t text-xs text-muted">
          <p>{headings.length} sections in this guide</p>
        </div>
      </div>
    </>
  );
}
