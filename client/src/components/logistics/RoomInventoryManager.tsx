import { useState } from "react";
import RoomDetailModal from "./RoomDetailModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Download, History, FileText, Save } from "lucide-react";

// 56 ORBI City studio room numbers from GitHub
const ROOM_NUMBERS = [
  'A 1821', 'A 1033', 'A 1806', 'A 2035', 'C 2936', 'C 3834', 'C 3928',
  'C 4638', 'C 2107', 'C 2529', 'C 2609', 'C 3611', 'C 4011', 'C 4704',
  'C 3421', 'C 3423', 'C 3425', 'C 3428', 'C 3431', 'C 3437', 'C 3439',
  'C 3441', 'A 1301', 'C 2921', 'C 2923', 'C 2558', 'D1 3414', 'D1 3416',
  'D1 3418', 'A 4035', 'C 2522', 'A 1258', 'C 2524', 'C 2520', 'C 2547',
  'C 1256', 'C 2861', 'C 2961', 'C 2847', 'C 2947', 'A 3041', 'A 3035',
  'A 1833', 'A 2441', 'D2 3727', 'C 3937', 'C 2641', 'C 4706', 'A 4023',
  'A 4025', 'A 4027', 'A 4029', 'A 4024', 'A 4022', 'A 4026', 'C 2637'
];

// Standard inventory items with quantities (from Lovable screenshots)
const STANDARD_INVENTORY = [
  { name: "აბაზანის აქსესუარები", standard: 1, category: "აბაზანა" },
  { name: "აბაზანის სკამი", standard: 4, category: "აბაზანა" },
  { name: "ბალიში (სანოლისთვის და ფიზნისთვის)", standard: 3, category: "ტექსტილი" },
  { name: "ბალიშის ბორბოლი (სანოლისთვის და ფიზნისთვის)", standard: 3, category: "ტექსტილი" },
  { name: "საწოლის საფარი", standard: 1, category: "ტექსტილი" },
  { name: "მატრასის დამცავი", standard: 1, category: "ტექსტილი" },
  { name: "ლეიბი (სანოლისთვის და ფიზნისთვის)", standard: 3, category: "ტექსტილი" },
  { name: "ზეწარი (სანოლისთვის და ფიზნისთვის)", standard: 3, category: "ტექსტილი" },
  { name: "სკამი", standard: 4, category: "ავეჯი" },
  { name: "აივნის მაგიდა", standard: 1, category: "ავეჯი" },
  { name: "აივნის სკამი", standard: 2, category: "ავეჯი" },
  { name: "მინიბარი", standard: 1, category: "ტექნიკა" },
  { name: "მაცივარი", standard: 1, category: "ტექნიკა" },
  { name: "სარეცხი მანქანა", standard: 1, category: "ტექნიკა" },
  { name: "მიკროტალღური", standard: 1, category: "ტექნიკა" },
  { name: "ელექტრო ჩაიდანი", standard: 1, category: "ტექნიკა" },
  { name: "ღვინის ბოკალი", standard: 2, category: "ჭურჭელი" },
  { name: "ყავის/ჩაის ჭიქა", standard: 4, category: "ჭურჭელი" },
  { name: "წვენის ჭიქა", standard: 4, category: "ჭურჭელი" },
  { name: "არყის ჭიქა", standard: 4, category: "ჭურჭელი" },
  { name: "ღვინის გასახსნელი", standard: 1, category: "ჭურჭელი" },
  { name: "ინდუქციური ქვაბი", standard: 1, category: "ჭურჭელი" },
  { name: "სუფრის კოვზი", standard: 4, category: "ჭურჭელი" },
  { name: "ჩაის კოვზი", standard: 4, category: "ჭურჭელი" },
  { name: "ქვაბისთვის ჩამჩა", standard: 2, category: "ჭურჭელი" },
  { name: "საჭრელი დანა", standard: 4, category: "ჭურჭელი" },
  { name: "დიდი თეფში", standard: 4, category: "ჭურჭელი" },
  { name: "საშუალო თეფში", standard: 4, category: "ჭურჭელი" },
  { name: "საჭრელი დაფა", standard: 1, category: "ჭურჭელი" },
  { name: "საფერფლე", standard: 1, category: "ჭურჭელი" },
  { name: "სარეცხის საშრობი", standard: 1, category: "სხვა" },
  { name: "აქანდაზი/ცოცხი", standard: 1, category: "სხვა" },
  { name: "პოლის ჯოხი", standard: 1, category: "სხვა" },
  { name: "ხის კალათა", standard: 2, category: "აბაზანა" },
];

