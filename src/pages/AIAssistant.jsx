
import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, Send, Loader2, Sparkles, 
  User, Bot, Save, RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStep, setConversationStep] = useState(0);
  const [travelData, setTravelData] = useState({
    budget: "",
    duration: "",
    travelDates: "",
    departureCity: "",
    interests: [],
    preferences: "",
    isRainySeason: false
  });
  const [finalPlan, setFinalPlan] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    addAIMessage(
      "Hello! I'm the Darwin Travel AI Assistant. I'll help you plan the perfect Darwin trip through a few questions.\n\nLet's get started! When are you planning to visit Darwin? (Please enter departure date, format: YYYY-MM-DD, e.g., 2024-03-15)"
    );
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addAIMessage = (content, delay = 0) => {
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, delay);
  };

  const addUserMessage = (content) => {
    setMessages(prev => [...prev, {
      role: "user",
      content,
      timestamp: new Date()
    }]);
  };

  const processUserResponse = async (userInput) => {
    if (!userInput.trim()) return;

    addUserMessage(userInput);
    setInputValue("");
    setIsTyping(true);

    switch (conversationStep) {
      case 0:
        const date = new Date(userInput);
        const month = date.getMonth();
        // Darwin's wet season is typically Nov to Apr (months 10, 11, 0, 1, 2, 3)
        // Note: JS month is 0-indexed, so 10=Nov, 11=Dec, 0=Jan, 1=Feb, 2=Mar, 3=Apr
        const isRainy = month >= 10 || month <= 3;
        
        setTravelData(prev => ({ 
          ...prev, 
          travelDates: userInput,
          isRainySeason: isRainy 
        }));
        
        if (isRainy) {
          addAIMessage(
            `Great! ${userInput} is during Darwin's wet season (Nov-Apr).\n\nDon't worry, the wet season has its own charm. I'll recommend activities suitable for the rainy season.\n\nNext, how many days are you planning to stay? (Enter number, e.g., 5)`,
            1000
          );
        } else {
          addAIMessage(
            `Excellent! ${userInput} is a great time to visit!\n\nNext, how many days are you planning to stay? (Enter number, e.g., 5)`,
            1000
          );
        }
        setConversationStep(1);
        break;

      case 1:
        setTravelData(prev => ({ ...prev, duration: userInput }));
        addAIMessage(
          `Got it, a ${userInput}-day trip.\n\nWhat's your approximate budget for the trip? (AUD, e.g., 5000)`,
          1000
        );
        setConversationStep(2);
        break;

      case 2:
        setTravelData(prev => ({ ...prev, budget: userInput }));
        addAIMessage(
          `Okay, a budget of $${userInput} AUD.\n\nWhich city are you departing from? (e.g., Beijing, Shanghai, Sydney, etc.)`,
          1000
        );
        setConversationStep(3);
        break;

      case 3:
        setTravelData(prev => ({ ...prev, departureCity: userInput }));
        addAIMessage(
          `Noted! Departing from ${userInput}.\n\nNow let me know your interests. Which of the following interest you?\n\nNatural Scenery\nAboriginal Culture\nWildlife\nCulinary Experiences\nBeach Activities\nHistorical Sites\n\nPlease separate with commas, e.g., Natural Scenery, Culinary Experiences, Wildlife`,
          1000
        );
        setConversationStep(4);
        break;

      case 4:
        const interests = userInput.split(/[,，、]/).map(i => i.trim()).filter(i => i);
        setTravelData(prev => ({ ...prev, interests }));
        addAIMessage(
          `Excellent! I noticed you're interested in ${interests.join(", ")}.\n\nFinally, do you have any special requests or preferences? (e.g., love photography, want to try diving, vegetarian, etc. If none, enter "none")`,
          1000
        );
        setConversationStep(5);
        break;

      case 5:
        setTravelData(prev => ({ ...prev, preferences: userInput }));
        setIsTyping(true);
        addAIMessage(
          `Perfect! I've collected all the information. Now let me generate a complete Darwin travel plan for you...\n\nThis may take 30-60 seconds, please wait...`,
          1000
        );
        
        setTimeout(() => {
          generateCompletePlan({
            ...travelData,
            preferences: userInput
          });
        }, 2000);
        setConversationStep(6);
        break;

      default:
        addAIMessage("I've already generated a complete travel plan for you. If you need to replan, please click the restart button below.", 500);
    }
  };

  const generateCompletePlan = async (data) => {
    try {
      const attractions = await base44.entities.Attraction.list();
      const restaurants = await base44.entities.Restaurant.list();

      const attractionsContext = attractions
        .map(a => `- ${a.name}: ${a.description} (Category: ${a.category}, Price: ${a.price_range}, ${a.suitable_for_rainy_season ? '✓Suitable for rainy season' : ''}${a.indoor ? ', ✓Indoor' : ''}, Location: ${a.location || 'Darwin'})`)
        .join('\n');

      const restaurantsContext = restaurants
        .map(r => `- ${r.name}: ${r.description} (${r.cuisine_type}, Price: ${r.price_range}, Location: ${r.location || 'Darwin'}, Specialties: ${r.specialties || 'None'})`)
        .join('\n');

      const prompt = `You are a senior Darwin Travel Planning Specialist with over 10 years of experience in Australia's Northern Territory tourism industry. Please create a professional, detailed, and executable Darwin travel plan based on customer requirements.

**Customer Profile:**
━━━━━━━━━━━━━━━━━━━━━━
• Total Budget: AUD $${data.budget}
• Trip Duration: ${data.duration} days ${parseInt(data.duration) - 1} nights
• Departure Date: ${data.travelDates}
• Travel Season: ${data.isRainySeason ? 'Wet Season (Nov-Apr)' : 'Dry Season (May-Oct)'}
• Departure City: ${data.departureCity}
• Interest Tags: ${data.interests.join(', ')}
• Special Requirements: ${data.preferences}
━━━━━━━━━━━━━━━━━━━━━━

**Local Database Resources:**

【Featured Attractions Database】
${attractionsContext}

【Featured Restaurants Database】
${restaurantsContext}

═══════════════════════════════════════
Please output the complete plan in the following professional structure:
═══════════════════════════════════════

# 📋 Darwin ${data.duration}-Day In-Depth Tour - Professional Itinerary Plan

## 【EXECUTIVE SUMMARY】

**Itinerary Code:** DARWIN-${data.duration}D-${new Date().getFullYear()}
**Planning Date:** ${new Date().toLocaleDateString('en-US')}
**Plan Version:** Professional Edition

**Core Highlights:**
• [Highlight 1 - Based on customer interests]
• [Highlight 2]
• [Highlight 3]
• [Highlight 4]

**Itinerary Features:**
• Type: [e.g., Nature Exploration/Cultural Deep Dive/Leisure Vacation]
• Difficulty Level: [e.g., Easy/Moderate/Requires Fitness]
• Suitable For: [Description]

---

## 【DAILY ITINERARY】

${Array.from({length: parseInt(data.duration)}, (_, i) => `
### DAY ${i + 1} - Day ${['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'][i] || `${i+1}`}

**Today's Theme:** [Theme Name]
**Activity Intensity:** ⭐⭐⭐☆☆
**Estimated Cost:** AUD $XXX

#### ⏰ Detailed Schedule

**07:00 - 08:30 | Breakfast Time**
- 📍 Restaurant: [Select from restaurant database]
- 🍳 Recommended: [Specific dishes]
- 💰 Cost: AUD $XX-XX/person
- 📝 Specialty: [Description]

**09:00 - 12:00 | Morning Activity**
- 📍 Location: [Select from attractions database]
- 🎯 Activity: [Detailed description]
- 💵 Admission: AUD $XX
- ⏱️ Duration: X hours
- 🚗 Transport: [Method and cost]
${data.isRainySeason ? '- 🌧️ Rainy Day Plan B: [Alternative]' : ''}
- 💡 Pro Tips: [Professional advice]

**12:30 - 14:00 | Lunch Time**
- 📍 Restaurant: [Select from restaurant database]
- 🍽️ Cuisine: [Type]
- 💰 Cost: AUD $XX-XX/person
- ⭐ Must-Try: [Recommended dishes]

**14:30 - 18:00 | Afternoon Activity**
- 📍 Location: [Select from attractions database]
- 🎯 Activity: [Detailed description]
- 💵 Admission: AUD $XX
- ⏱️ Duration: X hours
- 🚗 Transport: [Method]
${data.isRainySeason ? '- 🌧️ Rainy Day Plan B: [Alternative]' : ''}

**18:30 - 20:30 | Dinner Recommendation**
- 📍 Restaurant: [Select from restaurant database]
- 🍽️ Specialty: [Description]
- 💰 Cost: AUD $XX-XX/person

**20:30+ | Evening Activity (Optional)**
- 💫 Recommended: [Activity]
- 💰 Cost: AUD $XX

#### 📌 Today's Key Points
- ✓ [Point 1]
- ✓ [Point 2]

#### 💰 Today's Budget Summary: AUD $XXX

---
`).join('\n')}

## 【ACCOMMODATION PLAN】

### Recommended Accommodation Areas

**Darwin CBD (City Center)** ⭐⭐⭐⭐⭐
- Advantages: [Description]
- Suitable For: [Audience]
- Price Range: AUD $XXX-XXX/night

**Darwin Waterfront** ⭐⭐⭐⭐⭐
- Advantages: [Description]
- Suitable For: [Audience]
- Price Range: AUD $XXX-XXX/night

### Specific Hotel Recommendations

#### 【Luxury Choice】★★★★★
**Hotel Name:** [Name]
- Price: AUD $XXX-XXX/night
- ${parseInt(data.duration) - 1} nights total: AUD $XXX
- Features: [Detailed description]
- Facilities: [List]
- Booking Link: [Booking.com etc]

#### 【Premium Mid-Range】★★★★
**Hotel Name:** [Name]
- Price: AUD $XXX-XXX/night
- ${parseInt(data.duration) - 1} nights total: AUD $XXX
- Features: [Detailed description]

#### 【Budget-Friendly】★★★
**Hotel Name:** [Name]
- Price: AUD $XXX-XXX/night
- ${parseInt(data.duration) - 1} nights total: AUD $XXX
- Features: [Detailed description]

💡 **Expert Advice:** [Recommend most suitable option based on budget]

---

## 【BUDGET BREAKDOWN TABLE】

| Cost Category | Item Details | Amount (AUD) | Percentage | Source |
|--------------|--------------|--------------|------------|--------|
| ✈️ Round-trip Flights | ${data.departureCity}-Darwin | $XXX | XX% | Estimate |
| 🏨 Accommodation | ${parseInt(data.duration) - 1} nights × $XX/night | $XXX | XX% | Market Average |
| 🍽️ Total Dining | ${data.duration} days × $XX/day | $XXX | XX% | Local Data |
| 🎫 Total Admission | [List attractions] | $XXX | XX% | Local Data |
| 🚗 Transportation | Local transport/Car rental | $XXX | XX% | Estimate |
| 🎯 Special Experiences | [Special activities] | $XXX | XX% | Actual Price |
| 🛍️ Shopping Budget | Souvenirs/Specialties | $XXX | XX% | Reserved |
| 💼 Misc Expenses | Tips/Communication etc | $XXX | XX% | Estimate |
| 🔒 Emergency Reserve | 10-15% reserve | $XXX | XX% | Suggested |
| **💰 TOTAL** | | **$${data.budget}** | **100%** | |

### 💡 Money-Saving Tips
1. [Specific tip 1]
2. [Specific tip 2]
3. [Specific tip 3]

---

## 【ATTRACTIONS IN-DEPTH GUIDE】

${Array.from({length: Math.min(parseInt(data.duration) * 2, 8)}, (_, i) => `
### 🏆 Attraction ${i + 1}: [Select from attractions database]

**Basic Information**
- ⭐ Recommendation: ★★★★★ (${i === 0 ? 'Highly Recommended' : 'Recommended'})
- 📍 Location: [Detailed address]
- ⏰ Opening Hours: [Hours]
- 💵 Admission: AUD $XX (Adult) | $XX (Child)
- ⏱️ Suggested Visit: X-X hours
${data.isRainySeason ? `- 🌧️ Wet Season Suitable: ✓ Yes / ✗ No
- 🏠 Indoor Activity: ✓ Yes / ✗ No` : ''}

**Attraction Introduction**
[150-200 words detailed introduction, including history, features, highlights]

**Visit Strategy**
- 🎯 Must-See: [List 2-3 items]
- 📸 Best Photo Spots: [Description]
- ⏰ Recommended Time: [Time and reason]
- 👥 Crowd Status: [Description]

**Practical Tips**
- ✓ [Tip 1]
- ✓ [Tip 2]
- ✓ [Tip 3]

**Surrounding Facilities**
- Parking: [Information]
- Dining: [Nearby options]
- Restrooms: [Location]

---
`).join('\n')}

## 【DINING GUIDE】

${Array.from({length: Math.min(parseInt(data.duration) * 1.5, 6)}, (_, i) => `
### 🍽️ Restaurant ${i + 1}: [Select from restaurant database]

**Restaurant Profile**
- ⭐ Recommendation: ★★★★★
- 🍴 Cuisine: [Type]
- 💰 Per Person: AUD $XX-XX
- 📍 Address: [Detailed address]
- 📞 Phone: [Booking number]
- ⏰ Hours: [Hours]
- 🌐 Website: [Link]

**Signature Menu**
1. [Dish 1] - AUD $XX
   [Description]
2. [Dish 2] - AUD $XX
   [Description]
3. [Dish 3] - AUD $XX
   [Description]

**Dining Suggestions**
- 💡 [Suggestion 1]
- 💡 [Suggestion 2]
- 💡 Reservation: [Whether booking needed]

**Customer Reviews**
"[Simulated genuine review]" - ⭐⭐⭐⭐⭐

---
`).join('\n')}

## 【TRANSPORTATION PLAN】

### Inter-city Transport

**✈️ Flight Recommendations**
- Recommended Airlines: [List]
- Reference Price: AUD $XXX-XXX (Round-trip)
- Booking Suggestion: [Advance time]

### Local Transportation Options

**🚗 Option A: Self-Drive Rental (Recommended)**
- Suitable For: High flexibility, suitable for in-depth tours
- Daily Rental: AUD $XX-XX
- ${data.duration} days total: AUD $XXX
- Recommended Company: [Company name]
- Note: [License, insurance, etc.]

**🚌 Option B: Public Transport**
- Suitable For: Limited budget, city touring
- Day Pass: AUD $XX
- ${data.duration} days total: AUD $XXX
- Note: [Schedule, routes]

**🚕 Option C: Taxi/Uber**
- Suitable For: Flexible travel, don't want to drive
- Estimated daily cost: AUD $XX-XX
- ${data.duration} days total: AUD $XXX

**💡 Expert Recommendation:** [Recommend most suitable option based on itinerary]

---

${data.isRainySeason ? `
## 【WET SEASON EXCLUSIVE GUIDE】

### 🌧️ Wet Season Characteristics (Nov-Apr)

**Climate Data**
- 🌡️ Average Temperature: 28-33°C
- 💧 Humidity: 85-95%
- 🌧️ Rainfall: Afternoon thunderstorms mainly (usually 1-2 hours)
- ☀️ Sunny Days: Clears after rain, strong sunlight

### ✅ Five Advantages of Wet Season
1. [Advantage 1]
2. [Advantage 2]
3. [Advantage 3]
4. [Advantage 4]
5. [Advantage 5]

### 🎒 Wet Season Essential Packing List

**Must Bring (★★★★★)**
- ☑ Light raincoat (Recommended brand/model)
- ☑ Waterproof backpack/dry bag
- ☑ Quick-dry clothing (at least 2 sets)
- ☑ Non-slip sneakers
- ☑ Sunscreen SPF50+
- ☑ Insect repellent (more mosquitoes in wet season)

**Recommended (★★★)**
- ☐ Waterproof camera cover/phone waterproof case
- ☐ Folding umbrella
- ☐ Quick-dry towel
- ☐ Waterproof shoe covers

### 🔄 Rainy Day Alternative Options

**Indoor Activities**
1. [Activity 1] - [Location] - AUD $XX
2. [Activity 2] - [Location] - AUD $XX
3. [Activity 3] - [Location] - AUD $XX

**Covered Attractions**
1. [Attraction 1]
2. [Attraction 2]
3. [Attraction 3]

### ⚠️ Wet Season Safety Tips
- ⚠️ [Safety tip 1]
- ⚠️ [Safety tip 2]
- ⚠️ [Safety tip 3]

### 📸 Wet Season Photography Tips
- 💡 [Tip 1]
- 💡 [Tip 2]

---
` : ''}

## 【PRACTICAL INFORMATION】

### 📱 Essential Apps Checklist

| App Name | Purpose | Necessity | Download |
|----------|---------|-----------|----------|
| Google Maps | Navigation | ★★★★★ | Must Have |
| Uber | Ride Hailing | ★★★★ | Recommended |
| TripAdvisor | Reviews | ★★★★ | Recommended |
| BOM Weather | Weather | ★★★★★ | Must Have |
| XE Currency | Exchange Rate | ★★★ | Suggested |

### 🌍 Cultural Information

**Basic Information**
- 🕐 Time Difference: [Description]
- 🗣️ Language: English
- 💵 Currency: Australian Dollar (AUD)
- 🔌 Voltage: 240V (Need adapter plug)
- 💳 Credit Cards: Visa/Master widely accepted

**Tipping Culture**
- Restaurants: [Description]
- Taxis: [Description]
- Hotels: [Description]

### 🆘 Emergency Contacts

**Emergency Services**
- 🚨 Police/Fire/Ambulance: 000
- 🏥 Darwin Hospital: [Phone]
- 👮 Darwin Police: [Phone]

**Tourism Services**
- ℹ️ Darwin Visitor Center: [Phone]
- 🏛️ Chinese Consulate 24h Protection: [Phone]
- ✈️ Darwin Airport: [Phone]

### 🛍️ Shopping Guide

**Recommended Specialties**
1. [Specialty 1] - [Price Range] - [Purchase Location]
2. [Specialty 2] - [Price Range] - [Purchase Location]
3. [Specialty 3] - [Price Range] - [Purchase Location]

**Shopping Centers**
- [Mall 1]: [Features]
- [Mall 2]: [Features]

**Tax Refund Information**
- Requirements: [Description]
- Process: [Steps]
- Location: [Airport tax refund counter]

---

## 【EXPERT VALUE-ADDED SERVICES】

### 🎯 Pre-Trip Preparation Checklist

**30 Days Before**
- ☐ Book flights
- ☐ Book hotels
- ☐ Purchase travel insurance
- ☐ Apply for visa (if needed)

**7 Days Before**
- ☐ Reserve popular restaurants
- ☐ Book special activities
- ☐ Set up international roaming/buy SIM card
- ☐ Prepare adapter plugs

**1 Day Before**
- ☐ Check passport/visa
- ☐ Print hotel/flight confirmations
- ☐ Prepare AUD cash
- ☐ Download offline maps

### 💰 Top 10 Money-Saving Secrets

1. [Money-saving tip 1]
2. [Money-saving tip 2]
3. [Money-saving tip 3]
4. [Money-saving tip 4]
5. [Money-saving tip 5]
6. [Money-saving tip 6]
7. [Money-saving tip 7]
8. [Money-saving tip 8]
9. [Money-saving tip 9]
10. [Money-saving tip 10]

### ⭐ Best Experience Recommendations

**Sunrise/Sunset Viewing Points**
- Best Location: [Location]
- Recommended Time: [Time]

**Local Favorites**
- [Hidden attractions/food/experiences]

**Photography Enthusiasts**
- Recommended Gear: [Suggestions]
- Best Light: [Time]
- Must-Shoot Spots: [List]

---

## 【PLAN SUMMARY】

### ✓ Plan Completeness Check

✅ ${data.duration}-day complete itinerary planning
✅ Budget AUD $${data.budget} detailed allocation
✅ ${data.isRainySeason ? 'Wet Season exclusive optimized plan' : 'Dry Season optimal experience design'}
✅ [X] featured attractions explained in detail
✅ [X] featured restaurants recommended
✅ Complete transportation and accommodation plan
✅ Practical information comprehensively covered

### 📊 Itinerary Data Statistics

- 🏨 Recommended Accommodation: ${parseInt(data.duration) - 1} nights
- 🎫 Attractions to Visit: Approx [X] attractions
- 🍽️ Recommended Restaurants: [X] restaurants
- 🚗 Transportation Budget: AUD $XXX
- ⏱️ Effective touring time: [X] hours

### 🎯 Booking Priority

**High Priority (Book Immediately)**
1. ✈️ [Item 1]
2. 🏨 [Item 2]
3. 🎫 [Item 3]

**Medium Priority (1 Week Advance)**
1. [Item 1]
2. [Item 2]

**Low Priority (Book Anytime)**
1. [Item 1]
2. [Item 2]

---

## 【EXPERT'S MESSAGE】

Dear Traveler,

This ${data.duration}-day Darwin itinerary plan is carefully customized based on your budget, interests, and travel dates. Darwin, as the gateway to Australia's Northern Territory, offers unique tropical charm, Aboriginal culture, and natural wonders.

${data.isRainySeason ? "Although you've chosen to travel during the wet season, this is actually a great time to experience Darwin's unique charm. Darwin during the wet season is vibrant, waterfalls are at their fullest, and natural landscapes are more spectacular. We've prepared comprehensive wet season alternatives to ensure a perfect experience regardless of weather." : "You've chosen the dry season, which is Darwin's best tourism season. The weather is pleasant and suitable for various outdoor activities. This will be a perfect tropical adventure."}

I hope this plan becomes your perfect guide for your Darwin journey. Wishing you a pleasant trip and wonderful memories!

**For any questions, feel free to consult anytime.**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Darwin AI Travel Guide**
Professional Travel Planning Service
Professional Travel Planning · Serving Every Traveler with Care
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*This plan is AI-generated, combining local database and real-time internet information*
*Plan Number: DARWIN-${new Date().getTime()}*
*Generation Time: ${new Date().toLocaleString('en-US')}*`;

      const planContent = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setFinalPlan(planContent);

      await base44.entities.TravelPlan.create({
        plan_name: `${data.departureCity} to Darwin ${data.duration}-Day Trip`,
        budget: parseFloat(data.budget),
        duration_days: parseInt(data.duration),
        travel_dates: data.travelDates,
        preferences: `Interests: ${data.interests.join(', ')}; ${data.preferences}`,
        is_rainy_season: data.isRainySeason,
        ai_recommendations: planContent,
        status: "Planning"
      });

      addAIMessage(
        `🎉 Done! I've generated a professional Darwin travel plan for you.\n\n✓ Complete ${data.duration}-day itinerary\n✓ Detailed budget breakdown\n${data.isRainySeason ? '✓ Wet season exclusive optimization tips\n' : ''}✓ Featured attractions and restaurant recommendations\n✓ Comprehensive practical travel information\n\nThe plan has been automatically saved to "My Trips" for your review and export anytime.`,
        1000
      );

    } catch (error) {
      console.error("Error generating plan:", error);
      addAIMessage("Sorry, there was a problem generating the plan. Please try again or contact customer service.", 500);
    }
    setIsTyping(false);
  };

  const handleSend = () => {
    if (inputValue.trim() && !isTyping) {
      processUserResponse(inputValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setConversationStep(0);
    setTravelData({
      budget: "",
      duration: "",
      travelDates: "",
      departureCity: "",
      interests: [],
      preferences: "",
      isRainySeason: false
    });
    setFinalPlan(null);
    addAIMessage(
      "Hello! I'm the Darwin Travel AI Assistant. I'll help you plan the perfect Darwin trip through a few questions.\n\nLet's get started! When are you planning to visit Darwin? (Please enter departure date, format: YYYY-MM-DD, e.g., 2024-03-15)"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent">
                AI Smart Chat Assistant
              </h1>
              <p className="text-gray-600">Let AI customize your exclusive travel plan through conversation</p>
            </div>
            {messages.length > 2 && (
              <Button
                onClick={resetConversation}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restart
              </Button>
            )}
          </div>

          {conversationStep < 6 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Planning Progress</span>
                <span className="text-sm font-semibold text-orange-600">{conversationStep}/6</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(conversationStep / 6) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="grid grid-cols-6 gap-2 mt-3">
                {['Date', 'Days', 'Budget', 'From', 'Interests', 'Prefs'].map((label, idx) => (
                  <div
                    key={idx}
                    className={`text-center text-xs ${
                      idx < conversationStep
                        ? 'text-teal-600 font-semibold'
                        : idx === conversationStep
                        ? 'text-orange-600 font-semibold'
                        : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-sm h-[600px] flex flex-col">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-teal-500 text-white rounded-t-xl p-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="w-5 h-5" />
              Chatting...
              <Badge className="ml-auto bg-white/20">AI Assistant Online</Badge>
            </CardTitle>
          </CardHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar className={`w-10 h-10 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600' 
                        : 'bg-gradient-to-br from-teal-400 to-teal-600'
                    }`}>
                      <AvatarFallback className="text-white">
                        {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                      <div
                        className={`inline-block px-4 py-3 rounded-2xl max-w-[80%] ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600">
                    <AvatarFallback className="text-white">
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {finalPlan && (
            <div className="border-t p-4 bg-gradient-to-r from-orange-50 to-teal-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  Your Exclusive Travel Plan
                </h3>
                <Button
                  onClick={() => navigate(createPageUrl("MyTrips"))}
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-teal-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  View Complete Plan
                </Button>
              </div>
              <div className="bg-white rounded-xl p-4 max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-600 line-clamp-6 whitespace-pre-wrap">
                  {finalPlan.substring(0, 300)}...
                </p>
              </div>
            </div>
          )}

          {conversationStep < 6 && (
            <CardContent className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your answer..."
                  disabled={isTyping}
                  className="flex-1 text-base"
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600"
                  size="icon"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
