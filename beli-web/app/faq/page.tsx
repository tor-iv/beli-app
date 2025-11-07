'use client';

import { Search, X, HelpCircle } from 'lucide-react';
import * as React from 'react';

import { AccordionItem } from '@/components/faq/accordion-item';
import { Input } from '@/components/ui/input';
import { faqData, faqCategories, searchFAQs, getFAQsByCategory } from '@/lib/data/faq-data';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredFAQs, setFilteredFAQs] = React.useState(faqData);

  React.useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredFAQs(searchFAQs(searchQuery));
    } else {
      setFilteredFAQs(faqData);
    }
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Group FAQs by category if not searching
  const faqsByCategory = React.useMemo(() => {
    if (searchQuery.trim()) {
      return null;
    }
    return faqCategories.map((category) => ({
      category,
      faqs: getFAQsByCategory(category),
    }));
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
            <Input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-secondary" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl">
        {/* Show results or categories */}
        {searchQuery.trim() ? (
          /* Search Results */
          <div>
            {filteredFAQs.length > 0 ? (
              <>
                <div className="bg-gray-100 px-4 py-3">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                    Search Results
                  </h2>
                </div>
                <div className="border-b border-gray-200 bg-white shadow-sm">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem key={faq.id} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="px-4 py-12 text-center">
                <HelpCircle className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <p className="mb-2 text-lg font-semibold text-foreground">
                  No results found for &quot;{searchQuery}&quot;
                </p>
                <p className="text-sm text-secondary">Try searching with different keywords</p>
              </div>
            )}
          </div>
        ) : (
          /* Categories */
          <div className="space-y-0">
            {faqsByCategory?.map(({ category, faqs }) => (
              <div key={category}>
                {/* Category Header */}
                <div className="sticky top-[73px] z-10 bg-gray-100 px-4 py-3">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                    {category}
                  </h2>
                </div>

                {/* FAQ Items */}
                <div className="border-b border-gray-200 bg-white shadow-sm">
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.id} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
