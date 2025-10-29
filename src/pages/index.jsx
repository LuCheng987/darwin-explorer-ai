import Layout from "./Layout.jsx";

import Home from "./Home";

import PlanTrip from "./PlanTrip";

import Attractions from "./Attractions";

import Restaurants from "./Restaurants";

import MyTrips from "./MyTrips";

import Flights from "./Flights";

import Weather from "./Weather";

import AIAssistant from "./AIAssistant";

import Admin from "./Admin";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    PlanTrip: PlanTrip,
    
    Attractions: Attractions,
    
    Restaurants: Restaurants,
    
    MyTrips: MyTrips,
    
    Flights: Flights,
    
    Weather: Weather,
    
    AIAssistant: AIAssistant,
    
    Admin: Admin,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/PlanTrip" element={<PlanTrip />} />
                
                <Route path="/Attractions" element={<Attractions />} />
                
                <Route path="/Restaurants" element={<Restaurants />} />
                
                <Route path="/MyTrips" element={<MyTrips />} />
                
                <Route path="/Flights" element={<Flights />} />
                
                <Route path="/Weather" element={<Weather />} />
                
                <Route path="/AIAssistant" element={<AIAssistant />} />
                
                <Route path="/Admin" element={<Admin />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}