import { MapPin, ShoppingBag, Star, Utensils } from "lucide-react";

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    address: string | null;
    rating: number | null;
    photo_url: string | null;
  };
  onCreateOrder?: (restaurantId: string, restaurantName: string) => void;
}

export default function RestaurantCard({ restaurant, onCreateOrder }: RestaurantCardProps) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-red-50 hover:-translate-y-1 transition-all group">
      {/* Photo */}
      <div className="h-40 bg-slate-100 relative overflow-hidden">
        {restaurant.photo_url ? (
          <img
            src={restaurant.photo_url}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-red-50">
            <Utensils size={32} className="text-red-200" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-black text-slate-800 text-base mb-2 leading-tight">
          {restaurant.name}
        </h3>

        {restaurant.rating != null && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-slate-500">
              {restaurant.rating.toFixed(1)}
            </span>
          </div>
        )}

        {restaurant.address && (
          <div className="flex items-start gap-1.5 text-[11px] text-slate-400 font-medium">
            <MapPin size={11} className="mt-0.5 shrink-0 text-red-400" />
            <span className="line-clamp-2">{restaurant.address}</span>
          </div>
        )}

        {onCreateOrder && (
          <button
            onClick={() => onCreateOrder(restaurant.id, restaurant.name)}
            className="mt-4 w-full flex items-center justify-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2 rounded-xl transition-colors"
          >
            <ShoppingBag size={13} />
            揪團點餐
          </button>
        )}
      </div>
    </div>
  );
}
