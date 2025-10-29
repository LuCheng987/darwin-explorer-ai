

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  Home, Compass, Map, MapPin, Utensils,
  Ticket, Cloud, Settings, Menu, X, MessageCircle,
  LogOut, User, Sun, Palmtree, Shield // Added Shield icon for admin role
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "AI Chat Assistant",
    url: createPageUrl("AIAssistant"),
    icon: MessageCircle,
    badge: "NEW"
  },
  {
    title: "Plan Trip",
    url: createPageUrl("PlanTrip"),
    icon: Compass,
  },
  {
    title: "My Trips",
    url: createPageUrl("MyTrips"),
    icon: Map,
  },
  {
    title: "Attractions",
    url: createPageUrl("Attractions"),
    icon: MapPin,
  },
  {
    title: "Restaurants",
    url: createPageUrl("Restaurants"),
    icon: Utensils,
  },
  {
    title: "Flight Search",
    url: createPageUrl("Flights"),
    icon: Ticket,
  },
  {
    title: "Weather",
    url: createPageUrl("Weather"),
    icon: Cloud,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Assuming 'base44' is a globally available object or imported elsewhere
      // If 'base44' is not defined, this will cause a runtime error.
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
      // Depending on requirements, you might want to clear user or handle specific error types here
      setUser(null);
    }
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --darwin-sunset: #FF6B35;
          --darwin-ocean: #00A8B5;
          --darwin-sand: #FFE5B4;
          --darwin-green: #2D5F3F;
          --darwin-sky: #87CEEB;
        }
      `}</style>

      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-50 via-blue-50 to-teal-50">
        <Sidebar className="border-r border-orange-100/50 backdrop-blur-sm bg-white/80">
          <SidebarHeader className="border-b border-orange-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/30 to-transparent"></div>
                <span className="text-2xl relative z-10">🐊</span>
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900">Darwin AI</h2>
                <p className="text-xs text-gray-600">Smart Travel Assistant</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url
                            ? 'bg-gradient-to-r from-orange-50 to-teal-50 text-orange-600 shadow-sm'
                            : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto bg-gradient-to-r from-orange-500 to-teal-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                  {user && user.role === 'admin' && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === createPageUrl("Admin")
                            ? 'bg-gradient-to-r from-orange-50 to-teal-50 text-orange-600 shadow-sm'
                            : ''
                        }`}
                      >
                        <Link to={createPageUrl("Admin")} className="flex items-center gap-3 px-4 py-3">
                          <Settings className="w-5 h-5" />
                          <span className="font-medium">Admin</span>
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            Admin
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Quick Info
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-3">
                  <div className="bg-gradient-to-r from-orange-100 to-teal-100 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-600 mb-1">Wet Season</p>
                    <p className="text-sm font-semibold text-gray-900">Nov - Apr</p>
                    <p className="text-xs text-gray-600 mt-1">Indoor activities recommended</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-600 mb-1">Current Weather</p>
                    <p className="text-sm font-semibold text-gray-900">30°C Partly Cloudy</p>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-orange-100 p-4">
            {user ? (
              <div className="space-y-3">
                <div className={`flex items-center gap-3 rounded-xl p-3 ${
                  user.role === 'admin'
                    ? 'bg-gradient-to-r from-red-50 to-orange-50'
                    : 'bg-gradient-to-r from-orange-50 to-teal-50'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    user.role === 'admin'
                      ? 'bg-gradient-to-br from-red-500 to-orange-500'
                      : 'bg-gradient-to-br from-orange-400 to-teal-400'
                  }`}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {user.full_name || user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                          <Shield className="w-3 h-3" />
                          Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                          <User className="w-3 h-3" />
                          User
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => base44.auth.logout()}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-600 text-center">Loading...</p>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-md border-b border-orange-100/50 px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="hover:bg-orange-50 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent">
                Darwin AI
              </h1>
              <div className="w-8" />
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

