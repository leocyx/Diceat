"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  AdvancedMarker,
  Pin,
  useApiIsLoaded,
  useMapsLibrary,
  useMap,
} from "@vis.gl/react-google-maps";
import { Search, Plus, Star, MapPin, Clock, Users } from "lucide-react";

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating: number;
  photoUrl: string;
  lat: number;
  lng: number;
}

interface RestaurantSearchProps {
  onAddRestaurant: (restaurant: Restaurant) => void;
}

export default function RestaurantSearch({
  onAddRestaurant,
}: RestaurantSearchProps) {
  const map = useMap();
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const apiIsLoaded = useApiIsLoaded();
  const placesLibrary = useMapsLibrary("places");
  const inputRef = useRef<HTMLInputElement>(null);
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Initialize Autocomplete
  useEffect(() => {
    if (!apiIsLoaded || !placesLibrary || !inputRef.current) return;

    const autocomplete = new placesLibrary.Autocomplete(inputRef.current, {
      fields: [
        "place_id",
        "geometry",
        "name",
        "formatted_address",
        "rating",
        "user_ratings_total",
        "photos",
        "opening_hours",
        "price_level",
      ],
      types: ["restaurant", "food", "cafe"],
    });
    autoCompleteRef.current = autocomplete;

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place?.geometry?.location) {
        setSelectedPlace(place);
        map?.panTo({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [apiIsLoaded, placesLibrary, map]);

  // Handle POI Click on Map
  const handleMapClick = useCallback(
    (ev: any) => {
      if (!map || !placesLibrary || !ev.detail.placeId) {
        setSelectedPlace(null);
        return;
      }

      const service = new placesLibrary.PlacesService(map);
      service.getDetails(
        {
          placeId: ev.detail.placeId,
          fields: [
            "place_id",
            "geometry",
            "name",
            "formatted_address",
            "rating",
            "user_ratings_total",
            "photos",
            "opening_hours",
            "price_level",
          ],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            setSelectedPlace(place);
            if (place.geometry?.location) {
              map.panTo({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              });
            }
          }
        },
      );
    },
    [map, placesLibrary],
  );

  const handleAdd = () => {
    if (!selectedPlace) return;

    const restaurant: Restaurant = {
      id: selectedPlace.place_id || "",
      name: selectedPlace.name || "",
      address: selectedPlace.formatted_address || "",
      rating: selectedPlace.rating || 0,
      photoUrl: selectedPlace.photos?.[0]?.getUrl() || "",
      lat: selectedPlace.geometry?.location?.lat() || 0,
      lng: selectedPlace.geometry?.location?.lng() || 0,
    };

    onAddRestaurant(restaurant);
    setSelectedPlace(null);
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜尋餐廳或直接點擊地圖..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 shadow-sm transition-all"
        />
      </div>

      {/* Map Display */}
      <div className="flex-1 min-h-[400px] rounded-3xl overflow-hidden border border-slate-200 shadow-inner relative">
        <Map
          defaultCenter={{ lat: 25.033, lng: 121.5654 }}
          defaultZoom={15}
          gestureHandling={"greedy"}
          onClick={handleMapClick}
          mapId="DICEAT_MAP_ID"
          disableDefaultUI={true}
          className="w-full h-full"
        >
          {selectedPlace && (
            <AdvancedMarker
              position={{
                lat: selectedPlace.geometry?.location?.lat() || 0,
                lng: selectedPlace.geometry?.location?.lng() || 0,
              }}
            >
              <Pin
                background={"#b91c1c"}
                glyphColor={"#ffffff"}
                borderColor={"#7f1d1d"}
              />
            </AdvancedMarker>
          )}
        </Map>

        {/* Selected Info Overlay */}
        <AnimatePresence>
          {selectedPlace && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-red-50 z-20 overflow-hidden"
            >
              <div className="flex gap-0">
                {/* Photo */}
                {selectedPlace.photos?.[0] && (
                  <div className="shrink-0 w-28 lg:w-36">
                    <img
                      src={selectedPlace.photos[0].getUrl({ maxWidth: 300 })}
                      alt={selectedPlace.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0 p-4 lg:p-5 flex flex-col gap-2">
                  <h3 className="text-base lg:text-lg font-bold text-slate-900 leading-tight">
                    {selectedPlace.name}
                  </h3>

                  {/* Rating + count + price */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 text-orange-500 font-bold text-xs lg:text-sm">
                      <Star size={13} className="fill-orange-500" />
                      {selectedPlace.rating ?? "N/A"}
                    </div>
                    {selectedPlace.user_ratings_total != null && (
                      <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                        <Users size={10} />
                        {selectedPlace.user_ratings_total.toLocaleString()} 則評論
                      </span>
                    )}
                    {selectedPlace.price_level != null && (
                      <span className="text-slate-500 text-xs font-bold">
                        {"$".repeat(selectedPlace.price_level)}
                      </span>
                    )}
                  </div>

                  {/* Opening hours */}
                  {selectedPlace.opening_hours && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${selectedPlace.opening_hours.isOpen?.() ? "text-emerald-600" : "text-red-500"}`}>
                      <Clock size={11} />
                      {selectedPlace.opening_hours.isOpen?.() ? "營業中" : "已打烊"}
                    </div>
                  )}

                  {/* Address */}
                  <div className="flex items-start gap-1 text-slate-400 text-[10px] lg:text-xs leading-relaxed">
                    <MapPin size={11} className="shrink-0 mt-0.5" />
                    <span>{selectedPlace.formatted_address}</span>
                  </div>

                  {/* Add button */}
                  <button
                    onClick={handleAdd}
                    className="mt-1 self-start bg-red-700 text-white px-4 py-2 rounded-xl hover:bg-red-800 transition-colors shadow-sm shadow-red-100 flex items-center gap-1.5 text-sm font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    加入清單
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
