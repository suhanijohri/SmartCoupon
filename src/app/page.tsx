"use client"

import { MOCK_COUPONS } from "@/app/lib/mock-data"
import { CouponCard } from "@/components/CouponCard"
import { Navigation } from "@/components/Navigation"
import { CATEGORIES } from "@/types/coupon"
import { Bell, Sparkles, Clock, LayoutGrid } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const bestCoupons = MOCK_COUPONS.filter(c => c.isBest)
  const expiringSoon = MOCK_COUPONS.filter(c => c.isExpiringSoon)
  const otherCoupons = MOCK_COUPONS.filter(c => !c.isBest && !c.isExpiringSoon)

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-gradient-to-b from-primary/10 to-transparent">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            SmartCoupon <Sparkles className="h-6 w-6 text-primary fill-primary" />
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Save smarter, not harder.</p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        </Button>
      </header>

      <div className="px-6 space-y-10">
        {/* Best Recommendations */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Best Value For You
            </h2>
            <Button variant="link" className="text-primary text-xs font-bold p-0">View All</Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
            {bestCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} variant="compact" />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Explore Categories</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-card border border-border/5 rounded-2xl hover:border-primary/40 transition-all hover:scale-105 active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-xs">{category[0]}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{category}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Expiring Soon */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Expiring Soon
            </h2>
            <Badge variant="outline" className="text-[10px] text-accent border-accent/20">Hurry!</Badge>
          </div>
          <div className="space-y-4">
            {expiringSoon.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </section>

        {/* All Coupons List */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold">Featured Deals</h2>
          <div className="space-y-4">
            {otherCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </section>
      </div>

      <Navigation />
    </div>
  )
}