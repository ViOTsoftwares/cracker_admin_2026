"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Package, X } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { GetNotificationsApi, MarkAsReadApi } from "@/Api/notification";
import { toastMessage } from "@/lib/toast.message";

export default function NotificationMenu() {
  const [open, setOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useRouter();
  const socketRef = useRef<Socket | null>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      const res = await GetNotificationsApi(20);
      if (res.success) {
        setNotifications(res.result);
        setUnreadCount(res.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  // Socket connection
  useEffect(() => {
    fetchNotifications();

    // Default to the same host if env isn't provided or fallback to a standard pattern
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/admin", "") || "http://localhost:5000";
    
    const socket = io(socketUrl, {
      withCredentials: true,
    });
    
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_admin");
    });

    socket.on("new_order", (data) => {
      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toastMessage(data.notification.title || "New order received!", "success");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleMarkAsRead = async (id: string, orderId?: string) => {
    try {
      const res = await MarkAsReadApi(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      
      if (orderId) {
        setOpen(false);
        navigate.push(`/orders?search=${orderId}`); // Or however your orders page handles filtering
      }
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 focus:outline-hidden cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-in zoom-in">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`flex items-start gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      !notification.isRead ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""
                    }`}
                  >
                    <div className="shrink-0 mt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.type === 'new_order' 
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {notification.type === 'new_order' ? <Package className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium text-slate-900 dark:text-slate-100 ${!notification.isRead ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {!notification.isRead && (
                      <div className="shrink-0">
                        <button
                          onClick={() => handleMarkAsRead(notification._id, notification.data?.orderId)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors cursor-pointer"
                          title="Mark as read & view"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
