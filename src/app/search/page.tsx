"use client"

import { useState } from "react"
import { MOCK_COUPONS } from "@/app/lib/mock-data"
import { CouponCard } from "@/components/CouponCard"
import { Navigation } from "@/components/Navigation"
import { Input } from "@/components/ui/input"
import { Search as SearchIcon, SlidersHorizontal, ArrowLeft } from "lucide-react"
import { naturalLanguageCouponSearch } from "@/ai/flows/natural-language-coupon-search-flow"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(MOCK_COUPONS)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      setResults(MOCK_COUPONS)
      return
    }

    setIsLoading(true)
    try {
      // Use GenAI flow to extract search intent
      const intent = await naturalLanguageCouponSearch({ query })
      
      const filtered = MOCK_COUPONS.filter(coupon => {
        const matchesBrand = intent.brand ? coupon.brand.toLowerCase().includes(intent.brand.toLowerCase()) : true
        const matchesCategory = intent.category ? coupon.category.toLowerCase().includes(intent.category.toLowerCase()) : true
        const matchesQuery = coupon.brand.toLowerCase().includes(query.toLowerCase()) || 
                            coupon.category.toLowerCase().includes(query.toLowerCase())
        
        return (matchesBrand && matchesCategory) || matchesQuery
      })
      
      setResults(filtered)
    } catch (error) {
      console.error("Search failed", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="px-6 pt-12 pb-6 space-y-4 bg-background sticky top-0 z-30 border-b border-border/5">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Search Coupons</h1>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "pizza deals" or "Amazon codes"' 
            className="pl-10 h-12 rounded-xl bg-card border-border/10 focus:ring-primary"
          />
          <button type="submit" className="hidden" />
        </form>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium">
            {isLoading ? "Analyzing query..." : `${results.length} results found`}
          </p>
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs font-bold">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            FILTERS
          </Button>
        </div>
      </header>

      <div className="px-6 mt-4 space-y-4">
        {results.length > 0 ? (
          results.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
              <SearchIcon className="h-8 w-8" />
            </div>
            <div>
              <p className="font-bold text-foreground">No coupons found</p>
              <p className="text-sm text-muted-foreground">Try searching with broader terms</p>
            </div>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}