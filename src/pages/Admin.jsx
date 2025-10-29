
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Shield, MapPin, Utensils, Plus, Edit, Trash2,
  Loader2, AlertCircle, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attractions, setAttractions] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("attractions");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.role !== 'admin') {
        setIsLoading(false);
        return;
      }

      const [attractionsData, restaurantsData] = await Promise.all([
        base44.entities.Attraction.list("-created_date"),
        base44.entities.Restaurant.list("-created_date")
      ]);

      setAttractions(attractionsData);
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleSaveAttraction = async (data) => {
    setIsSaving(true);
    try {
      if (editingItem?.id) {
        await base44.entities.Attraction.update(editingItem.id, data);
      } else {
        await base44.entities.Attraction.create(data);
      }
      loadData();
      setDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving attraction:", error);
      alert("Failed to save, please try again.");
    }
    setIsSaving(false);
  };

  const handleSaveRestaurant = async (data) => {
    setIsSaving(true);
    try {
      if (editingItem?.id) {
        await base44.entities.Restaurant.update(editingItem.id, data);
      } else {
        await base44.entities.Restaurant.create(data);
      }
      loadData();
      setDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving restaurant:", error);
      alert("Failed to save, please try again.");
    }
    setIsSaving(false);
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Are you sure you want to delete?")) return;

    try {
      if (type === 'attraction') {
        await base44.entities.Attraction.delete(id);
      } else {
        await base44.entities.Restaurant.delete(id);
      }
      loadData();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete, please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <Card className="border-2 border-red-200">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Access Denied</h2>
              <p className="text-gray-600">This page is restricted to administrators only</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                <Shield className="w-10 h-10 text-orange-600" />
                Admin Console
              </h1>
              <p className="text-gray-600 text-lg">Manage attractions and restaurant data</p>
            </div>
            <Badge className="bg-orange-500 text-lg px-4 py-2">
              Admin: {user.full_name || user.email}
            </Badge>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm p-1">
            <TabsTrigger value="attractions" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Attractions Management ({attractions.length})
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Restaurants Management ({restaurants.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attractions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Attractions List</h2>
              <Dialog open={dialogOpen && activeTab === 'attractions'} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setEditingItem(null)}
                    className="bg-gradient-to-r from-orange-500 to-teal-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Attraction
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Edit Attraction' : 'Add New Attraction'}
                    </DialogTitle>
                  </DialogHeader>
                  <AttractionForm
                    initialData={editingItem}
                    onSave={handleSaveAttraction}
                    onCancel={() => {
                      setDialogOpen(false);
                      setEditingItem(null);
                    }}
                    isSaving={isSaving}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attractions.map((attraction, index) => (
                <motion.div
                  key={attraction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all">
                    {attraction.image_url && (
                      <div className="h-40 overflow-hidden rounded-t-xl">
                        <img
                          src={attraction.image_url}
                          alt={attraction.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2">{attraction.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge>{attraction.category}</Badge>
                        {attraction.suitable_for_rainy_season && (
                          <Badge className="bg-blue-500">Suitable for Rainy Season</Badge>
                        )}
                        {attraction.indoor && (
                          <Badge className="bg-purple-500">Indoor</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {attraction.description}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setEditingItem(attraction);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete('attraction', attraction.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Restaurants List</h2>
              <Dialog open={dialogOpen && activeTab === 'restaurants'} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setEditingItem(null)}
                    className="bg-gradient-to-r from-orange-500 to-teal-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Restaurant
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Edit Restaurant' : 'Add New Restaurant'}
                    </DialogTitle>
                  </DialogHeader>
                  <RestaurantForm
                    initialData={editingItem}
                    onSave={handleSaveRestaurant}
                    onCancel={() => {
                      setDialogOpen(false);
                      setEditingItem(null);
                    }}
                    isSaving={isSaving}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all">
                    {restaurant.image_url && (
                      <div className="h-40 overflow-hidden rounded-t-xl">
                        <img
                          src={restaurant.image_url}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2">{restaurant.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge>{restaurant.cuisine_type}</Badge>
                        {restaurant.price_range && (
                          <Badge variant="outline">{restaurant.price_range}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {restaurant.description}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setEditingItem(restaurant);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete('restaurant', restaurant.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AttractionForm({ initialData, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    description: "",
    category: "Nature Scenery",
    location: "",
    suitable_for_rainy_season: false,
    indoor: false,
    image_url: "",
    price_range: "Medium",
    opening_hours: "",
    recommended_duration: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Attraction Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>

      <div>
        <Label>Description *</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
          className="h-24"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nature Scenery">Nature Scenery</SelectItem>
              <SelectItem value="Cultural Experience">Cultural Experience</SelectItem>
              <SelectItem value="Wildlife">Wildlife</SelectItem>
              <SelectItem value="Water Activities">Water Activities</SelectItem>
              <SelectItem value="Historical Site">Historical Site</SelectItem>
              <SelectItem value="Museum">Museum</SelectItem>
              <SelectItem value="Indigenous Culture">Indigenous Culture</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Price Range</Label>
          <Select value={formData.price_range} onValueChange={(value) => setFormData({...formData, price_range: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Location</Label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          placeholder="e.g., Darwin City Centre"
        />
      </div>

      <div>
        <Label>Image URL</Label>
        <Input
          value={formData.image_url}
          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Opening Hours</Label>
          <Input
            value={formData.opening_hours}
            onChange={(e) => setFormData({...formData, opening_hours: e.target.value})}
            placeholder="e.g., 9:00-17:00"
          />
        </div>

        <div>
          <Label>Recommended Duration</Label>
          <Input
            value={formData.recommended_duration}
            onChange={(e) => setFormData({...formData, recommended_duration: e.target.value})}
            placeholder="e.g., 2-3 hours"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.suitable_for_rainy_season}
            onChange={(e) => setFormData({...formData, suitable_for_rainy_season: e.target.checked})}
            className="w-4 h-4"
          />
          <span className="text-sm">Suitable for Rainy Season</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.indoor}
            onChange={(e) => setFormData({...formData, indoor: e.target.checked})}
            className="w-4 h-4"
          />
          <span className="text-sm">Indoor Activity</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-teal-500" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function RestaurantForm({ initialData, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    description: "",
    cuisine_type: "Australian Local",
    location: "",
    price_range: "$$",
    image_url: "",
    specialties: "",
    opening_hours: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Restaurant Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>

      <div>
        <Label>Description *</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
          className="h-24"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Cuisine Type *</Label>
          <Select value={formData.cuisine_type} onValueChange={(value) => setFormData({...formData, cuisine_type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Australian Local">Australian Local</SelectItem>
              <SelectItem value="Seafood">Seafood</SelectItem>
              <SelectItem value="Asian Cuisine">Asian Cuisine</SelectItem>
              <SelectItem value="Indigenous Food">Indigenous Food</SelectItem>
              <SelectItem value="International Cuisine">International Cuisine</SelectItem>
              <SelectItem value="Fast Food">Fast Food</SelectItem>
              <SelectItem value="Cafe">Cafe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Price Range</Label>
          <Select value={formData.price_range} onValueChange={(value) => setFormData({...formData, price_range: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="$">$ (Economical)</SelectItem>
              <SelectItem value="$$">$$ (Mid-range)</SelectItem>
              <SelectItem value="$$$">$$$ (High-end)</SelectItem>
              <SelectItem value="$$$$">$$$$ (Luxury)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Location</Label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          placeholder="e.g., Darwin Waterfront"
        />
      </div>

      <div>
        <Label>Image URL</Label>
        <Input
          value={formData.image_url}
          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
          placeholder="https://..."
        />
      </div>

      <div>
        <Label>Specialties</Label>
        <Textarea
          value={formData.specialties}
          onChange={(e) => setFormData({...formData, specialties: e.target.value})}
          placeholder="e.g., Fresh Mud Crab, Australian Beef Steak, Mango Dessert"
          className="h-20"
        />
      </div>

      <div>
        <Label>Opening Hours</Label>
        <Input
          value={formData.opening_hours}
          onChange={(e) => setFormData({...formData, opening_hours: e.target.value})}
          placeholder="e.g., Mon-Sun 11:00-22:00"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-teal-500" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
