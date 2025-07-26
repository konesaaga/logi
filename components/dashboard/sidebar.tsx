"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Building,
  Truck,
  FileText,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Anchor,
  UserCheck,
} from "lucide-react"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    current: false,
  },
  {
    name: "Marchandises",
    href: "/dashboard/marchandises",
    icon: Package,
    current: false,
  },
  {
    name: "Clients",
    href: "/dashboard/clients",
    icon: Users,
    current: false,
  },
  {
    name: "Commandes",
    href: "/dashboard/commandes",
    icon: ShoppingCart,
    current: false,
  },
  {
    name: "Ventes",
    href: "/dashboard/ventes",
    icon: TrendingUp,
    current: false,
  },
  {
    name: "Entrepôts",
    href: "/dashboard/entrepots",
    icon: Building,
    current: false,
  },
  {
    name: "Port/Déchargement",
    href: "/dashboard/port",
    icon: Anchor,
    current: false,
  },
  {
    name: "Transport",
    href: "/dashboard/transport",
    icon: Truck,
    current: false,
    badge: "NEW",
    badgeColor: "bg-blue-500",
  },
  {
    name: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
    current: false,
    badge: "NEW",
    badgeColor: "bg-green-500",
  },
  {
    name: "Alertes",
    href: "/dashboard/alertes",
    icon: Bell,
    current: false,
    notification: 3,
  },
  {
    name: "Rapports",
    href: "/dashboard/rapports",
    icon: BarChart3,
    current: false,
  },
  {
    name: "Utilisateurs",
    href: "/dashboard/utilisateurs",
    icon: UserCheck,
    current: false,
  },
  {
    name: "Paramètres",
    href: "/dashboard/parametres",
    icon: Settings,
    current: false,
  },
]

export function DashboardSidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-16" : "w-72",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0F4C75] rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LOGI-ONE</h1>
              <p className="text-xs text-gray-500">v1.2</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors relative group",
                isActive ? "bg-[#0F4C75] text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <item.icon className={cn("flex-shrink-0 h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge className={cn("text-xs text-white ml-2", item.badgeColor || "bg-blue-500")}>
                      {item.badge}
                    </Badge>
                  )}
                  {item.notification && (
                    <Badge className="bg-red-500 text-white text-xs ml-2">{item.notification}</Badge>
                  )}
                </>
              )}

              {/* Tooltip pour mode collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.name}
                  {item.badge && <span className="ml-1 px-1 bg-blue-500 rounded text-xs">{item.badge}</span>}
                  {item.notification && (
                    <span className="ml-1 px-1 bg-red-500 rounded text-xs">{item.notification}</span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © 2025 LOGI-ONE
            <br />
            Système de Gestion Logistique
          </div>
        </div>
      )}
    </div>
  )
}
