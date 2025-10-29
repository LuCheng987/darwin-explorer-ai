
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, DollarSign, Cloud, Home, ImageOff } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Attractions() {
  const [attractions, setAttractions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    loadAttractions();
  }, []);

  const loadAttractions = async () => {
    setIsLoading(true);
    const data = await base44.entities.Attraction.list("-created_date");
    setAttractions(data);
    setIsLoading(false);
  };

  const handleImageError = (attractionId) => {
    setImageErrors(prev => ({...prev, [attractionId]: true}));
  };

  const filteredAttractions = attractions.filter(attr => {
    if (filter === "all") return true;
    if (filter === "rainy") return attr.suitable_for_rainy_season;
    if (filter === "indoor") return attr.indoor;
    return attr.category === filter;
  });

  const categoryColors = {
    "Natural Scenery": "bg-green-100 text-green-800",
    "Cultural Experience": "bg-purple-100 text-purple-800",
    "Wildlife": "bg-orange-100 text-orange-800",
    "Water Activities": "bg-blue-100 text-blue-800",
    "Historical Sites": "bg-amber-100 text-amber-800",
    "Museums": "bg-indigo-100 text-indigo-800",
    "Aboriginal Culture": "bg-red-100 text-red-800"
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
            Darwin Top Attractions
          </h1>
          <p className="text-gray-600 text-lg">Explore nature and culture wonders of the tropical paradise</p>
        </motion.div>

        <div className="mb-8">
          <Tabs defaultValue="all" onValueChange={setFilter} className="w-full">
            <TabsList className="bg-white/80 backdrop-blur-sm p-1 h-auto flex-wrap justify-start gap-2">
              <TabsTrigger value="all" className="rounded-lg">All Attractions</TabsTrigger>
              <TabsTrigger value="rainy" className="rounded-lg flex items-center gap-1">
                <Cloud className="w-4 h-4" />
                Rainy Season
              </TabsTrigger>
              <TabsTrigger value="indoor" className="rounded-lg flex items-center gap-1">
                <Home className="w-4 h-4" />
                Indoor
              </TabsTrigger>
              <TabsTrigger value="Natural Scenery" className="rounded-lg">Natural Scenery</TabsTrigger>
              <TabsTrigger value="Cultural Experience" className="rounded-lg">Cultural Experience</TabsTrigger>
              <TabsTrigger value="Wildlife" className="rounded-lg">Wildlife</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="border-none shadow-lg">
                <Skeleton className="h-64 w-full rounded-t-xl" />
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
            {filteredAttractions.map((attraction, index) => (
              <motion.div
                key={attraction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                  {attraction.image_url && !imageErrors[attraction.id] ? (
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={attraction.image_url}
                        alt={attraction.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => handleImageError(attraction.id)}
                      />
                      <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                        <Badge className={categoryColors[attraction.category]}>
                          {attraction.category}
                        </Badge>
                        {attraction.suitable_for_rainy_season && (
                          <Badge className="bg-blue-500">
                            <Cloud className="w-3 h-3 mr-1" />
                            Rainy Season
                          </Badge>
                        )}
                        {attraction.indoor && (
                          <Badge className="bg-purple-500">
                            <Home className="w-3 h-3 mr-1" />
                            Indoor
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-64 bg-gradient-to-br from-orange-100 to-teal-100 flex items-center justify-center">
                      <div className="text-center">
                        <ImageOff className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Image failed to load</p>
                        {attraction.image_url && (
                          <p className="text-xs text-gray-400 mt-1 px-4 truncate max-w-xs">
                            {attraction.image_url}
                          </p>
                        )}
                      </div>
                      <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                        <Badge className={categoryColors[attraction.category]}>
                          {attraction.category}
                        </Badge>
                        {attraction.suitable_for_rainy_season && (
                          <Badge className="bg-blue-500">
                            <Cloud className="w-3 h-3 mr-1" />
                            Rainy Season
                          </Badge>
                        )}
                        {attraction.indoor && (
                          <Badge className="bg-purple-500">
                            <Home className="w-3 h-3 mr-1" />
                            Indoor
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {attraction.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {attraction.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      {attraction.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          {attraction.location}
                        </div>
                      )}
                      {attraction.recommended_duration && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4 text-teal-500" />
                          Suggested: {attraction.recommended_duration}
                        </div>
                      )}
                      {attraction.price_range && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          Price: {attraction.price_range}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filteredAttractions.length === 0 && (
          <Card className="border-none shadow-lg text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg">No attractions match the filter</p>
              <Button
                onClick={() => setFilter("all")}
                variant="outline"
                className="mt-4"
              >
                View All Attractions
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
