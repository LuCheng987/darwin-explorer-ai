import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Utensils, DollarSign, Clock, 
  Cloud, Home, ExternalLink, Info 
} from "lucide-react";
import { motion } from "framer-motion";

export default function PlanPreview({ plan }) {
  if (!plan) return null;

  const sections = plan.split('##').filter(s => s.trim());

  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        const lines = section.trim().split('\n');
        const title = lines[0].trim();
        const content = lines.slice(1).join('\n').trim();

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-none shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-teal-100">
                <CardTitle className="text-xl flex items-center gap-2">
                  {title.includes('航班') && <ExternalLink className="w-5 h-5 text-blue-600" />}
                  {title.includes('行程') && <MapPin className="w-5 h-5 text-orange-600" />}
                  {title.includes('餐厅') && <Utensils className="w-5 h-5 text-amber-600" />}
                  {title.includes('预算') && <DollarSign className="w-5 h-5 text-green-600" />}
                  {title.includes('雨季') && <Cloud className="w-5 h-5 text-blue-600" />}
                  {title.includes('贴士') && <Info className="w-5 h-5 text-purple-600" />}
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {content}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}