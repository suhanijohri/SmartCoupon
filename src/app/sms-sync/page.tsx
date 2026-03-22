
"use client"

import { useState, useEffect } from "react"
import { extractCouponDetails } from "@/ai/flows/sms-extraction-and-parsing-flow"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  MessageSquare, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw,
  Lock,
  ArrowRight,
  Zap,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CouponCard } from "@/components/CouponCard"
import { Coupon } from "@/types/coupon"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function SmsSyncPage() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [showPermissionDialog, setShowPermissionDialog] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [extractedCoupons, setExtractedCoupons] = useState<Coupon[]>([])
  const { toast } = useToast()

  const inboxSamples = [
    "Your Domino's coupon PIZZA50 is valid until Sunday! Get 50% off on medium pizzas.",
    "SWIGGYIT: Use code HUNGRY to get Rs. 100 flat off on orders above Rs. 400.",
    "ZOMATO: Flat 20% off up to Rs. 120. Code: CRICKET.",
    "Amazon: Big Sale! Use code SAVE200 for Rs. 200 off your next shopping spree."
  ]

  const startAutoSync = () => {
    if (!hasPermission) {
      setShowPermissionDialog(true)
      return
    }
    performSync()
  }

  const handleGrantPermission = () => {
    setHasPermission(true)
    setShowPermissionDialog(false)
    performSync()
  }

  const performSync = async () => {
    setIsSyncing(true)
    setSyncProgress(0)
    setExtractedCoupons([])

    // Progress simulation
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 50)

    try {
      // Simulate batch processing of inbox
      const results = await Promise.all(
        inboxSamples.map(msg => extractCouponDetails({ smsContent: msg }))
      )

      const newCoupons: Coupon[] = results.map((result, i) => ({
        id: Math.random().toString(36).substr(2, 9),
        brand: result.brand,
        couponCode: result.couponCode,
        discountValue: result.discountValue,
        discountType: result.discountType,
        expiryDate: result.expiryDate,
        category: 'Shopping', 
        source: 'SMS',
        description: `Auto-extracted from your promotional inbox.`
      }))

      // Delay for effect
      setTimeout(() => {
        setExtractedCoupons(newCoupons)
        setIsSyncing(false)
        toast({
          title: "Sync Complete",
          description: `Successfully extracted ${newCoupons.length} coupons from your inbox.`,
        })
      }, 2500)

    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Could not read promotional messages at this time.",
        variant: "destructive"
      })
      setIsSyncing(false)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="px-6 pt-12 pb-6 space-y-2">
        <h1 className="text-2xl font-black flex items-center gap-3">
          Smart Sync <Zap className="h-6 w-6 text-primary fill-primary" />
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Automatically extract savings from your inbox.
        </p>
      </header>

      <div className="px-6 space-y-6">
        {/* Permission Status */}
        <Card className={`p-4 border-dashed transition-colors ${hasPermission ? 'bg-green-500/5 border-green-500/20' : 'bg-accent/5 border-accent/20'}`}>
          <div className="flex items-start gap-3">
            {hasPermission ? (
              <ShieldCheck className="h-6 w-6 text-green-500 shrink-0 mt-1" />
            ) : (
              <Lock className="h-6 w-6 text-accent shrink-0 mt-1" />
            )}
            <div className="space-y-1">
              <p className="font-bold text-sm">
                {hasPermission ? "System Access Granted" : "Secure System Sync"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {hasPermission 
                  ? "Connected to promotional message stream. Monitoring for new deals." 
                  : "Grant permission to let SmartCoupon scan your SMS for promotional codes."}
              </p>
            </div>
          </div>
        </Card>

        {/* Sync Action */}
        {!isSyncing && extractedCoupons.length === 0 && (
          <div className="py-8 text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Smartphone className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold">Inbox Auto-Reader</h2>
              <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
                Our AI scans for keywords like "OFF", "CODE", and "EXPIRY" to pull deals automatically.
              </p>
            </div>
            <Button 
              onClick={startAutoSync}
              className="w-full h-14 text-lg font-black orange-gradient rounded-2xl shadow-xl shadow-primary/20"
            >
              START AUTO-SYNC
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Syncing State */}
        {isSyncing && (
          <div className="space-y-6 py-12 text-center animate-in fade-in duration-500">
            <div className="relative w-24 h-24 mx-auto">
              <RefreshCw className="h-24 w-24 text-primary animate-spin opacity-20" />
              <Smartphone className="h-10 w-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-3">
              <p className="font-black text-xl animate-pulse">Scanning Messages...</p>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                Identifying Promotional Tags
              </p>
              <div className="max-w-[200px] mx-auto">
                <Progress value={syncProgress} className="h-1" />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {extractedCoupons.length > 0 && !isSyncing && (
          <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Found {extractedCoupons.length} New Coupons
              </h3>
              <Button variant="ghost" size="sm" onClick={performSync} className="text-xs font-bold gap-1">
                <RefreshCw className="h-3 w-3" /> RE-SCAN
              </Button>
            </div>
            <div className="space-y-4">
              {extractedCoupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          </div>
        )}

        {/* Privacy Note */}
        <div className="pt-4 flex items-center gap-2 text-[10px] text-muted-foreground justify-center">
          <AlertCircle className="h-3 w-3" />
          Only messages with promotional signatures are processed locally.
        </div>
      </div>

      {/* Permission Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="max-w-[320px] rounded-3xl p-6 border-none">
          <DialogHeader className="space-y-4 items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-black">Allow Access?</DialogTitle>
              <DialogDescription className="text-xs font-medium">
                SmartCoupon Hub needs permission to read and manage your SMS messages to automatically detect coupon codes.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 mt-4 sm:flex-col">
            <Button onClick={handleGrantPermission} className="w-full h-12 font-bold orange-gradient rounded-xl border-none">
              ALLOW ACCESS
            </Button>
            <Button variant="ghost" onClick={() => setShowPermissionDialog(false)} className="w-full font-bold text-muted-foreground">
              DENY
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Navigation />
    </div>
  )
}
