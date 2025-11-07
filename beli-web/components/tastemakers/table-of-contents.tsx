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

export const TableOfContents = ({ content }: TableOfContentsProps) => {
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
        className="fixed bottom-6 right-6 z-40 rounded-full bg-primary p-4 text-white shadow-lg transition-colors hover:bg-primary/90 lg:hidden"
      >
        <IoList size={24} />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Table of Contents */}
      <div
        className={`fixed z-40 rounded-xl border border-gray-200 bg-white p-6 shadow-xl lg:sticky lg:top-24 lg:block lg:self-start ${isOpen ? 'bottom-20 left-4 right-4' : 'hidden lg:block'} `}
      >
        <div className="mb-4 flex items-center gap-2 border-b pb-3">
          <IoList className="text-primary" size={20} />
          <h3 className="text-lg font-bold">In This Guide</h3>
        </div>

        <nav className="max-h-96 space-y-2 overflow-y-auto">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                activeId === heading.id
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'text-gray-700 hover:bg-gray-100'
              } `}
            >
              {heading.text}
            </button>
          ))}
        </nav>

        <div className="mt-4 border-t pt-4 text-xs text-muted">
          <p>{headings.length} sections in this guide</p>
        </div>
      </div>
    </>
  );
}
