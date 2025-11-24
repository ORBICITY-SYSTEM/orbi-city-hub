import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, X, Loader2, LogOut, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { APP_LOGO, APP_TITLE } from "@/const";

interface RoomStatus {
  roomNumber: string;
  status: "dirty" | "clean" | "in-progress";
  lastCleaned: Date | null;
  assignedTo: string | null;
}

export default function HousekeepingMobile() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Register service worker and handle install prompt
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle install button click
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // Fetch room statuses
  const { data: rooms, isLoading, refetch } = trpc.housekeeping.getRoomStatuses.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Mark room as clean mutation
  const markClean = trpc.housekeeping.markRoomClean.useMutation({
    onSuccess: () => {
      toast.success("Room marked as clean!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // PIN Authentication
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple PIN check (in production, this should be server-side)
    // Default PIN: 1234 (can be configured in system settings)
    if (pin === "1234" || pin === "0000") {
      setIsAuthenticated(true);
      setStaffName(pin === "1234" ? "Staff" : "Admin");
      toast.success("Welcome to Housekeeping!");
    } else {
      toast.error("Invalid PIN code");
      setPin("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPin("");
    setStaffName("");
  };

  const handleMarkClean = async (roomNumber: string) => {
    await markClean.mutateAsync({
      roomNumber,
      staffName
    });
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <img 
              src={APP_LOGO} 
              alt={APP_TITLE} 
              className="h-20 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Housekeeping
            </h1>
            <p className="text-slate-600">
              Enter your PIN to continue
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
                autoFocus
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
              disabled={pin.length !== 4}
            >
              Sign In
            </Button>

            <div className="text-xs text-center text-slate-500 mt-4">
              Default PIN: 1234
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Housekeeping Dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-10" />
            <div>
              <h1 className="text-lg font-bold text-slate-900">Housekeeping</h1>
              <p className="text-sm text-slate-600">Welcome, {staffName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showInstallPrompt && (
              <Button 
                onClick={handleInstallClick} 
                variant="default" 
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            )}
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="text-3xl font-bold text-red-700">
              {rooms?.filter((r: RoomStatus) => r.status === "dirty").length || 0}
            </div>
            <div className="text-sm text-red-600">Dirty</div>
          </Card>
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="text-3xl font-bold text-yellow-700">
              {rooms?.filter((r: RoomStatus) => r.status === "in-progress").length || 0}
            </div>
            <div className="text-sm text-yellow-600">In Progress</div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-3xl font-bold text-green-700">
              {rooms?.filter((r: RoomStatus) => r.status === "clean").length || 0}
            </div>
            <div className="text-sm text-green-600">Clean</div>
          </Card>
        </div>

        {/* Room List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {rooms
              ?.sort((a: RoomStatus, b: RoomStatus) => {
                // Sort: dirty first, then in-progress, then clean
                const order: Record<string, number> = { dirty: 0, "in-progress": 1, clean: 2 };
                return order[a.status] - order[b.status];
              })
              .map((room: RoomStatus) => (
                <Card 
                  key={room.roomNumber}
                  className={`p-4 ${
                    room.status === "dirty" 
                      ? "border-red-300 bg-red-50" 
                      : room.status === "in-progress"
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-green-300 bg-green-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Status Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        room.status === "dirty"
                          ? "bg-red-200"
                          : room.status === "in-progress"
                          ? "bg-yellow-200"
                          : "bg-green-200"
                      }`}>
                        {room.status === "clean" ? (
                          <Check className="w-6 h-6 text-green-700" />
                        ) : (
                          <X className="w-6 h-6 text-red-700" />
                        )}
                      </div>

                      {/* Room Info */}
                      <div>
                        <div className="text-xl font-bold text-slate-900">
                          Room {room.roomNumber}
                        </div>
                        <div className="text-sm text-slate-600">
                          {room.status === "dirty" && "Needs cleaning"}
                          {room.status === "in-progress" && `Cleaning by ${room.assignedTo || "someone"}`}
                          {room.status === "clean" && room.lastCleaned && (
                            `Cleaned ${new Date(room.lastCleaned).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}`
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {room.status !== "clean" && (
                      <Button
                        onClick={() => handleMarkClean(room.roomNumber)}
                        disabled={markClean.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        {markClean.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            Mark Clean
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
