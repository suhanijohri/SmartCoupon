"use client"

import { useState } from "react"
import { extractCouponDetails } from "@/ai/flows/sms-extraction-and-parsing-flow"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { MessageSquare, RefreshCw, Smartphone, CheckCircle2, ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CouponCard } from "@/components/CouponCard"
import { Coupon } from "@/types/coupon"

export default function SmsSyncPage() {
  const [smsInput, setSmsInput] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)
  const [parsedCoupon, setParsedCoupon] = useState<Coupon | null>(null)
  const { toast } = useToast()

  const handleSync = async () => {
    if (!smsInput.trim()) return

    setIsSyncing(true)
    try {
      const result = await extractCouponDetails({ smsContent: smsInput })
      
      const newCoupon: Coupon = {
        id: Math.random().toString(36).substr(2, 9),
        brand: result.brand,
        couponCode: result.couponCode,
        discountValue: result.discountValue,
        discountType: result.discountType,
        expiryDate: result.expiryDate,
        category: 'Shopping', // Default for simulation
        source: 'SMS',
        description: `Extracted from SMS: Save ${result.discountType === 'FLAT_AMOUNT' ? '₹' : ''}${result.discountValue}${result.discountType === 'PERCENTAGE' ? '%' : ''} at ${result.brand}.`
      }

      setParsedCoupon(newCoupon)
      toast({
        title: "Coupon Extracted!",
        description: `Successfully found ${newCoupon.couponCode} for ${newCoupon.brand}.`,
      })
    } catch (error) {
      toast({
        title: "Extraction Failed",
        description: "Could not parse details from this message.",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const sampleMessages = [
    "Your Domino's coupon PIZZA50 is valid until Sunday! Get 50% off on medium pizzas.",
    "SWIGGYIT: Use code HUNGRY to get Rs. 100 flat off on orders above Rs. 400. Exp 2024-12-01.",
    "ZOMATO: Flat 20% off up to Rs. 120. Code: CRICKET. Valid on all restaurants."
  ]

  return (
    <div className="min-h-screen pb-24">
      <header className="px-6 pt-12 pb-6 space-y-2">
        <h1 className="text-2xl font-black flex items-center gap-3">
          SMS Sync <Smartphone className="h-6 w-6 text-primary" />
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Simulate Android's SMS reading capability to extract hidden savings.
        </p>
      </header>

      <div className="px-6 space-y-6">
        <Card className="p-6 bg-accent/5 border-accent/20 border-dashed">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 text-accent shrink-0 mt-1" />
            <div className="space-y-1">
              <p className="font-bold text-sm">Privacy Guaranteed</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We only process promotional and transactional messages. Personal chats are never read or stored.
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Promotional Message Content
            </label>
            <Textarea 
              value={smsInput}
              onChange={(e) => setSmsInput(e.target.value)}
              placeholder="Paste a promotional SMS here..."
              className="min-h-[120px] bg-card border-border/10 focus:ring-primary rounded-xl"
            />
          </div>

          <Button 
            onClick={handleSync}
            disabled={isSyncing || !smsInput}
            className="w-full h-12 font-bold orange-gradient text-white border-none"
          >
            {isSyncing ? (
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <MessageSquare className="h-5 w-5 mr-2" />
            )}
            EXTRACT COUPON
          </Button>
        </div>

        {parsedCoupon && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Extracted Results
            </h3>
            <CouponCard coupon={parsedCoupon} />
          </div>
        )}

        <div className="pt-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
            Sample Messages
          </h3>
          <div className="space-y-2">
            {sampleMessages.map((msg, i) => (
              <button 
                key={i}
                onClick={() => setSmsInput(msg)}
                className="w-full text-left p-3 text-xs bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/5 transition-colors line-clamp-2"
              >
                "{msg}"
              </button>
            ))}
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  )
}