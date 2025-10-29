
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Cloud, Trash2, Eye, Sparkles, Save, MapPin, Utensils, Clock, ImageOff } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from 'react-markdown';

// Darwin featured image collection
const darwinImages = [
  "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800", // Kakadu Waterfall
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800", // Sunset Beach
  "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800", // Crocodile
  "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=800", // Tropical Scenery
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", // Mountain Nature
];

// Component for rendering AI recommendations with markdown
const PlanContent = ({ content }) => {
  if (!content) return null;

  return (
    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
      <ReactMarkdown>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default function MyTrips() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const [userPlans, attractionsData, restaurantsData] = await Promise.all([
        base44.entities.TravelPlan.filter({ created_by: currentUser.email }, "-created_date"),
        base44.entities.Attraction.list(),
        base44.entities.Restaurant.list()
      ]);
      setPlans(userPlans);
      setAttractions(attractionsData);
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error("Error loading plans:", error);
    }
    setIsLoading(false);
  };

  const deletePlan = async (planId) => {
    if (confirm("Are you sure you want to delete this itinerary?")) {
      await base44.entities.TravelPlan.delete(planId);
      loadData();
    }
  };

  const statusColors = {
    "Planning": "bg-yellow-100 text-yellow-800",
    "Confirmed": "bg-blue-100 text-blue-800",
    "Ongoing": "bg-green-100 text-green-800",
    "Completed": "bg-gray-100 text-gray-800",
  };

  // Function to download plan
  const downloadPlan = (plan) => {
    const element = document.createElement('a');
    const content = `${plan.plan_name}\n\n${plan.ai_recommendations}`;
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${plan.plan_name}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Get random Darwin image for each plan
  const getPlanImage = (planId) => {
    const index = Math.abs(planId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % darwinImages.length;
    return darwinImages[index];
  };

  // Improved attraction matching algorithm - smarter matching
  const extractMentionedAttractions = (plan) => {
    if (!plan || !plan.ai_recommendations) return [];
    const planText = plan.ai_recommendations.toLowerCase();
    
    return attractions.filter(attraction => {
      const attractionName = attraction.name.toLowerCase();
      
      // 1. Exact match (full name)
      if (planText.includes(attractionName)) return true;
      
      // 2. Tokenized match (match main keywords, length > 2)
      const words = attractionName.split(/[\s\-\/]/);
      const hasKeywordMatch = words.some(word => {
        const cleanWord = word.trim();
        return cleanWord.length > 2 && planText.includes(cleanWord);
      });
      
      return hasKeywordMatch;
    });
  };

  // Improved restaurant matching algorithm - very loose matching, supports various cases
  const extractMentionedRestaurants = (plan) => {
    if (!plan || !plan.ai_recommendations) return [];
    const planText = plan.ai_recommendations.toLowerCase();
    
    return restaurants.filter(restaurant => {
      const restaurantName = restaurant.name.toLowerCase();
      
      // 1. Exact match (full name)
      if (planText.includes(restaurantName)) return true;
      
      // 2. Tokenized match - lower length requirement, supports words like "the", "pub", "game"
      const words = restaurantName.split(/[\s\-\/&,().]+/).filter(w => w.trim());
      for (const word of words) {
        const cleanWord = word.trim();
        // Only try to match if word length >= 3
        if (cleanWord.length >= 3) {
          // Check if the word is contained within the planText, using regex for word boundary
          const regex = new RegExp(`\\b${cleanWord}\\b`, 'i');
          if (regex.test(planText)) {
            return true;
          }
          // If no full word match, try partial inclusion
          if (planText.includes(cleanWord)) {
            return true;
          }
        }
      }
      
      // 3. Reverse match - check if words from the itinerary are in the restaurant name
      // Split words in planText and filter out short words
      const planWords = planText.split(/[\s\-\/&,().!?;:]+/).filter(w => w.trim() && w.length >= 3);
      for (const planWord of planWords) {
        if (restaurantName.includes(planWord)) {
          return true;
        }
      }
      
      return false;
    });
  };

  const handleImageError = (id) => {
    setImageErrors(prev => ({...prev, [id]: true}));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent">
              My Trips
            </h1>
            <p className="text-gray-600 text-lg">Manage all your Darwin travel plans</p>
          </div>
          <Link to={createPageUrl("PlanTrip")}>
            <Button className="bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600">
              Plan New Trip
            </Button>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : plans.length === 0 ? (
          <Card className="border-none shadow-lg text-center py-16">
            <CardContent>
              <p className="text-gray-500 text-lg mb-4">You haven't created any trips yet</p>
              <Link to={createPageUrl("PlanTrip")}>
                <Button className="bg-gradient-to-r from-orange-500 to-teal-500">
                  Start Planning
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                  {/* Darwin destination image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getPlanImage(plan.id)}
                      alt="Darwin"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <Badge className={statusColors[plan.status]}>
                        {plan.status}
                      </Badge>
                      {plan.is_rainy_season && (
                        <Badge className="bg-blue-500">
                          <Cloud className="w-3 h-3 mr-1" />
                          Wet Season
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">Darwin, Australia</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">{plan.plan_name}</h3>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-semibold">{plan.duration_days} days</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-xs text-gray-500">Budget</p>
                          <p className="font-semibold">${plan.budget}</p>
                        </div>
                      </div>
                    </div>

                    {plan.travel_dates && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Departure Date</p>
                        <p className="font-semibold">{plan.travel_dates}</p>
                      </div>
                    )}

                    {plan.preferences && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Travel Preferences</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{plan.preferences}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => setSelectedPlan(plan)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        onClick={() => deletePlan(plan.id)}
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-orange-600" />
                {selectedPlan?.plan_name}
              </DialogTitle>
            </DialogHeader>
            {selectedPlan && (
              <div className="space-y-6">
                {/* Destination Image */}
                <div className="relative h-64 rounded-xl overflow-hidden">
                  <img
                    src={getPlanImage(selectedPlan.id)}
                    alt="Darwin"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6">
                    <div className="flex items-center gap-2 text-white mb-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium">Darwin, Australia Northern Territory</span>
                    </div>
                    <p className="text-white/80 text-sm">Tropical Paradise · Natural Wonders · Aboriginal Culture</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                    <p className="text-2xl font-bold text-orange-600">${selectedPlan.budget}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Trip Duration</p>
                    <p className="text-2xl font-bold text-teal-600">{selectedPlan.duration_days} days</p>
                  </div>
                </div>

                {selectedPlan.travel_dates && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <p className="font-semibold text-blue-900">Departure Date</p>
                    </div>
                    <p className="text-gray-700">{selectedPlan.travel_dates}</p>
                  </div>
                )}

                {selectedPlan.is_rainy_season && (
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className="w-5 h-5" />
                      <p className="font-semibold">Wet Season Itinerary</p>
                    </div>
                    <p className="text-white/90 text-sm">
                      This itinerary is optimized for the wet season, including indoor activities and rainy day alternatives
                    </p>
                  </div>
                )}

                {selectedPlan.preferences && (
                  <div className="bg-gradient-to-r from-orange-50 to-teal-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Travel Preferences</p>
                    <p className="text-gray-600">{selectedPlan.preferences}</p>
                  </div>
                )}

                {selectedPlan.ai_recommendations && (
                  <div className="bg-white border-2 border-orange-100 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                      <h3 className="font-semibold text-lg">AI Recommended Itinerary</h3>
                      <Badge className="ml-auto bg-green-500">
                        ✓ Includes prices & sources
                      </Badge>
                    </div>
                    <PlanContent content={selectedPlan.ai_recommendations} />
                  </div>
                )}

                {/* Attractions included in itinerary */}
                {extractMentionedAttractions(selectedPlan).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Attractions Included</h3>
                        <p className="text-sm text-gray-600">Total {extractMentionedAttractions(selectedPlan).length} attractions</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {extractMentionedAttractions(selectedPlan).map((attraction, i) => (
                        <Card key={i} className="overflow-hidden hover:shadow-lg transition-all border-none">
                          {attraction.image_url && !imageErrors[attraction.id] ? (
                            <div className="relative h-32 overflow-hidden">
                              <img
                                src={attraction.image_url}
                                alt={attraction.name}
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(attraction.id)}
                              />
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-orange-500 text-xs">
                                  {attraction.category}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <div className="relative h-32 bg-gradient-to-br from-orange-100 to-teal-100 flex items-center justify-center">
                              <ImageOff className="w-8 h-8 text-gray-400" />
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-orange-500 text-xs">
                                  {attraction.category}
                                </Badge>
                              </div>
                            </div>
                          )}
                          <CardContent className="p-3">
                            <h4 className="font-semibold text-sm mb-1 line-clamp-1">{attraction.name}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2">{attraction.description}</p>
                            {attraction.price_range && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                {attraction.price_range}
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Restaurants included in itinerary */}
                {extractMentionedRestaurants(selectedPlan).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Recommended Restaurants</h3>
                        <p className="text-sm text-gray-600">Total {extractMentionedRestaurants(selectedPlan).length} restaurants</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {extractMentionedRestaurants(selectedPlan).map((restaurant, i) => (
                        <Card key={i} className="overflow-hidden hover:shadow-lg transition-all border-none">
                          {restaurant.image_url && !imageErrors[restaurant.id] ? (
                            <div className="relative h-32 overflow-hidden">
                              <img
                                src={restaurant.image_url}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(restaurant.id)}
                              />
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-amber-500 text-xs">
                                  {restaurant.cuisine_type}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <div className="relative h-32 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                              <ImageOff className="w-8 h-8 text-gray-400" />
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-amber-500 text-xs">
                                  {restaurant.cuisine_type}
                                </Badge>
                              </div>
                            </div>
                          )}
                          <CardContent className="p-3">
                            <h4 className="font-semibold text-sm mb-1 line-clamp-1">{restaurant.name}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2">{restaurant.description}</p>
                            {restaurant.price_range && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                {restaurant.price_range}
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => setSelectedPlan(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => downloadPlan(selectedPlan)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-teal-500"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Export Itinerary
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
