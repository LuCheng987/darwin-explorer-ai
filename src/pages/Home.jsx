
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Compass, MapPin, Utensils, Ticket,
  Cloud, Sparkles, ArrowRight,
  Palmtree, Waves, Sun, MessageCircle // Added MessageCircle import
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      icon: MessageCircle,
      title: "AI Chat Assistant",
      description: "AI automatically collects information through natural conversation and generates complete travel plans",
      color: "from-purple-400 to-purple-600",
      link: createPageUrl("AIAssistant"),
      badge: "NEW"
    },
    {
      icon: Compass,
      title: "AI Smart Planning",
      description: "Customize your exclusive Darwin travel plan based on your budget and preferences",
      color: "from-orange-400 to-orange-600",
      link: createPageUrl("PlanTrip")
    },
    {
      icon: MapPin,
      title: "Featured Attractions",
      description: "Explore Kakadu National Park, Aboriginal culture and popular attractions",
      color: "from-teal-400 to-teal-600",
      link: createPageUrl("Attractions")
    },
    {
      icon: Utensils,
      title: "Restaurant Recommendations",
      description: "Taste fresh seafood and authentic Australian cuisine",
      color: "from-amber-400 to-amber-600",
      link: createPageUrl("Restaurants")
    },
    {
      icon: Ticket,
      title: "Flight Search",
      description: "Real-time price comparison to find the best flight deals",
      color: "from-blue-400 to-blue-600",
      link: createPageUrl("Flights")
    },
    {
      icon: Cloud,
      title: "Smart Wet Season Tips",
      description: "Automatically adjust itinerary based on weather for perfect experience",
      color: "from-indigo-400 to-indigo-600",
      link: createPageUrl("Weather")
    }
  ];

  const highlights = [
    {
      title: "Kakadu National Park",
      description: "World Heritage site with spectacular waterfalls and Aboriginal rock art",
      image: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800",
      badge: "Natural Wonder"
    },
    {
      title: "Mindil Beach Sunset Market",
      description: "Enjoy food, arts and stunning sunsets",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      badge: "Cultural Experience"
    },
    {
      title: "Crocodile Cruise",
      description: "Close encounters with saltwater crocodiles and wildlife",
      image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800",
      badge: "Wildlife"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-teal-400">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Palmtree className="w-12 h-12 text-white" />
              <Waves className="w-12 h-12 text-white" />
              <Sun className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Explore Tropical Paradise
              <br />
              <span className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-2xl inline-block mt-4">
                Darwin Adventure
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto font-light">
              AI-powered smart travel assistant to customize your perfect Darwin experience
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to={createPageUrl("PlanTrip")}>
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-8 py-6 rounded-2xl shadow-2xl">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Planning Trip
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("Attractions")}>
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 text-lg px-8 py-6 rounded-2xl">
                  Browse Attractions
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-orange-50 to-transparent"></div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            One-Stop Travel Services
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            From planning to booking, everything at your fingertips
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link to={feature.link}>
                  <Card className="hover:shadow-2xl transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:-translate-y-1 cursor-pointer group relative overflow-hidden">
                    {feature.badge && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-gradient-to-r from-orange-500 to-teal-500 text-white font-bold">
                          {feature.badge}
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Highlights Section */}
      <div className="bg-gradient-to-br from-teal-50 to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Must-See Experiences
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Darwin's most popular attractions and activities
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 * index }}
                className="group"
              >
                <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={highlight.image}
                      alt={highlight.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
                        {highlight.badge}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{highlight.title}</h3>
                    <p className="text-gray-600">{highlight.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Wet Season Banner */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <Card className="border-none bg-gradient-to-r from-blue-500 to-indigo-600 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48cGF0aCBkPSJNMCA0MGwxMC0xMCAxMCAxMCAxMC0xMCAxMCAxMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiIGZpbGw9Im5vbmUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-20"></div>

          <CardContent className="relative p-12 text-center">
            <Cloud className="w-16 h-16 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4">Wet Season Travel Tips</h3>
            <p className="text-xl mb-6 text-white/90 max-w-2xl mx-auto">
              November to April is Darwin's wet season. Our AI will automatically recommend indoor activities and best visit times based on weather
            </p>
            <Link to={createPageUrl("Weather")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl">
                Check Weather Forecast
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
