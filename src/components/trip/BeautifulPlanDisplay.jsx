import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Utensils, Clock, DollarSign, ImageOff } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function BeautifulPlanDisplay({ plan, attractions = [], restaurants = [] }) {
  const [imageErrors, setImageErrors] = React.useState({});

  const handleImageError = (id) => {
    setImageErrors(prev => ({...prev, [id]: true}));
  };

  // Improved attraction matching
  const extractMentionedAttractions = () => {
    if (!plan) return [];
    const planText = plan.toLowerCase();
    
    return attractions.filter(attraction => {
      const attractionName = attraction.name.toLowerCase();
      if (planText.includes(attractionName)) return true;
      
      const words = attractionName.split(/[\s\-\/]/);
      return words.some(word => {
        const cleanWord = word.trim();
        return cleanWord.length > 2 && planText.includes(cleanWord);
      });
    });
  };

  // Improved restaurant matching
  const extractMentionedRestaurants = () => {
    if (!plan) return [];
    const planText = plan.toLowerCase();
    
    return restaurants.filter(restaurant => {
      const restaurantName = restaurant.name.toLowerCase();
      if (planText.includes(restaurantName)) return true;
      
      const words = restaurantName.split(/[\s\-\/&,().]+/).filter(w => w.trim());
      for (const word of words) {
        const cleanWord = word.trim();
        if (cleanWord.length >= 3) {
          const regex = new RegExp(`\\b${cleanWord}\\b`, 'i');
          if (regex.test(planText)) return true;
          if (planText.includes(cleanWord)) return true;
        }
      }
      
      const planWords = planText.split(/[\s\-\/&,().!?;:]+/).filter(w => w.trim() && w.length >= 3);
      for (const planWord of planWords) {
        if (restaurantName.includes(planWord)) return true;
      }
      
      return false;
    });
  };

  const mentionedAttractions = extractMentionedAttractions();
  const mentionedRestaurants = extractMentionedRestaurants();

  return (
    <div className="space-y-8">
      {/* AI Itinerary Content */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown>{plan}</ReactMarkdown>
      </div>

      {/* Attractions Section */}
      {mentionedAttractions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Attractions Included</h3>
              <p className="text-sm text-gray-600">Total {mentionedAttractions.length} attractions</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mentionedAttractions.map((attraction, i) => (
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

      {/* Restaurants Section */}
      {mentionedRestaurants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recommended Restaurants</h3>
              <p className="text-sm text-gray-600">Total {mentionedRestaurants.length} restaurants</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mentionedRestaurants.map((restaurant, i) => (
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
    </div>
  );
}