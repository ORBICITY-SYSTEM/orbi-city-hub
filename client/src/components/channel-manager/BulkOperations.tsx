/**
 * Bulk Operations Component
 * Mass update prices, availability, and restrictions across OTA channels
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Layers,
  Calendar,
  DollarSign,
  Ban,
  RefreshCw,
  Check,
  AlertTriangle,
  Clock,
  Percent,
  ArrowUpDown,
  CalendarRange,
  Building,
} from "lucide-react";
import { toast } from "sonner";

interface RoomTypeSelection {
  id: string;
  name: string;
  nameKa: string;
  selected: boolean;
}

interface OperationLog {
  id: string;
  operation: string;
  roomTypes: string[];
  dateRange: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  timestamp: string;
}

const ROOM_TYPES: RoomTypeSelection[] = [
  { id: "suite-sea", name: "Suite with Sea view", nameKa: "სუიტა ზღვის ხედით", selected: false },
  { id: "deluxe-sea", name: "Delux suite with sea view", nameKa: "დელუქს სუიტა ზღვის ხედით", selected: false },
  { id: "superior-sea", name: "Superior Suite with Sea View", nameKa: "სუპერიორ სუიტა ზღვის ხედით", selected: false },
  { id: "family", name: "Interconnected Family Room", nameKa: "ოჯახის ინტერკონექტ ოთახი", selected: false },
];

const OTA_CHANNELS = [
  { id: "booking", name: "Booking.com", color: "bg-blue-500" },
  { id: "airbnb", name: "Airbnb", color: "bg-pink-500" },
  { id: "expedia", name: "Expedia", color: "bg-yellow-500" },
  { id: "agoda", name: "Agoda", color: "bg-red-500" },
];

export function BulkOperations() {
  const { language } = useLanguage();
  const [roomTypes, setRoomTypes] = useState(ROOM_TYPES);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(OTA_CHANNELS.map(c => c.id));
  const [operationType, setOperationType] = useState<"price" | "availability" | "restriction">("price");

  // Date range
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Price settings
  const [priceType, setPriceType] = useState<"fixed" | "percent">("percent");
  const [priceValue, setPriceValue] = useState("10");
  const [priceDirection, setPriceDirection] = useState<"increase" | "decrease">("increase");

  // Availability settings
  const [availabilityAction, setAvailabilityAction] = useState<"open" | "close">("close");
  const [availabilityCount, setAvailabilityCount] = useState("0");

  // Restriction settings
  const [minStay, setMinStay] = useState("2");
  const [closedToArrival, setClosedToArrival] = useState(false);
  const [closedToDeparture, setClosedToDeparture] = useState(false);

  // Operation log
  const [operations, setOperations] = useState<OperationLog[]>([
    {
      id: "1",
      operation: "Price Increase +15%",
      roomTypes: ["Suite Sea View", "Deluxe Suite"],
      dateRange: "2025-01-25 - 2025-02-28",
      status: "completed",
      progress: 100,
      timestamp: "Today, 10:30",
    },
    {
      id: "2",
      operation: "Close Availability",
      roomTypes: ["All Rooms"],
      dateRange: "2025-06-15 - 2025-06-20",
      status: "completed",
      progress: 100,
      timestamp: "Yesterday, 15:45",
    },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  const toggleRoomType = (id: string) => {
    setRoomTypes(prev =>
      prev.map(rt => (rt.id === id ? { ...rt, selected: !rt.selected } : rt))
    );
  };

  const toggleChannel = (id: string) => {
    setSelectedChannels(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectAllRooms = () => {
    setRoomTypes(prev => prev.map(rt => ({ ...rt, selected: true })));
  };

  const deselectAllRooms = () => {
    setRoomTypes(prev => prev.map(rt => ({ ...rt, selected: false })));
  };

  const handleApplyBulkOperation = async () => {
    const selectedRooms = roomTypes.filter(rt => rt.selected);

    if (selectedRooms.length === 0) {
      toast.error(
        language === "ka"
          ? "აირჩიეთ მინიმუმ ერთი ოთახის ტიპი"
          : "Select at least one room type"
      );
      return;
    }

    if (selectedChannels.length === 0) {
      toast.error(
        language === "ka"
          ? "აირჩიეთ მინიმუმ ერთი OTA არხი"
          : "Select at least one OTA channel"
      );
      return;
    }

    setIsProcessing(true);
    setCurrentProgress(0);

    // Simulate progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setCurrentProgress(i);
    }

    // Add to operation log
    const operationName =
      operationType === "price"
        ? `${language === "ka" ? "ფასი" : "Price"} ${priceDirection === "increase" ? "+" : "-"}${priceValue}${priceType === "percent" ? "%" : "₾"}`
        : operationType === "availability"
        ? availabilityAction === "close"
          ? language === "ka" ? "დახურვა" : "Close"
          : language === "ka" ? "გახსნა" : "Open"
        : `${language === "ka" ? "შეზღუდვები" : "Restrictions"}: Min ${minStay}${language === "ka" ? " ღამე" : " nights"}`;

    setOperations(prev => [
      {
        id: Date.now().toString(),
        operation: operationName,
        roomTypes: selectedRooms.map(r => language === "ka" ? r.nameKa : r.name),
        dateRange: `${startDate} - ${endDate}`,
        status: "completed",
        progress: 100,
        timestamp: language === "ka" ? "ახლა" : "Just now",
      },
      ...prev,
    ]);

    setIsProcessing(false);
    setCurrentProgress(0);

    toast.success(
      language === "ka"
        ? "ოპერაცია წარმატებით დასრულდა!"
        : "Bulk operation completed successfully!"
    );

    // Reset selections
    deselectAllRooms();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white">
          {language === "ka" ? "მასიური ოპერაციები" : "Bulk Operations"}
        </h2>
        <p className="text-sm text-slate-400">
          {language === "ka"
            ? "შეცვალეთ ფასები და ხელმისაწვდომობა მრავალ ოთახზე ერთდროულად"
            : "Update prices and availability across multiple rooms at once"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Operation Type */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                {language === "ka" ? "ოპერაციის ტიპი" : "Operation Type"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={operationType === "price" ? "default" : "outline"}
                  className={operationType === "price" ? "bg-emerald-600" : "border-slate-600"}
                  onClick={() => setOperationType("price")}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  {language === "ka" ? "ფასი" : "Price"}
                </Button>
                <Button
                  variant={operationType === "availability" ? "default" : "outline"}
                  className={operationType === "availability" ? "bg-blue-600" : "border-slate-600"}
                  onClick={() => setOperationType("availability")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {language === "ka" ? "ხელმისაწვდომობა" : "Availability"}
                </Button>
                <Button
                  variant={operationType === "restriction" ? "default" : "outline"}
                  className={operationType === "restriction" ? "bg-orange-600" : "border-slate-600"}
                  onClick={() => setOperationType("restriction")}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  {language === "ka" ? "შეზღუდვები" : "Restrictions"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-blue-400" />
                {language === "ka" ? "თარიღების დიაპაზონი" : "Date Range"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400 text-sm">
                    {language === "ka" ? "დაწყება" : "Start Date"}
                  </Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">
                    {language === "ka" ? "დასრულება" : "End Date"}
                  </Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operation Settings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">
                {operationType === "price"
                  ? language === "ka" ? "ფასის პარამეტრები" : "Price Settings"
                  : operationType === "availability"
                  ? language === "ka" ? "ხელმისაწვდომობის პარამეტრები" : "Availability Settings"
                  : language === "ka" ? "შეზღუდვების პარამეტრები" : "Restriction Settings"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {operationType === "price" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-400 text-sm">
                        {language === "ka" ? "ტიპი" : "Type"}
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          size="sm"
                          variant={priceType === "percent" ? "default" : "outline"}
                          className={priceType === "percent" ? "bg-purple-600" : "border-slate-600"}
                          onClick={() => setPriceType("percent")}
                        >
                          <Percent className="w-4 h-4 mr-1" />
                          %
                        </Button>
                        <Button
                          size="sm"
                          variant={priceType === "fixed" ? "default" : "outline"}
                          className={priceType === "fixed" ? "bg-purple-600" : "border-slate-600"}
                          onClick={() => setPriceType("fixed")}
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          ₾
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-sm">
                        {language === "ka" ? "მიმართულება" : "Direction"}
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          size="sm"
                          variant={priceDirection === "increase" ? "default" : "outline"}
                          className={priceDirection === "increase" ? "bg-emerald-600" : "border-slate-600"}
                          onClick={() => setPriceDirection("increase")}
                        >
                          +
                        </Button>
                        <Button
                          size="sm"
                          variant={priceDirection === "decrease" ? "default" : "outline"}
                          className={priceDirection === "decrease" ? "bg-red-600" : "border-slate-600"}
                          onClick={() => setPriceDirection("decrease")}
                        >
                          -
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">
                      {language === "ka" ? "მნიშვნელობა" : "Value"}
                    </Label>
                    <Input
                      type="number"
                      value={priceValue}
                      onChange={e => setPriceValue(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                      placeholder={priceType === "percent" ? "10" : "50"}
                    />
                  </div>
                </>
              )}

              {operationType === "availability" && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      variant={availabilityAction === "close" ? "default" : "outline"}
                      className={availabilityAction === "close" ? "bg-red-600" : "border-slate-600"}
                      onClick={() => setAvailabilityAction("close")}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      {language === "ka" ? "დახურვა" : "Close"}
                    </Button>
                    <Button
                      variant={availabilityAction === "open" ? "default" : "outline"}
                      className={availabilityAction === "open" ? "bg-emerald-600" : "border-slate-600"}
                      onClick={() => setAvailabilityAction("open")}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {language === "ka" ? "გახსნა" : "Open"}
                    </Button>
                  </div>
                  {availabilityAction === "open" && (
                    <div>
                      <Label className="text-slate-400 text-sm">
                        {language === "ka" ? "ხელმისაწვდომი ოთახების რაოდენობა" : "Available Room Count"}
                      </Label>
                      <Input
                        type="number"
                        value={availabilityCount}
                        onChange={e => setAvailabilityCount(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>
                  )}
                </div>
              )}

              {operationType === "restriction" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-400 text-sm">
                      {language === "ka" ? "მინიმალური ღამეები" : "Minimum Stay (nights)"}
                    </Label>
                    <Input
                      type="number"
                      value={minStay}
                      onChange={e => setMinStay(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">
                      {language === "ka" ? "ჩამოსვლა დახურული" : "Closed to Arrival"}
                    </Label>
                    <Switch checked={closedToArrival} onCheckedChange={setClosedToArrival} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">
                      {language === "ka" ? "გასვლა დახურული" : "Closed to Departure"}
                    </Label>
                    <Switch checked={closedToDeparture} onCheckedChange={setClosedToDeparture} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room Type Selection */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-cyan-400" />
                  {language === "ka" ? "ოთახის ტიპები" : "Room Types"}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAllRooms}>
                    {language === "ka" ? "ყველა" : "All"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={deselectAllRooms}>
                    {language === "ka" ? "არცერთი" : "None"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roomTypes.map(rt => (
                  <div
                    key={rt.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      rt.selected
                        ? "bg-blue-500/20 border border-blue-500/50"
                        : "bg-slate-700/50 hover:bg-slate-700 border border-transparent"
                    }`}
                    onClick={() => toggleRoomType(rt.id)}
                  >
                    <Checkbox checked={rt.selected} />
                    <span className="text-white text-sm">
                      {language === "ka" ? rt.nameKa : rt.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* OTA Channels Selection */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">
                {language === "ka" ? "OTA არხები" : "OTA Channels"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {OTA_CHANNELS.map(channel => (
                  <Badge
                    key={channel.id}
                    className={`cursor-pointer transition-all ${
                      selectedChannels.includes(channel.id)
                        ? `${channel.color} text-white`
                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}
                    onClick={() => toggleChannel(channel.id)}
                  >
                    {selectedChannels.includes(channel.id) && (
                      <Check className="w-3 h-3 mr-1" />
                    )}
                    {channel.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Apply Button */}
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="lg"
            onClick={handleApplyBulkOperation}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                {language === "ka" ? "მიმდინარეობს..." : "Processing..."}
              </>
            ) : (
              <>
                <ArrowUpDown className="w-5 h-5 mr-2" />
                {language === "ka" ? "ოპერაციის გაშვება" : "Apply Bulk Operation"}
              </>
            )}
          </Button>

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={currentProgress} className="h-2" />
              <p className="text-sm text-center text-slate-400">
                {currentProgress}% - {language === "ka" ? "სინქრონიზაცია..." : "Syncing..."}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Operation Log */}
        <div>
          <Card className="bg-slate-800/50 border-slate-700 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                {language === "ka" ? "ოპერაციების ისტორია" : "Operation Log"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {operations.map(op => (
                  <div
                    key={op.id}
                    className="p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{op.operation}</span>
                      <Badge
                        className={
                          op.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : op.status === "processing"
                            ? "bg-blue-500/20 text-blue-300"
                            : op.status === "failed"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-slate-500/20 text-slate-300"
                        }
                      >
                        {op.status === "completed" && <Check className="w-3 h-3 mr-1" />}
                        {op.status === "processing" && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                        {op.status === "failed" && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {op.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">{op.dateRange}</p>
                    <div className="flex flex-wrap gap-1">
                      {op.roomTypes.map((rt, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-slate-600">
                          {rt}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{op.timestamp}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BulkOperations;
