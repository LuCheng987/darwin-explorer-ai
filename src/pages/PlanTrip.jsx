
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Calendar, DollarSign, Users, Heart, Plane } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar"; // Renamed to avoid conflict with lucide-react Calendar
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import BeautifulPlanDisplay from "../components/trip/BeautifulPlanDisplay";

export default function PlanTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    planName: "",
    budget: "",
    durationDays: "",
    travelDates: "",
    departureCity: "",
    preferences: "",
    isRainySeason: false
  });
  const [aiPlan, setAiPlan] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // New state for calendar component

  useEffect(() => {
    loadAttractionsAndRestaurants();
  }, []);

  const loadAttractionsAndRestaurants = async () => {
    try {
      const [attractionsData, restaurantsData] = await Promise.all([
        base44.entities.Attraction.list(),
        base44.entities.Restaurant.list()
      ]);
      setAttractions(attractionsData);
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "travelDates" && value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const month = date.getMonth();
        // Darwin's rainy season is typically November to April (months 10, 11, 0, 1, 2, 3)
        const isRainy = month >= 10 || month <= 3; 
        setFormData(prev => ({ ...prev, isRainySeason: isRainy }));
      } else {
        setFormData(prev => ({ ...prev, isRainySeason: false }));
      }
    }
  };

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      const formattedDate = format(date, 'yyyy-MM-dd');
      handleInputChange('travelDates', formattedDate);
    } else {
      setSelectedDate(null);
      handleInputChange('travelDates', '');
    }
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      // Build context information for attractions and restaurants
      const attractionsContext = attractions
        .map(a => `- ${a.name}: ${a.description || 'No description'} (Category: ${a.category || 'Unknown'}, Price: ${a.price_range || 'Unknown'}, ${a.suitable_for_rainy_season ? '✓Suitable for rainy season' : ''}${a.indoor ? ', ✓Indoor' : ''}, Location: ${a.location || 'Darwin'})`)
        .join('\n');

      const restaurantsContext = restaurants
        .map(r => `- ${r.name}: ${r.description || 'No description'} (${r.cuisine_type || 'Unknown cuisine'}, Price: ${r.price_range || '$$'}, Location: ${r.location || 'Darwin'}, Specialties: ${r.specialties || 'None'})`)
        .join('\n');

      // Check if user preferences mention specific attractions
      const mentionedAttractions = attractions.filter(a => 
        formData.preferences && a.name && formData.preferences.toLowerCase().includes(a.name.toLowerCase())
      );

      // Build customer special requirements section
      const mentionedAttractionsSection = mentionedAttractions.length > 0 ? `
**🔴🔴🔴 CUSTOMER SPECIFIC REQUIREMENTS (MANDATORY - MUST INCLUDE!) 🔴🔴🔴**
The customer explicitly mentioned wanting to visit the following attractions. You MUST include these attractions in the itinerary:
${mentionedAttractions.map(a => `- ${a.name}${a.category ? ` (Category: ${a.category})` : ''}${a.description ? `, Description: ${a.description}` : ''}`).join('\n')}

Please ensure ALL of the above attractions are included in the itinerary! This is the customer's core requirement!
` : '';

      const prompt = `You are a Darwin travel planning expert. Create a ${formData.durationDays}-day travel plan based on customer requirements.

**CRITICAL: OUTPUT MUST BE 100% IN ENGLISH. DO NOT USE ANY CHINESE CHARACTERS.**

**Customer Requirements:**
• Total Budget: AUD $${formData.budget} (including flights, accommodation, meals, tickets, transportation, etc.)
• Departure City: ${formData.departureCity}
• Duration: ${formData.durationDays} days
• Date: ${formData.travelDates}
• Season: ${formData.isRainySeason ? 'Wet Season (Nov-Apr)' : 'Dry Season (May-Oct)'}
• Preferences: ${formData.preferences || 'Comprehensive experience'}

**Available Attractions Database:**
${attractionsContext}

**Available Restaurants Database:**
${restaurantsContext}
${mentionedAttractionsSection}

**Important Rules:**
1. **ALL OUTPUT MUST BE IN ENGLISH ONLY - NO CHINESE CHARACTERS**
2. Each day must feature different attractions and restaurants - no repetition.
3. Must select real attraction and restaurant names from the database.
4. If customer mentioned specific attractions (as listed in special requirements above), MUST include them in the itinerary.
5. Each day's itinerary should vary, with different activities in morning and afternoon.
6. During wet season (${formData.isRainySeason ? 'YES' : 'NO'}), prioritize indoor activities or attractions with rainy season alternatives.
7. **Budget MUST include round-trip airfare from ${formData.departureCity} to Darwin.**
8. **Write everything in English - weather descriptions, flight information, attractions, restaurants, all text.**

Please output in the following format (ALL IN ENGLISH):

━━━━━━━━━━━━━━━━━━━━━━
DAY 1 - Day One
━━━━━━━━━━━━━━━━━━━━━━

Theme: [Today's Theme in English]

【07:00 - 08:30】Breakfast Time
Recommended Restaurant: [Select one from restaurant database]
Specialty Recommendations: [Dishes in English]
Per Person Cost: AUD $XX-XX

【09:00 - 12:00】Morning Activity
Attraction Name: [Must be actual attraction name]
Activity Details: [Specific description in English]
Ticket Price: AUD $XX
Duration: X hours

【12:30 - 14:00】Lunch Time
Recommended Restaurant: [Select another from restaurant database, no repetition with breakfast]
Per Person Cost: AUD $XX-XX

【14:30 - 18:00】Afternoon Activity
Attraction Name: [Select another attraction from database, no repetition with morning]
Activity Details: [Specific description in English]
Ticket Price: AUD $XX

【18:30 - 20:30】Dinner Time
Recommended Restaurant: [Select third restaurant from database]
Per Person Cost: AUD $XX-XX

Today's Budget: AUD $XXX

━━━━━━━━━━━━━━━━━━━━━━
DAY 2 - Day Two
━━━━━━━━━━━━━━━━━━━━━━

Theme: [Today's theme in English, different from day 1]

【07:00 - 08:30】Breakfast Time
Recommended Restaurant: [New restaurant, no repetition with DAY 1]
Per Person Cost: AUD $XX-XX

【09:00 - 12:00】Morning Activity
Attraction Name: [New attraction, no repetition with DAY 1]
Activity Details: [Specific description in English]
Ticket Price: AUD $XX

【12:30 - 14:00】Lunch Time
Recommended Restaurant: [New restaurant]
Per Person Cost: AUD $XX-XX

【14:30 - 18:00】Afternoon Activity
Attraction Name: [New attraction, no previous repetition]
Activity Details: [Specific description in English]
Ticket Price: AUD $XX

【18:30 - 20:30】Dinner Time
Recommended Restaurant: [New restaurant]
Per Person Cost: AUD $XX-XX

Today's Budget: AUD $XXX

${Array.from({length: Math.max(0, parseInt(formData.durationDays) - 2)}, (_, i) => `
━━━━━━━━━━━━━━━━━━━━━━
DAY ${i + 3} - Day ${['Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][i]}
━━━━━━━━━━━━━━━━━━━━━━

Theme: [Today's theme in English, different from previous days]

【07:00 - 08:30】Breakfast Time
Recommended Restaurant: [New restaurant]
Per Person Cost: AUD $XX-XX

【09:00 - 12:00】Morning Activity
Attraction Name: [New attraction, no previous repetition]
Activity Details: [Specific description in English]
Ticket Price: AUD $XX

【12:30 - 14:00】Lunch Time
Recommended Restaurant: [New restaurant]
Per Person Cost: AUD $XX-XX

【14:30 - 18:00】Afternoon Activity
Attraction Name: [New attraction, no previous repetition]
Activity Details: [Specific description in English]
Ticket Price: AUD $XX

【18:30 - 20:30】Dinner Time
Recommended Restaurant: [New restaurant]
Per Person Cost: AUD $XX-XX

Today's Budget: AUD $XXX
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━
Accommodation Recommendations
━━━━━━━━━━━━━━━━━━━━━━

Premium Choice: [Hotel Name] - AUD $XXX/night
Mid-range Choice: [Hotel Name] - AUD $XXX/night
Budget Choice: [Hotel Name] - AUD $XXX/night

━━━━━━━━━━━━━━━━━━━━━━
Budget Breakdown
━━━━━━━━━━━━━━━━━━━━━━

✈️ Round-trip Flights (${formData.departureCity} ↔ Darwin): AUD $XXX
🏨 Accommodation (${parseInt(formData.durationDays) > 0 ? parseInt(formData.durationDays) - 1 : 0} nights): AUD $XXX
🍽️ Meals (${formData.durationDays} days): AUD $XXX
🎫 Attraction Tickets: AUD $XXX
🚗 Transportation (local transport/car rental): AUD $XXX
🎯 Activity Fees (special experiences): AUD $XXX
🛍️ Shopping Budget (souvenirs): AUD $XXX
💼 Other Expenses (tips, misc): AUD $XXX
🔒 Emergency Reserve (10-15%): AUD $XXX
━━━━━━━━━━━━━━━━━━━━━━
💰 Total Budget: AUD $${formData.budget}

**Flight Price Note:**
Based on historical price data from ${formData.departureCity} to Darwin, estimated round-trip airfare. Actual prices please refer to airline official websites.

**IMPORTANT REMINDER: All text above MUST be in English. Do not include any Chinese characters in the output.**

Please ensure:
1. Different attractions each day.
2. Different restaurants each day.
3. If customer mentioned specific attractions, MUST include them in the schedule.
4. If wet season, MUST provide rainy day alternatives.
5. Flight costs MUST be included in budget breakdown.
6. **EVERYTHING IN ENGLISH - no Chinese text anywhere.**`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setAiPlan(response);
      
      await base44.entities.TravelPlan.create({
        plan_name: formData.planName || `${formData.departureCity} to Darwin ${formData.durationDays}-Day Trip`,
        budget: parseFloat(formData.budget),
        duration_days: parseInt(formData.durationDays),
        travel_dates: formData.travelDates,
        preferences: `Departure: ${formData.departureCity}; ${formData.preferences}`,
        is_rainy_season: formData.isRainySeason,
        ai_recommendations: response,
        status: "Planning"
      });

      setStep(3);
    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Error generating plan, please try again");
    }
    setIsGenerating(false);
  };

  const questions = [
    {
      id: "planName",
      label: "Name Your Trip",
      icon: Heart,
      placeholder: "e.g., My Darwin Adventure",
      type: "text"
    },
    {
      id: "budget",
      label: "What's Your Total Budget? (AUD, including flights)",
      icon: DollarSign,
      placeholder: "e.g., 5000",
      type: "text",
      inputMode: "numeric"
    },
    {
      id: "durationDays",
      label: "How Many Days?",
      icon: Calendar,
      placeholder: "e.g., 5",
      type: "text",
      inputMode: "numeric"
    },
    {
      id: "departureCity",
      label: "Departure City?",
      icon: Plane,
      placeholder: "e.g., Beijing, Shanghai, Sydney, Melbourne",
      type: "text"
    },
    {
      id: "travelDates",
      label: "Departure Date",
      icon: Calendar,
      placeholder: "",
      type: "calendar" // Changed type to calendar
    },
    {
      id: "preferences",
      label: "Your Travel Preferences",
      icon: Heart,
      placeholder: "e.g., Love nature, interested in Aboriginal culture, enjoy seafood...",
      type: "textarea"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent">
            AI Smart Travel Planning
          </h1>
          <p className="text-gray-600 text-lg">Let AI customize your perfect Darwin journey</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-teal-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Let's Get Started!</CardTitle>
                  <p className="text-gray-600 mt-2">Answer a few simple questions, AI will generate your exclusive itinerary</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions.map((q, index) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                        <q.icon className="w-5 h-5 text-orange-600" />
                        {q.label}
                      </Label>
                      {q.type === "textarea" ? (
                        <Textarea
                          placeholder={q.placeholder}
                          value={formData[q.id]}
                          onChange={(e) => handleInputChange(q.id, e.target.value)}
                          className="min-h-24 text-base"
                        />
                      ) : q.type === "calendar" ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal text-base h-11"
                            >
                              <Calendar className="mr-2 h-5 w-5" />
                              {formData.travelDates ? format(new Date(formData.travelDates), 'PPP') : 'Select date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleDateSelect}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Input
                          type={q.type}
                          inputMode={q.inputMode}
                          placeholder={q.placeholder}
                          value={formData[q.id]}
                          onChange={(e) => handleInputChange(q.id, e.target.value)}
                          className="text-base"
                        />
                      )}
                    </motion.div>
                  ))}

                  {formData.isRainySeason && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
                    >
                      <Badge className="bg-blue-500 mb-2">Wet Season Alert</Badge>
                      <p className="text-sm text-blue-900">
                        Your selected dates fall during the wet season (Nov-Apr). AI will recommend suitable indoor activities and attractions.
                      </p>
                    </motion.div>
                  )}

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.budget || !formData.durationDays || !formData.travelDates || !formData.departureCity}
                    size="lg"
                    className="w-full bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600 text-lg py-6 rounded-xl"
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Confirm Your Travel Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-teal-50 rounded-xl p-6 space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Trip Name</p>
                      <p className="text-lg font-semibold">{formData.planName || "Darwin Journey"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Budget (incl. flights)</p>
                        <p className="text-lg font-semibold">${formData.budget}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-lg font-semibold">{formData.durationDays} days</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Departure City</p>
                      <p className="text-lg font-semibold">{formData.departureCity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Departure Date</p>
                      <p className="text-lg font-semibold">{formData.travelDates ? format(new Date(formData.travelDates), 'PPP') : 'N/A'}</p>
                    </div>
                    {formData.preferences && (
                      <div>
                        <p className="text-sm text-gray-600">Travel Preferences</p>
                        <p className="text-base">{formData.preferences}</p>
                      </div>
                    )}
                    {formData.isRainySeason && (
                      <Badge className="bg-blue-500">Wet Season Itinerary</Badge>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      disabled={isGenerating}
                    >
                      Back to Edit
                    </Button>
                    <Button
                      onClick={generatePlan}
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          AI Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Itinerary
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && aiPlan && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm mb-6">
                <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-teal-500 text-white rounded-t-xl">
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    Your Exclusive Darwin Itinerary
                  </CardTitle>
                  <p className="mt-2">AI has generated a complete travel plan for you</p>
                </CardHeader>
                <CardContent className="p-8">
                  <BeautifulPlanDisplay 
                    plan={aiPlan}
                    attractions={attractions}
                    restaurants={restaurants}
                  />

                  <div className="flex gap-3 mt-8 pt-8 border-t">
                    <Button
                      onClick={() => {
                        setStep(1);
                        setAiPlan(null);
                        setFormData({
                          planName: "",
                          budget: "",
                          durationDays: "",
                          travelDates: "",
                          departureCity: "",
                          preferences: "",
                          isRainySeason: false
                        });
                        setSelectedDate(null); // Reset selectedDate as well
                      }}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      Plan New Trip
                    </Button>
                    <Button
                      onClick={() => navigate(createPageUrl("MyTrips"))}
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-teal-500"
                    >
                      View My Trips
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
