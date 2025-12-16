import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";

interface InventoryItem {
  name: string;
  standard: number;
  category: string;
}

interface RoomDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomNumber: string;
  inventoryItems: InventoryItem[];
}

export default function RoomDetailModal({
  isOpen,
  onClose,
  roomNumber,
  inventoryItems,
}: RoomDetailModalProps) {
  const [itemData, setItemData] = useState<Record<string, {
    actual: number;
    condition: string;
    notes: string;
  }>>({});

  const handleSave = () => {
    // TODO: Save to database via tRPC
    console.log("Saving room data:", { roomNumber, itemData });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              ოთახი {roomNumber} - ინვენტარის მართვა
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-gray-400 text-sm">
            ბოლო შემოწმება: {new Date().toLocaleDateString('ka-GE')}
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["აბაზანა", "ტექსტილი", "ავეჯი", "ტექნიკა", "ჭურჭელი", "სხვა"].map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white whitespace-nowrap transition-colors"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Inventory Items Table */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-white font-semibold w-1/4">
                    ნივთი
                  </th>
                  <th className="text-center p-4 text-white font-semibold w-1/6">
                    სტანდარტი
                  </th>
                  <th className="text-center p-4 text-white font-semibold w-1/6">
                    ფაქტობრივი
                  </th>
                  <th className="text-center p-4 text-white font-semibold w-1/6">
                    მდგომარეობა
                  </th>
                  <th className="text-left p-4 text-white font-semibold w-1/4">
                    შენიშვნები
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item, idx) => {
                  const itemKey = item.name;
                  const data = itemData[itemKey] || {
                    actual: item.standard,
                    condition: "OK",
                    notes: "",
                  };

                  return (
                    <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="p-4 text-white">
                        {item.name}
                      </td>
                      <td className="p-4 text-center text-gray-300 font-semibold">
                        {item.standard}
                      </td>
                      <td className="p-4 text-center">
                        <Input
                          type="number"
                          min="0"
                          value={data.actual}
                          onChange={(e) => {
                            setItemData({
                              ...itemData,
                              [itemKey]: {
                                ...data,
                                actual: parseInt(e.target.value) || 0,
                              },
                            });
                          }}
                          className="w-20 mx-auto bg-gray-700 border-gray-600 text-white text-center"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <Select
                          value={data.condition}
                          onValueChange={(value) => {
                            setItemData({
                              ...itemData,
                              [itemKey]: {
                                ...data,
                                condition: value,
                              },
                            });
                          }}
                        >
                          <SelectTrigger className="w-32 mx-auto bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="OK" className="text-white">
                              OK
                            </SelectItem>
                            <SelectItem value="დაზიანებული" className="text-white">
                              დაზიანებული
                            </SelectItem>
                            <SelectItem value="ახალი საჭიროა" className="text-white">
                              ახალი საჭიროა
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <Textarea
                          value={data.notes}
                          onChange={(e) => {
                            setItemData({
                              ...itemData,
                              [itemKey]: {
                                ...data,
                                notes: e.target.value,
                              },
                            });
                          }}
                          placeholder="შენიშვნა..."
                          className="w-full bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 resize-none"
                          rows={1}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              გაუქმება
            </Button>
            <Button
              onClick={handleSave}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8"
            >
              <Save className="w-4 h-4 mr-2" />
              შენახვა
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
