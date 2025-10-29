"use client"

import * as React from "react"
import { Search, X, HelpCircle } from "lucide-react"
import { AccordionItem } from "@/components/faq/accordion-item"
import { faqData, faqCategories, searchFAQs, getFAQsByCategory } from "@/lib/data/faq-data"
import { Input } from "@/components/ui/input"

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filteredFAQs, setFilteredFAQs] = React.useState(faqData)

  React.useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredFAQs(searchFAQs(searchQuery))
    } else {
      setFilteredFAQs(faqData)
    }
  }, [searchQuery])

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  // Group FAQs by category if not searching
  const faqsByCategory = React.useMemo(() => {
    if (searchQuery.trim()) {
      return null
    }
    return faqCategories.map((category) => ({
      category,
      faqs: getFAQsByCategory(category),
    }))
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
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
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-secondary" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {/* Show results or categories */}
        {searchQuery.trim() ? (
          /* Search Results */
          <div>
            {filteredFAQs.length > 0 ? (
              <>
                <div className="px-4 py-3 bg-gray-100">
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Search Results
                  </h2>
                </div>
                <div className="bg-white border-b border-gray-200 shadow-sm">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="px-4 py-12 text-center">
                <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground mb-2">
                  No results found for &quot;{searchQuery}&quot;
                </p>
                <p className="text-sm text-secondary">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Categories */
          <div className="space-y-0">
            {faqsByCategory?.map(({ category, faqs }) => (
              <div key={category}>
                {/* Category Header */}
                <div className="bg-gray-100 px-4 py-3 sticky top-[73px] z-10">
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    {category}
                  </h2>
                </div>

                {/* FAQ Items */}
                <div className="bg-white border-b border-gray-200 shadow-sm">
                  {faqs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
