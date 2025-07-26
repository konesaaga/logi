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
  Package2,
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

export function DashboardSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-72",
      )}
    >
      {/* Header avec logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-[#0F4C75] p-2 rounded-lg">
              <Package2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F4C75]">LOGI-ONE</h1>
              <p className="text-xs text-gray-500">Gestion Logistique v1.2</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    isActive ? "bg-[#0F4C75] text-white" : "text-gray-700 hover:bg-gray-100",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <Badge
                          variant={item.badge === "NEW" ? "default" : "destructive"}
                          className={cn(
                            "text-xs",
                            item.badge === "NEW"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-[#FF5722] hover:bg-[#FF5722]/90",
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer avec notification */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">Documents à renouveler</p>
              <p className="text-xs text-blue-700">3 documents expirent bientôt</p>
            </div>
          </div>
        </div>
      )}

      {/* Version info */}
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          {collapsed ? (
            "v1.2"
          ) : (
            <>
              LOGI-ONE v1.2
              <br />© 2025 - Tous droits réservés
            </>
          )}
        </div>
      </div>
    </div>
  )
}
