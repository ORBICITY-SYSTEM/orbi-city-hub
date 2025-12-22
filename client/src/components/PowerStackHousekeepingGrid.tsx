/**
 * PowerStack Housekeeping Grid
 * 
 * Visual grid of 60 apartments with Clean/Dirty/Occupied status toggle.
 * Matches the Ocean Theme design system.
 * 
 * @connect Telegram Bot Webhook for staff alerts
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Wrench, 
  Bell, 
  RefreshCw,
  Filter,
  LayoutGrid,
  Send
} from "lucide-react";

// Room status types
type RoomStatus = 'clean' | 'dirty' | 'occupied' | 'maintenance';

interface Room {
  id: string;
  number: string;
  floor: number;
  status: RoomStatus;
  lastUpdated: string;
}

// Generate 60 apartments with realistic initial states
const generateInitialRooms = (): Room[] => {
  const rooms: Room[] = [];
  const floors = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  
  // Distribution: 34 Clean, 10 Dirty, 14 Occupied, 2 Maintenance
  const statusDistribution: RoomStatus[] = [
    ...Array(34).fill('clean'),
    ...Array(10).fill('dirty'),
    ...Array(14).fill('occupied'),
    ...Array(2).fill('maintenance'),
  ];
  
  // Shuffle the distribution
  for (let i = statusDistribution.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [statusDistribution[i], statusDistribution[j]] = [statusDistribution[j], statusDistribution[i]];
  }
  
  let roomIndex = 0;
  for (const floor of floors) {
    // Each floor has 3-4 apartments
    const apartmentsPerFloor = floor <= 10 ? 4 : 3;
    for (let apt = 1; apt <= apartmentsPerFloor && roomIndex < 60; apt++) {
      const roomNumber = `${floor}0${apt}`;
      rooms.push({
        id: `room-${roomNumber}`,
        number: roomNumber,
        floor,
        status: statusDistribution[roomIndex] || 'clean',
        lastUpdated: new Date().toISOString(),
      });
      roomIndex++;
    }
  }
  
  return rooms;
};

// Status configuration
const STATUS_CONFIG = {
  clean: {
    color: 'bg-green-500',
    borderColor: 'border-green-500/50',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    icon: CheckCircle2,
    label: { en: 'Clean', ka: 'სუფთა' },
  },
  dirty: {
    color: 'bg-red-500',
    borderColor: 'border-red-500/50',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    icon: XCircle,
    label: { en: 'Dirty', ka: 'ბინძური' },
  },
  occupied: {
    color: 'bg-blue-500',
    borderColor: 'border-blue-500/50',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    icon: User,
    label: { en: 'Occupied', ka: 'დაკავებული' },
  },
  maintenance: {
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-500/50',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    icon: Wrench,
    label: { en: 'Maintenance', ka: 'ტექნიკური' },
  },
};

// Telegram webhook URL (to be configured)
const TELEGRAM_WEBHOOK_URL = import.meta.env.VITE_TELEGRAM_WEBHOOK_URL || '';

interface PowerStackHousekeepingGridProps {
  className?: string;
}

export const PowerStackHousekeepingGrid = ({ className }: PowerStackHousekeepingGridProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const [rooms, setRooms] = useState<Room[]>(generateInitialRooms);
  const [filter, setFilter] = useState<RoomStatus | 'all'>('all');
  const [isAlertingSending, setIsAlertingSending] = useState(false);

  // Toggle room status (Clean <-> Dirty)
  const toggleRoomStatus = useCallback((roomId: string) => {
    setRooms(prevRooms => 
      prevRooms.map(room => {
        if (room.id === roomId) {
          // Only toggle between clean and dirty
          const newStatus: RoomStatus = room.status === 'clean' ? 'dirty' : 
                                         room.status === 'dirty' ? 'clean' : 
                                         room.status;
          
          if (newStatus !== room.status) {
            toast({
              title: newStatus === 'clean' 
                ? `✅ ${t('ოთახი', 'Room')} ${room.number} - ${t('სუფთა', 'Clean')}`
                : `🔴 ${t('ოთახი', 'Room')} ${room.number} - ${t('ბინძური', 'Dirty')}`,
              description: t('სტატუსი განახლდა', 'Status updated'),
            });
          }
          
          return { ...room, status: newStatus, lastUpdated: new Date().toISOString() };
        }
        return room;
      })
    );
  }, [t, toast]);

  // Send alert to Telegram
  const sendTelegramAlert = async () => {
    const dirtyRooms = rooms.filter(r => r.status === 'dirty');
    
    if (dirtyRooms.length === 0) {
      toast({
        title: t('ყველა ოთახი სუფთაა!', 'All rooms are clean!'),
        description: t('არ არის გასაწმენდი ოთახები', 'No rooms need cleaning'),
      });
      return;
    }

    setIsAlertingSending(true);

    try {
      const message = `🧹 *HOUSEKEEPING ALERT*\n\n` +
        `📍 ${dirtyRooms.length} ${t('ოთახი საჭიროებს დასუფთავებას', 'rooms need cleaning')}:\n\n` +
        dirtyRooms.map(r => `• Room ${r.number} (Floor ${r.floor})`).join('\n') +
        `\n\n⏰ ${new Date().toLocaleTimeString()}`;

      // CONNECT: Telegram Bot Webhook
      if (TELEGRAM_WEBHOOK_URL) {
        await fetch(TELEGRAM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: import.meta.env.VITE_TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown',
          }),
        });
      }

      toast({
        title: '📱 ' + t('შეტყობინება გაიგზავნა!', 'Alert sent!'),
        description: t(
          `${dirtyRooms.length} ოთახის შესახებ შეტყობინება გაიგზავნა Telegram-ზე`,
          `Alert about ${dirtyRooms.length} rooms sent to Telegram`
        ),
      });
    } catch (error) {
      console.error('Telegram alert error:', error);
      toast({
        title: t('შეცდომა', 'Error'),
        description: t('ვერ გაიგზავნა შეტყობინება', 'Failed to send alert'),
        variant: 'destructive',
      });
    } finally {
      setIsAlertingSending(false);
    }
  };

  // Mark all dirty as clean
  const markAllClean = () => {
    setRooms(prevRooms => 
      prevRooms.map(room => ({
        ...room,
        status: room.status === 'dirty' ? 'clean' : room.status,
        lastUpdated: room.status === 'dirty' ? new Date().toISOString() : room.lastUpdated,
      }))
    );
    toast({
      title: '✨ ' + t('ყველა დასუფთავდა!', 'All cleaned!'),
      description: t('ყველა ბინძური ოთახი მონიშნულია როგორც სუფთა', 'All dirty rooms marked as clean'),
    });
  };

  // Get filtered rooms
  const filteredRooms = filter === 'all' ? rooms : rooms.filter(r => r.status === filter);

  // Count by status
  const statusCounts = {
    clean: rooms.filter(r => r.status === 'clean').length,
    dirty: rooms.filter(r => r.status === 'dirty').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  return (
    <Card className={`glass-card border-0 ${className}`}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-white">
                {t('ოთახების გრიდი', 'Room Grid')}
              </CardTitle>
              <CardDescription className="text-white/60">
                {t('60 აპარტამენტის სტატუსი', '60 apartments status')}
              </CardDescription>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllClean}
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {t('ყველა სუფთა', 'Mark All Clean')}
            </Button>
            <Button
              size="sm"
              onClick={sendTelegramAlert}
              disabled={isAlertingSending}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Bell className={`w-4 h-4 mr-2 ${isAlertingSending ? 'animate-pulse' : ''}`} />
              {t('🔔 Telegram შეტყობინება', '🔔 Alert Staff on Telegram')}
            </Button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {(Object.keys(STATUS_CONFIG) as RoomStatus[]).map(status => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            const isActive = filter === status;
            
            return (
              <button
                key={status}
                onClick={() => setFilter(filter === status ? 'all' : status)}
                className={`p-3 rounded-lg border transition-all ${
                  isActive 
                    ? `${config.bgColor} ${config.borderColor}` 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${config.textColor}`} />
                    <span className={`text-sm ${isActive ? config.textColor : 'text-white/70'}`}>
                      {language === 'ka' ? config.label.ka : config.label.en}
                    </span>
                  </div>
                  <Badge className={`${config.bgColor} ${config.textColor} border-0`}>
                    {statusCounts[status]}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        {/* Room Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {filteredRooms.map(room => {
            const config = STATUS_CONFIG[room.status];
            const Icon = config.icon;
            const canToggle = room.status === 'clean' || room.status === 'dirty';
            
            return (
              <button
                key={room.id}
                onClick={() => canToggle && toggleRoomStatus(room.id)}
                disabled={!canToggle}
                className={`
                  aspect-square rounded-lg border-2 transition-all duration-200
                  flex flex-col items-center justify-center gap-1
                  ${config.bgColor} ${config.borderColor}
                  ${canToggle 
                    ? 'cursor-pointer hover:scale-105 hover:shadow-lg active:scale-95' 
                    : 'cursor-not-allowed opacity-70'
                  }
                `}
                title={`Room ${room.number} - ${language === 'ka' ? config.label.ka : config.label.en}`}
              >
                <Icon className={`w-4 h-4 ${config.textColor}`} />
                <span className={`text-xs font-bold ${config.textColor}`}>
                  {room.number}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="text-white/60">{t('ლეგენდა:', 'Legend:')}</span>
            {(Object.keys(STATUS_CONFIG) as RoomStatus[]).map(status => {
              const config = STATUS_CONFIG[status];
              const Icon = config.icon;
              return (
                <div key={status} className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded ${config.color}`} />
                  <Icon className={`w-3 h-3 ${config.textColor}`} />
                  <span className="text-white/70">
                    {language === 'ka' ? config.label.ka : config.label.en}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-center text-white/40 text-xs mt-2">
            💡 {t(
              'დააკლიკეთ სუფთა/ბინძურ ოთახზე სტატუსის შესაცვლელად',
              'Click on Clean/Dirty rooms to toggle status'
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PowerStackHousekeepingGrid;
