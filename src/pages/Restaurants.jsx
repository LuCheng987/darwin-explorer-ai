import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, DollarSign, ImageOff } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    setIsLoading(true);
    const data = await base44.entities.Restaurant.list("-created_date");
    setRestaurants(data);
    setIsLoading(false);
  };

  const handleImageError = (restaurantId) => {
    setImageErrors(prev => ({...prev, [restaurantId]: true}));
  };

  const filteredRestaurants = restaurants.filter(rest => {
    if (filter === "all") return true;
    return rest.cuisine_type === filter;
  });

  const cuisineColors = {
    "Australian Local": "bg-amber-100 text-amber-800",
    "Seafood": "bg-blue-100 text-blue-800",
    "Asian Cuisine": "bg-red-100 text-red-800",
    "Aboriginal Food": "bg-orange-100 text-orange-800",
    "International": "bg-purple-100 text-purple-800",
    "Fast Food": "bg-green-100 text-green-800",
    "Cafe": "bg-pink-100 text-pink-800"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent">
            Darwin Restaurant Guide
          </h1>
          <p className="text-gray-600 text-lg">Taste fresh seafood and authentic Australian flavors</p>
        </motion.div>

        <div className="mb-8">
          <Tabs defaultValue="all" onValueChange={setFilter} className="w-full">
            <TabsList className="bg-white/80 backdrop-blur-sm p-1 h-auto flex-wrap justify-start gap-2">
              <TabsTrigger value="all" className="rounded-lg">All Restaurants</TabsTrigger>
              <TabsTrigger value="Seafood" className="rounded-lg">Seafood</TabsTrigger>
              <TabsTrigger value="Australian Local" className="rounded-lg">Australian Local</TabsTrigger>
              <TabsTrigger value="Asian Cuisine" className="rounded-lg">Asian Cuisine</TabsTrigger>
              <TabsTrigger value="Aboriginal Food" className="rounded-lg">Aboriginal Food</TabsTrigger>
              <TabsTrigger value="Cafe" className="rounded-lg">Cafe</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="border-none shadow-lg">
                <Skeleton className="h-56 w-full rounded-t-xl" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                  {restaurant.image_url && !imageErrors[restaurant.id] ? (
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={restaurant.image_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => handleImageError(restaurant.id)}
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className={cuisineColors[restaurant.cuisine_type]}>
                          {restaurant.cuisine_type}
                        </Badge>
                        {restaurant.price_range && (
                          <Badge className="bg-white text-gray-900">
                            {restaurant.price_range}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-56 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                      <div className="text-center">
                        <ImageOff className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Image failed to load</p>
                      </div>
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className={cuisineColors[restaurant.cuisine_type]}>
                          {restaurant.cuisine_type}
                        </Badge>
                        {restaurant.price_range && (
                          <Badge className="bg-white text-gray-900">
                            {restaurant.price_range}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>
                    {restaurant.specialties && (
                      <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm font-semibold text-orange-800 mb-1">Signature Dishes</p>
                        <p className="text-sm text-gray-700">{restaurant.specialties}</p>
                      </div>
                    )}
                    <div className="space-y-2 text-sm">
                      {restaurant.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          {restaurant.location}
                        </div>
                      )}
                      {restaurant.opening_hours && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4 text-teal-500" />
                          {restaurant.opening_hours}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}