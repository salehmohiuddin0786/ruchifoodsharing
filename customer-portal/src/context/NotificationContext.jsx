'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { playNotificationSound, unlockAudio } from '@/lib/soundAlerts';

const NotificationContext = createContext();

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:7001';

export function NotificationProvider({ children }) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [inAppToast, setInAppToast] = useState(null);

  // User notification & sound preferences
  const [preferences, setPreferences] = useState({
    pushEnabled: true,
    soundEnabled: true,
    soundVolume: 0.8,
    newDishEnabled: true,
    preorderEnabled: true,
    freeFoodEnabled: true,
  });

  const socketRef = useRef(null);

  // Unlock audio on first user tap/click
  const handleUserInteraction = useCallback(() => {
    unlockAudio();
    setAudioUnlocked(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('click', handleUserInteraction, { once: true });
      window.addEventListener('touchstart', handleUserInteraction, { once: true });
      return () => {
        window.removeEventListener('click', handleUserInteraction);
        window.removeEventListener('touchstart', handleUserInteraction);
      };
    }
  }, [handleUserInteraction]);

  // Load preferences from backend or localStorage
  const loadPreferences = useCallback(async () => {
    try {
      const token = localStorage.getItem('ruchi_customer_token');
      if (token) {
        const res = await fetch(`${API_BASE}/notifications/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.preferences) {
            setPreferences(data.preferences);
            localStorage.setItem('ruchi_sound_preferences', JSON.stringify(data.preferences));
            return;
          }
        }
      }

      // Local fallback
      const cached = localStorage.getItem('ruchi_sound_preferences');
      if (cached) {
        setPreferences(JSON.parse(cached));
      }
    } catch (_) {}
  }, []);

  // Update preferences
  const updatePreferences = async (newPrefs) => {
    const merged = { ...preferences, ...newPrefs };
    setPreferences(merged);
    localStorage.setItem('ruchi_sound_preferences', JSON.stringify(merged));

    try {
      const token = localStorage.getItem('ruchi_customer_token');
      if (token) {
        await fetch(`${API_BASE}/notifications/preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(merged),
        });
      }
    } catch (e) {
      console.warn('Failed to sync preferences to server:', e);
    }
  };

  // Fetch unread count & initial recent notifications
  const refreshNotifications = useCallback(async () => {
    const token = localStorage.getItem('ruchi_customer_token');
    if (!token) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    try {
      const [countRes, listRes] = await Promise.allSettled([
        fetch(`${API_BASE}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/notifications?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (countRes.status === 'fulfilled' && countRes.value.ok) {
        const cData = await countRes.value.json();
        setUnreadCount(cData.unreadCount || 0);
      }

      if (listRes.status === 'fulfilled' && listRes.value.ok) {
        const lData = await listRes.value.json();
        setNotifications(lData.notifications || []);
      }
    } catch (err) {
      console.warn('Notification fetch warning:', err);
    }
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    loadPreferences();
    refreshNotifications();

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (user?.id) {
        socket.emit('join_user', user.id);
      }
    });

    const handleIncomingNotification = (notif) => {
      // 1. Play sound alert if enabled in user preferences
      const soundType =
        notif.soundType ||
        (notif.type === 'NEW_DISH'
          ? 'DISH_CHIME'
          : notif.type === 'NEW_PREORDER'
          ? 'PREORDER_BELL'
          : notif.type === 'FREE_FOOD'
          ? 'FREE_FOOD_CHORD'
          : 'DEFAULT_ALERT');

      if (preferences.soundEnabled) {
        playNotificationSound(soundType, preferences.soundVolume);
      }

      // 2. Increment unread counter
      setUnreadCount((prev) => prev + 1);

      // 3. Prepend to dropdown list
      setNotifications((prev) => [
        {
          id: notif.id || `live_${Date.now()}`,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          imageUrl: notif.imageUrl,
          targetUrl: notif.targetUrl,
          isRead: false,
          createdAt: notif.createdAt || new Date().toISOString(),
        },
        ...prev.slice(0, 19),
      ]);

      // 4. In-App Floating Toast Alert
      setInAppToast({
        title: notif.title,
        message: notif.message,
        type: notif.type,
        imageUrl: notif.imageUrl,
        targetUrl: notif.targetUrl,
      });

      setTimeout(() => {
        setInAppToast(null);
      }, 5000);

      // 5. Browser Push Notification if supported and permitted
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted' &&
        document.visibilityState !== 'visible'
      ) {
        try {
          new Notification(notif.title, {
            body: notif.message,
            icon: notif.imageUrl || '/ruchi-logo.png',
            tag: notif.type,
          });
        } catch (_) {}
      }
    };

    socket.on('new_notification', handleIncomingNotification);
    socket.on('user_notification', handleIncomingNotification);

    socket.on('unread_count_updated', ({ unreadCount: count }) => {
      if (typeof count === 'number') {
        setUnreadCount(count);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, preferences.soundEnabled, preferences.soundVolume, loadPreferences, refreshNotifications]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const token = localStorage.getItem('ruchi_customer_token');
      if (token) {
        await fetch(`${API_BASE}/notifications/${id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (_) {}
  };

  // Mark all as read
  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      const token = localStorage.getItem('ruchi_customer_token');
      if (token) {
        await fetch(`${API_BASE}/notifications/mark-all-read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (_) {}
  };

  // Delete notification
  const deleteNotification = async (id) => {
    const target = notifications.find((n) => n.id === id);
    if (target && !target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      const token = localStorage.getItem('ruchi_customer_token');
      if (token) {
        await fetch(`${API_BASE}/notifications/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (_) {}
  };

  // Clear all notifications
  const clearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);

    try {
      const token = localStorage.getItem('ruchi_customer_token');
      if (token) {
        await fetch(`${API_BASE}/notifications/clear-all`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (_) {}
  };

  // One-time Setup for Notifications & Sound
  const enableSoundAndNotifications = async () => {
    unlockAudio();
    setAudioUnlocked(true);

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          updatePreferences({ pushEnabled: true, soundEnabled: true });
        }
      } else {
        updatePreferences({ pushEnabled: true, soundEnabled: true });
      }
    } else {
      updatePreferences({ soundEnabled: true });
    }

    // Play test chime to verify audio works immediately
    playNotificationSound('DISH_CHIME', preferences.soundVolume);
  };

  // Test sound function for Settings page
  const playTestSound = (soundType) => {
    unlockAudio();
    playNotificationSound(soundType, preferences.soundVolume);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        preferences,
        updatePreferences,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refreshNotifications,
        playTestSound,
        enableSoundAndNotifications,
        audioUnlocked,
        inAppToast,
        setInAppToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
