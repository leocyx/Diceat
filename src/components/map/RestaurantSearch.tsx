"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Map,
  AdvancedMarker,
  Pin,
  useApiIsLoaded,
  useMapsLibrary,
  useMap,
} from "@vis.gl/react-google-maps";
import { Search, Plus, Star } from "lucide-react";

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
        "photos",
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
      if (!map || !placesLibrary || !ev.detail.placeId) return;

      // Prevent Google's default info window
      ev.stop();

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
            "photos",
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
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
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
          disableDefaultUI={false}
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
                background={"#4f46e5"}
                glyphColor={"#ffffff"}
                borderColor={"#3730a3"}
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
              className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 lg:p-5 rounded-2xl shadow-2xl border border-indigo-50 z-20"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base lg:text-lg font-bold text-slate-900 leading-tight truncate">
                    {selectedPlace.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-shrink-0 flex items-center gap-1 text-orange-500 font-bold text-xs lg:text-sm">
                      <Star size={14} className="fill-orange-500" />
                      {selectedPlace.rating || "N/A"}
                    </div>
                    <span className="text-slate-400 text-[10px] lg:text-xs truncate">
                      {selectedPlace.formatted_address}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleAdd}
                  className="flex-shrink-0 bg-indigo-600 text-white px-4 py-2.5 lg:p-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
                  <span className="text-sm font-bold">加入</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Ensure framer-motion is correctly imported for internal use
import { motion, AnimatePresence } from "framer-motion";
