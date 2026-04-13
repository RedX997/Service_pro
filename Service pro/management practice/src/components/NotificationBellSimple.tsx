import React from 'react';
import { Bell } from 'lucide-react';

export function NotificationBellSimple() {
  console.log('🔔 NotificationBellSimple: Rendering!');
  
  return (
    <button 
      onClick={() => {
        console.log('🔔 Bell clicked!');
        alert('Bell clicked! Notification system is working.');
      }}
      className="relative p-2 hover:bg-gray-100 rounded-lg"
      style={{ border: '2px solid red' }}
    >
      <Bell className="h-5 w-5" />
      <span 
        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
      >
        3
      </span>
    </button>
  );
}
