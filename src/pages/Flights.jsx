
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Search, Loader2, Calendar, Users, ExternalLink, TrendingDown, Clock, Star, DollarSign, RotateCcw, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar"; // Renamed to avoid conflict
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

export default function Flights() {
  const [searchData, setSearchData] = useState({
    departureCity: "",
    departureDate: "",
    returnDate: "",
    passengers: 1
  });
  const [selectedDepartureDate, setSelectedDepartureDate] = useState(null);
  const [selectedReturnDate, setSelectedReturnDate] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);
  const [results, setResults] = useState(null);
  const [quickLinks, setQuickLinks] = useState([]);
  const [livePrices, setLivePrices] = useState(null);

  const handleDepartureDateSelect = (date) => {
    if (date) {
      setSelectedDepartureDate(date);
      setSearchData({...searchData, departureDate: format(date, 'yyyy-MM-dd')});
    } else {
      setSelectedDepartureDate(null);
      setSearchData({...searchData, departureDate: ""});
    }
  };

  const handleReturnDateSelect = (date) => {
    if (date) {
      setSelectedReturnDate(date);
      setSearchData({...searchData, returnDate: format(date, 'yyyy-MM-dd')});
    } else {
      setSelectedReturnDate(null);
      setSearchData({...searchData, returnDate: ""});
    }
  };

  const fetchLivePrices = async () => {
    if (!searchData.departureCity || !searchData.departureDate) {
      alert("Please enter departure city and date first");
      return;
    }

    setIsFetchingPrices(true);
    try {
      const pricePrompt = `You need to provide flight reference information from ${searchData.departureCity} to Darwin (Darwin, DRW).

**Search Information:**
- From: ${searchData.departureCity}
- To: Darwin (DRW)  
- Date: ${searchData.departureDate}${searchData.returnDate ? ' - ' + searchData.returnDate : ' (One-way)'}
- Passengers: ${searchData.passengers}

**Please provide basic information for these airlines:**

1. **Qantas (Australian Airlines)** - https://www.qantas.com
2. **Virgin Australia** - https://www.virginaustralia.com  
3. **Jetstar** - https://www.jetstar.com

**For each airline provide:**
- Whether they have this route (direct/connecting/unavailable)
- Typical flight duration
- General price range (estimated range based on historical data)
- Airline features

**Output format:**
{
  "airlines": [
    {
      "name": "Qantas",
      "has_route": true,
      "flight_type": "Direct", 
      "duration": "4-5 hours",
      "price_estimate": "$800-1500",
      "price_note": "Reference price range, check official website for actual prices",
      "website": "https://www.qantas.com",
      "features": "Full-service airline, baggage included in fare"
    }
  ],
  "disclaimer": "Above prices are historical reference ranges, check airline websites for actual prices"
}`;

      const priceData = await base44.integrations.Core.InvokeLLM({
        prompt: pricePrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            airlines: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  has_route: { type: "boolean" },
                  flight_type: { type: "string" },
                  duration: { type: "string" },
                  price_estimate: { type: "string" },
                  price_note: { type: "string" },
                  website: { type: "string" },
                  features: { type: "string" }
                }
              }
            },
            disclaimer: { type: "string" }
          }
        }
      });

      setLivePrices(priceData);
    } catch (error) {
      console.error("Error fetching info:", error);
      alert("Error fetching information");
    }
    setIsFetchingPrices(false);
  };

  const generateFlightLinks = () => {
    if (!searchData.departureCity || !searchData.departureDate) {
      alert("Please enter departure city and date first");
      return;
    }

    const links = [
      {
        name: "Qantas",
        icon: "🦘",
        url: "https://www.qantas.com",
        description: "Australia's National Airline",
        color: "from-red-500 to-red-600"
      },
      {
        name: "Virgin Australia", 
        icon: "🎈",
        url: "https://www.virginaustralia.com",
        description: "Value for Money",
        color: "from-purple-500 to-purple-600"
      },
      {
        name: "Jetstar",
        icon: "⭐",
        url: "https://www.jetstar.com",
        description: "Budget Airline",
        color: "from-amber-500 to-amber-600"
      }
    ];
    setQuickLinks(links);
  };

  const handleSearch = async () => {
    await fetchLivePrices();
    
    generateFlightLinks();
    
    setIsSearching(true);
    try {
      const prompt = `As a Darwin travel expert, please provide professional advice for the following flight search:

**Search Information:**
- Departure City: ${searchData.departureCity}
- Destination: Darwin (Darwin, Australia)
- Departure Date: ${searchData.departureDate}
- Return Date: ${searchData.returnDate || 'One-way'}
- Passengers: ${searchData.passengers}

**Please provide:**

1. **Recommended Airlines** (based on service and routes, supplementary evaluation)
   - Qantas (Australian Airlines) - Direct/connecting status, service features
   - Virgin Australia - Direct/connecting status, service features
   - Jetstar - Budget option, important notes
   - Other international airlines that may serve this route or suggestions

2. **Flight Times and Routes**
   - Typical flight duration from ${searchData.departureCity}
   - Whether connecting flights are common, possible connecting points (if applicable)
   - Recommended flight times (considering comfort, avoiding delays, etc.)

3. **Booking Advice**
   - Best time to book (how far in advance for good prices)
   - Besides direct airline websites, which search platforms to consider for price comparison (like Google Flights, Skyscanner, Kayak, etc.)
   - Recommendations for loyalty programs/points accumulation (if any)

4. **Money-Saving Tips**
   - Impact of flexible date selection on prices
   - Notes on baggage fees, meals, and other additional service charges
   - Suggestions for credit card benefits, mileage redemption, etc.

**Important Note:**
- Users have obtained airline website links and price estimates through a dedicated module.
- Your advice should focus on supplementing practical knowledge and strategies for travel planning and booking, rather than repeating specific price information.
- Emphasize that prices change in real-time, final prices should refer to airline websites.

Please present advice in a clear and practical manner, avoiding repetition of information already provided by the real-time price module.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setResults(response);

      await base44.entities.FlightSearch.create({
        departure_city: searchData.departureCity,
        arrival_city: "Darwin",
        departure_date: searchData.departureDate,
        return_date: searchData.returnDate,
        passengers: searchData.passengers,
        search_results: response
      });
    } catch (error) {
      console.error("Error searching flights:", error);
      alert("Error searching flights, please try again");
    }
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent">
            Real-Time Flight Search
          </h1>
          <p className="text-gray-600 text-lg">Direct links to airline websites for latest prices and flight info</p>
        </motion.div>

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-teal-500 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Plane className="w-6 h-6" />
              Search Flights to Darwin
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                  <Plane className="w-5 h-5 text-orange-600" />
                  Departure City *
                </Label>
                <Input
                  placeholder="e.g., Beijing, Shanghai, Sydney, Melbourne"
                  value={searchData.departureCity}
                  onChange={(e) => setSearchData({...searchData, departureCity: e.target.value})}
                  className="text-base"
                />
              </div>

              <div>
                <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-teal-600" />
                  Number of Passengers
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={searchData.passengers}
                  onChange={(e) => setSearchData({...searchData, passengers: parseInt(e.target.value)})}
                  className="text-base"
                />
              </div>

              <div>
                <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Departure Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal text-base h-11"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      {searchData.departureDate ? format(new Date(searchData.departureDate), 'PPP') : 'Select departure date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDepartureDate}
                      onSelect={handleDepartureDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  Return Date (Optional)
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal text-base h-11"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      {searchData.returnDate ? format(new Date(searchData.returnDate), 'PPP') : 'Select return date (optional)'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedReturnDate}
                      onSelect={handleReturnDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={generateFlightLinks}
                disabled={!searchData.departureCity || !searchData.departureDate}
                variant="outline"
                className="flex-1"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Generate Search Links
              </Button>
              <Button
                onClick={handleSearch}
                disabled={!searchData.departureCity || !searchData.departureDate || isSearching || isFetchingPrices}
                className="flex-1 bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600 text-lg py-6"
              >
                {(isSearching || isFetchingPrices) ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing & Fetching Prices...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search + AI Advice & Live Prices
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {livePrices && livePrices.airlines && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="border-none shadow-2xl bg-gradient-to-br from-blue-50 to-teal-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Plane className="w-6 h-6 text-blue-600" />
                  Flight Reference Information
                  <Badge className="ml-auto bg-blue-500">
                    Reference Prices
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  {livePrices.disclaimer || "Above prices are historical reference ranges, check airline websites for actual prices"}
                </p>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                {livePrices.airlines.filter(a => a.has_route).map((airline, i) => (
                  <a key={i} href={airline.website} target="_blank" rel="noopener noreferrer" className="block">
                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-400 cursor-pointer group h-full">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-xl text-gray-900">{airline.name}</h3>
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:scale-110 transition-all" />
                        </div>
                        
                        <Badge variant="outline" className="mb-3 text-sm font-semibold">
                          {airline.flight_type}
                        </Badge>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 flex-shrink-0 text-blue-600" />
                            <span>Duration: {airline.duration}</span>
                          </div>

                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Reference Price Range</p>
                            <p className="text-xl font-bold text-green-700">{airline.price_estimate}</p>
                            <p className="text-xs text-gray-500 mt-1">{airline.price_note}</p>
                          </div>
                          
                          {airline.features && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-xs text-blue-900">
                                💡 Features: {airline.features}
                              </p>
                            </div>
                          )}

                          <div className="pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-semibold group-hover:gap-3 transition-all">
                              <span>Visit Website for Prices</span>
                              <ExternalLink className="w-4 h-4" />
                            </div>
                            <p className="text-xs text-center text-gray-500 mt-1">
                              Search: {searchData.departureCity} → Darwin
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </CardContent>

              <div className="flex items-center justify-between pt-4 border-t px-6 pb-6">
                <p className="text-xs text-gray-500">
                  Click card to visit airline website · Search {searchData.departureCity} → Darwin (DRW)
                </p>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    fetchLivePrices();
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isFetchingPrices}
                >
                  {isFetchingPrices ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {quickLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Real-Time Price Search Links</h2>
              <Badge className="bg-orange-500">
                <ExternalLink className="w-3 h-3 mr-1" />
                Direct to Official Site
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                    <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 bg-gradient-to-br ${link.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                              {link.icon}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">
                                {link.name}
                              </h3>
                              <p className="text-sm text-gray-600">{link.description}</p>
                            </div>
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-50 to-teal-50 rounded-lg p-3 mt-3">
                          <p className="text-xs text-gray-600 mb-1">Search Info:</p>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {searchData.departureCity} → Darwin
                          </p>
                          <p className="text-xs text-gray-600">
                            📅 {searchData.departureDate}
                            {searchData.returnDate && ` - ${searchData.returnDate}`} | 👥 {searchData.passengers}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">💡 How to use:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>How to use:</strong> Click the links above and enter your flight information on the opened websites.</li>
                    <li>• <strong>Darwin Airport Code:</strong> DRW (Darwin International Airport)</li>
                    <li>• <strong>Search Information:</strong> From {searchData.departureCity} to Darwin (DRW)</li>
                    <li>• <strong>Date:</strong> {searchData.departureDate} {searchData.returnDate && `- ${searchData.returnDate}`}</li>
                    <li>• <strong>Passengers:</strong> {searchData.passengers}</li>
                    <li>• <strong>Price Comparison Tips:</strong> Compare prices on multiple platforms; differences can be 20-30%.</li>
                    <li>• <strong>Best Time:</strong> Booking 2-3 months in advance usually offers the best prices.</li>
                    <li>• <strong>Flexible Dates:</strong> Weekday flights are usually cheaper than weekends.</li>
                    <li>• <strong>Hidden Costs:</strong> Be aware of extra charges like baggage fees and seat selection.</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Expert Advice</h2>
            <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-xl">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  Flight Booking Advice
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {results}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!quickLinks.length && !livePrices && (
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Popular Routes Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { from: "Sydney", price: "$200-400", time: "4 hours", airlines: "Qantas, Virgin" },
                  { from: "Melbourne", price: "$250-450", time: "4.5 hours", airlines: "Qantas, Jetstar" },
                  { from: "Brisbane", price: "$180-380", time: "3.5 hours", airlines: "Virgin, Jetstar" },
                  { from: "Perth", price: "$300-550", time: "4 hours", airlines: "Qantas, Virgin" },
                  { from: "Adelaide", price: "$280-500", time: "3.5 hours", airlines: "Qantas" },
                  { from: "Cairns", price: "$150-300", time: "2 hours", airlines: "Qantas, Virgin" }
                ].map((route, index) => (
                  <div key={index} className="bg-gradient-to-br from-orange-50 to-teal-50 rounded-lg p-4">
                    <h4 className="font-bold text-lg mb-2">{route.from} → Darwin</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Price: <span className="font-semibold text-green-600">{route.price}</span>
                      </p>
                      <p className="text-gray-600">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Flight: {route.time}
                      </p>
                      <p className="text-gray-600">
                        <Plane className="w-4 h-4 inline mr-1" />
                        Airlines: {route.airlines}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
