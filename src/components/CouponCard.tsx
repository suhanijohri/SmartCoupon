"use client"

import { Coupon } from "@/types/coupon"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Copy, Check, Info } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface CouponCardProps {
  coupon: Coupon
  variant?: 'compact' | 'full'
}

export function CouponCard({ coupon, variant = 'full' }: CouponCardProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const copyCode = () => {
    navigator.clipboard.writeText(coupon.couponCode)
    setCopied(true)
    toast({
      title: "Code Copied!",
      description: `${coupon.couponCode} is ready to use for ${coupon.brand}.`,
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const isFlat = coupon.discountType === 'FLAT_AMOUNT'

  return (
    <Card className={cn(
      "group relative overflow-hidden bg-card border-border/5 hover:border-primary/20 transition-all duration-300",
      variant === 'compact' ? "w-[240px] shrink-0" : "w-full"
    )}>
      {coupon.isBest && (
        <div className="absolute top-0 right-0 bg-primary px-3 py-1 rounded-bl-lg text-[10px] font-bold text-white z-10 animate-pulse">
          BEST VALUE
        </div>
      )}
      
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
              {coupon.brand}
            </h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
              {coupon.category}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-primary">
              {isFlat ? `₹${coupon.discountValue}` : `${coupon.discountValue}%`}
              <span className="text-sm font-bold block -mt-1 text-muted-foreground uppercase">OFF</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-foreground/80 line-clamp-2 min-h-[40px]">
          {coupon.description || `Special offer from ${coupon.brand}`}
        </p>

        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {coupon.expiryDate ? `EXP: ${new Date(coupon.expiryDate).toLocaleDateString()}` : "NO EXPIRY"}
          </div>
          <div className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            {coupon.source}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <div className="flex-1 bg-secondary rounded-lg px-3 h-10 flex items-center justify-between border border-border/50">
            <code className="text-sm font-mono font-bold text-primary tracking-wider">
              {coupon.couponCode}
            </code>
            <button 
              onClick={copyCode}
              className="p-1 hover:text-primary transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <Button 
            className="orange-gradient border-none hover:opacity-90 transition-opacity font-bold"
            onClick={copyCode}
          >
            APPLY
          </Button>
        </div>
      </div>
      
      {coupon.isExpiringSoon && (
        <div className="h-1 w-full bg-accent animate-pulse" />
      )}
    </Card>
  )
}