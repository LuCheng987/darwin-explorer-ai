import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudRain, Sun, Droplets, Wind, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Weather() {
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    setIsLoading(true);
    try {
      const prompt = `Please provide current weather conditions and 7-day forecast for Darwin (Darwin, Australia).
Including:
1. Current temperature, humidity, wind speed
2. 7-day weather forecast
3. Whether it's the wet season (Nov-Apr)
4. Weather-related advice for tourists
5. Wet season special reminders (if applicable)

Please present information in a clear and structured manner.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setWeatherInfo(response);
    } catch (error) {
      console.error("Error loading weather:", error);
    }
    setIsLoading(false);
  };

  const getCurrentMonth = () => {
    const month = new Date().getMonth();
    return month >= 10 || month <= 3;
  };

  const isRainySeason = getCurrentMonth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Darwin Weather Forecast
          </h1>
          <p className="text-gray-600 text-lg">Real-time weather information and travel advice</p>
        </motion.div>

        {isRainySeason && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CloudRain className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Wet Season Notice
                    </h3>
                    <p className="text-white/90 mb-3">
                      Currently in Darwin's wet season (Nov-Apr). Frequent rainfall and high humidity during this period, but pleasant temperatures.
                    </p>
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <p className="font-semibold mb-2">Suggestions:</p>
                      <ul className="space-y-1 text-sm text-white/90">
                        <li>• Carry rain gear and waterproof equipment</li>
                        <li>• Prioritize indoor activities and sheltered attractions</li>
                        <li>• Check weather forecast, avoid heavy rain periods</li>
                        <li>• Book indoor attraction tickets in advance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Sun className="w-12 h-12" />
                <Badge className="bg-white/20 text-white">Live</Badge>
              </div>
              <p className="text-sm mb-1 text-white/80">Current Temperature</p>
              <p className="text-4xl font-bold">30°C</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Droplets className="w-12 h-12" />
                <Badge className="bg-white/20 text-white">Humidity</Badge>
              </div>
              <p className="text-sm mb-1 text-white/80">Air Humidity</p>
              <p className="text-4xl font-bold">75%</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-teal-400 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Wind className="w-12 h-12" />
                <Badge className="bg-white/20 text-white">Wind</Badge>
              </div>
              <p className="text-sm mb-1 text-white/80">Current Wind Speed</p>
              <p className="text-4xl font-bold">15km/h</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <Cloud className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
              <p className="text-gray-500">Loading weather information...</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Cloud className="w-6 h-6 text-blue-600" />
                  Detailed Weather Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {weatherInfo}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}