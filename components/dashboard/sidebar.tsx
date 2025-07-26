"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Settings,
  Ship,
  Truck,
  FileText,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Marchandises",
    href: "/dashboard/marchandises",
    icon: Package,
  },
  {
    name: "Commandes",
    href: "/dashboard/commandes",
    icon: ShoppingCart,
  },
  {
    name: "Port/Déchargement",
    href: "/dashboard/port",
    icon: Ship,
  },
  {
    name: "Transport",
    href: "/dashboard/transport",
    icon: Truck,
    badge: "NEW",
  },
  {
    name: "Entrepôts",
    href: "/dashboard/entrepots",
    icon: Warehouse,
  },
  {
    name: "Ventes",
    href: "/dashboard/ventes",
    icon: TrendingUp,
  },
  {
    name: "Clients",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    name: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
    badge: "NEW",
  },
  {
    name: "Utilisateurs",
    href: "/dashboard/utilisateurs",
    icon: Users,
  },
  {
    name: "Alertes",
    href: "/dashboard/alertes",
    icon: AlertTriangle,
    badge: "3",
  },
  {
    name: "Rapports",
    href: "/dashboard/rapports",
    icon: BarChart3,
  },
  {
    name: "Paramètres",
    href: "/dashboard/parametres",
    icon: Settings,
  },
]

interface DashboardSidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L1</span>
            </div>
            <span className="font-bold text-lg">LOGI-ONE</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10",
                    collapsed && "justify-center px-2",
                    isActive && "bg-secondary",
                  )}
                >
                  <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <Badge variant={item.badge === "NEW" ? "default" : "destructive"} className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {!collapsed && (
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">Documents à renouveler</p>
              <p className="text-xs text-blue-700">3 documents expirent bientôt</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
