'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { customerApi } from '@/lib/api';

const FavouritesContext = createContext();

export function FavouritesProvider({ children }) {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ruchi_customer_favourites');
      if (saved) {
        setFavourites(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load favourites from storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever favourites changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('ruchi_customer_favourites', JSON.stringify(favourites));
      } catch (e) {
        console.error('Failed to save favourites to storage:', e);
      }
    }
  }, [favourites, isLoaded]);

  // Sync with backend if user is logged in
  useEffect(() => {
    if (user) {
      customerApi
        .getFavourites()
        .then((res) => {
          if (res.favourites && Array.isArray(res.favourites)) {
            // Merge backend favourites if any
            setFavourites((prev) => {
              const prevIds = new Set(prev.map((i) => i.id));
              const newItems = [...prev];
              for (const backendFav of res.favourites) {
                if (!prevIds.has(backendFav.id) && !prevIds.has(backendFav.cook_id)) {
                  newItems.push({
                    id: backendFav.cook_id || backendFav.id,
                    food_name: backendFav.business_name || backendFav.cook_name,
                    partner_name: backendFav.cook_name,
                    price: 150,
                    rating: backendFav.rating || 4.9,
                    image_url:
                      backendFav.avatar ||
                      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
                    is_cook: true,
                    cook_id: backendFav.cook_id,
                  });
                }
              }
              return newItems;
            });
          }
        })
        .catch(() => {
          // Gracefully fall back to local storage cache for guest or expiring sessions
        });
    }
  }, [user]);

  const isFavourite = (itemId) => {
    if (!itemId) return false;
    return favourites.some((item) => String(item.id) === String(itemId));
  };

  const toggleFavourite = async (item) => {
    if (!item || !item.id) return { isFav: false };

    const exists = isFavourite(item.id);
    let updated;

    if (exists) {
      updated = favourites.filter((i) => String(i.id) !== String(item.id));
      setFavourites(updated);
    } else {
      const favItem = {
        id: item.id,
        food_name: item.food_name || item.name || 'Special Meal',
        partner_name: item.partner_name || item.cook_name || 'Home Chef',
        price: item.price || 149,
        serving_size: item.serving_size || 'Plate',
        rating: item.rating || 4.9,
        dietary_type: item.dietary_type || item.dietary || 'VEG',
        image_url:
          item.image_url ||
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        cook_id: item.cook_id || item.cookId || null,
        added_at: new Date().toISOString(),
      };
      updated = [favItem, ...favourites];
      setFavourites(updated);
    }

    // If item has a cook_id and user is logged in, sync with backend
    const targetCookId = item.cook_id || item.cookId;
    if (user && targetCookId) {
      try {
        await customerApi.toggleFavourite(targetCookId);
      } catch (err) {
        console.warn('Could not sync favourite cook to server:', err);
      }
    }

    return { isFav: !exists };
  };

  const removeFavourite = (itemId) => {
    setFavourites((prev) => prev.filter((i) => String(i.id) !== String(itemId)));
  };

  const clearFavourites = () => {
    setFavourites([]);
  };

  return (
    <FavouritesContext.Provider
      value={{
        favourites,
        favouriteCount: favourites.length,
        isFavourite,
        toggleFavourite,
        removeFavourite,
        clearFavourites,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}

export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
};
