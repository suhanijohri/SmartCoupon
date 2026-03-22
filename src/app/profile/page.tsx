"use client"

import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Settings, 
  Heart, 
  History, 
  Bell, 
  Shield, 
  LogOut,
  ChevronRight,
  TrendingUp
} from "lucide-react"

export default function ProfilePage() {
  const menuItems = [
    { icon: Heart, label: "Favorite Brands", color: "text-red-500" },
    { icon: History, label: "Usage History", color: "text-blue-500" },
    { icon: Bell, label: "Notification Settings", color: "text-orange-500" },
    { icon: Shield, label: "Privacy & Permissions", color: "text-green-500" },
    { icon: Settings, label: "Account Settings", color: "text-gray-500" },
  ]

  return (
    <div className="min-h-screen pb-24">
      <header className="px-6 pt-16 pb-10 bg-gradient-to-b from-primary/20 to-transparent">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
            <AvatarImage src="https://picsum.photos/seed/user/200/200" />
            <AvatarFallback className="bg-primary text-white text-2xl font-black">JD</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-black">John Doe</h1>
            <p className="text-sm text-muted-foreground font-medium">Smart Saver since May 2024</p>
          </div>
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none font-bold px-4 py-1">
            PREMIUM USER
          </Badge>
        </div>
      </header>

      <div className="px-6 space-y-8">
        <section className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-card border-border/10 flex flex-col items-center justify-center space-y-1">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-xl font-black">₹4,250</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Saved</span>
          </Card>
          <Card className="p-4 bg-card border-border/10 flex flex-col items-center justify-center space-y-1">
            <History className="h-5 w-5 text-accent" />
            <span className="text-xl font-black">28</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Coupons Used</span>
          </Card>
        </section>

        <section className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button 
                key={item.label}
                className="w-full flex items-center justify-between p-4 bg-card border-b border-border/5 hover:bg-muted/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl last:border-none"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg bg-background ${item.color.replace('text', 'bg').replace('500', '100')} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <span className="font-bold text-sm">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            )
          })}
        </section>

        <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 font-bold gap-2 py-6 rounded-2xl">
          <LogOut className="h-5 w-5" />
          Log Out
        </Button>
      </div>

      <Navigation />
    </div>
  )
}