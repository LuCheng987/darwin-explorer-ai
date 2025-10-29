import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, DollarSign } from "lucide-react";

export default function AirlineCard({ airline }) {
  return (
    <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
      <a href={airline.url} target="_blank" rel="noopener noreferrer" className="block">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 bg-gradient-to-br ${airline.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                {airline.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {airline.name}
                  {airline.recommended && (
                    <Badge className="bg-orange-500">
                      <Star className="w-3 h-3 mr-1" />
                      推荐
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-gray-600">{airline.description}</p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
          </div>

          {airline.priceRange && (
            <div className="bg-green-50 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">参考价格:</span>
                <span className="font-bold text-green-700">{airline.priceRange}</span>
              </div>
            </div>
          )}

          {airline.features && (
            <div className="flex flex-wrap gap-2">
              {airline.features.map((feature, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </a>
    </Card>
  );
}