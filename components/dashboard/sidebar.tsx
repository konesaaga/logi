"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Package2,
  Home,
  Package,
  ShoppingCart,
  Ship,
  Truck,
  TrendingUp,
  Warehouse,
  Users,
  BarChart3,
  Bell,
  Settings,
  Menu,
  X,
} from "lucide-react"

const navigation = [
  { name: "Accueil", href: "/dashboard", icon: Home },
  { name: "Marchandises", href: "/dashboard/marchandises", icon: Package },
  { name: "Commandes", href: "/dashboard/commandes", icon: ShoppingCart },
  { name: "Port / Déchargement", href: "/dashboard/port", icon: Ship },
  { name: "Transport", href: "/dashboard/transport", icon: Truck },
  { name: "Ventes", href: "/dashboard/ventes", icon: TrendingUp },
  { name: "Entrepôts", href: "/dashboard/entrepots", icon: Warehouse },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Utilisateurs", href: "/dashboard/utilisateurs", icon: Users },
  { name: "Rapports", href: "/dashboard/rapports", icon: BarChart3 },
  { name: "Alertes", href: "/dashboard/alertes", icon: Bell, badge: 3 },
  { name: "Paramètres", href: "/dashboard/parametres", icon: Settings },
]

export function DashboardSidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="bg-white">
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
            <div className="bg-[#0F4C75] p-2 rounded-lg">
              <Package2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F4C75]">LOGI-ONE</h1>
              <p className="text-xs text-gray-500">Gestion Logistique</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-[#0F4C75] text-white" : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="bg-[#FF5722] hover:bg-[#FF5722]/90">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              LOGI-ONE v1.0
              <br />© 2025 - Tous droits réservés
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