export default function RoomInventoryManager() {
  const [selectedRoom, setSelectedRoom] = useState<string>("ყველა ოთახი");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRoomChange = (value: string) => {
    setSelectedRoom(value);
    // Open modal if a specific room is selected (not "ყველა ოთახი")
    if (value !== "ყველა ოთახი") {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="p-6 bg-gray-800/50 border-gray-700">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              სტუდიოს ინვენტარის მართვა
            </h2>
            <p className="text-gray-400">
              აირჩიეთ ოთახი ინვენტარის დასათვალიერებლად და განსახლებად
            </p>
          </div>

          {/* Room Selection */}
          <div className="flex items-center gap-4">
            <label className="text-white font-medium whitespace-nowrap">
              აირჩიეთ ოთახი:
            </label>
            <Select value={selectedRoom} onValueChange={handleRoomChange}>
              <SelectTrigger className="w-[300px] bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 max-h-[400px]">
                <SelectItem value="ყველა ოთახი" className="text-white font-semibold bg-teal-900/30">
                  ყველა ოთახი
                </SelectItem>
                {ROOM_NUMBERS.map((room) => (
                  <SelectItem key={room} value={room} className="text-white">
                    ოთახი {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Warning Alert */}
      <Card className="p-6 bg-yellow-900/20 border-yellow-700/50">
        <div className="flex items-start gap-3">
          <div className="text-yellow-500 text-2xl">⚠️</div>
          <div>
            <h3 className="text-yellow-200 font-semibold mb-1">
              ყველა ოთახის ინვენტარი
            </h3>
            <p className="text-yellow-300/80 text-sm">
              ამ სიაში წარმოდგენილი ინვენტარის ყველა ოთახისთვის
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            <FileText className="w-4 h-4 mr-2" />
            ტექსტობრივი ჩაბარება
          </Button>
          <Button
            variant="outline"
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            <History className="w-4 h-4 mr-2" />
            ისტორია
          </Button>
          <Button
            variant="outline"
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            <Download className="w-4 h-4 mr-2" />
            ექსპორტი Excel
          </Button>
        </div>
        <Button className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8">
          <Save className="w-4 h-4 mr-2" />
          შენახვა
        </Button>
      </div>

      {/* Inventory Table */}
      <Card className="p-6 bg-gray-800/50 border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3 text-white font-semibold sticky left-0 bg-gray-800 z-10 min-w-[250px]">
                  ნივთის სახელი
                </th>
                <th className="text-center p-3 text-white font-semibold min-w-[150px]">
                  სტანდარტი 1 ოთახი
                </th>
                <th className="text-center p-3 text-white font-semibold min-w-[150px]">
                  ნაკლული რაოდენობა
                </th>
                {ROOM_NUMBERS.map((room) => (
                  <th key={room} className="text-center p-3 text-white font-semibold min-w-[120px]">
                    {room}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STANDARD_INVENTORY.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="p-3 text-white sticky left-0 bg-gray-800 z-10">
                    {item.name}
                  </td>
                  <td className="p-3 text-center text-gray-300">
                    {item.standard}
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-red-900/30 text-red-400 font-semibold">
                      0
                    </span>
                  </td>
                  {ROOM_NUMBERS.map((room) => (
                    <td key={room} className="p-3 text-center">
                      <input
                        type="number"
                        min="0"
                        defaultValue={item.standard}
                        className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Room Detail Modal */}
      <RoomDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRoom("ყველა ოთახი");
        }}
        roomNumber={selectedRoom}
        inventoryItems={STANDARD_INVENTORY}
      />
    </div>
  );
}
