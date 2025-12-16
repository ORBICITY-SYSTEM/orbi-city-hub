import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Facebook, Instagram, Music2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledDate: Date;
  status: "scheduled" | "published" | "failed";
  mediaUrl?: string;
}

export default function ContentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showNewPost, setShowNewPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: "1",
      content: "Stunning sunset views from ORBI City! 🌅 #Batumi #LuxuryLiving",
      platforms: ["facebook", "instagram"],
      scheduledDate: new Date(2025, 0, 25, 18, 0),
      status: "scheduled",
    },
    {
      id: "2",
      content: "Special winter offer! Get 20% off on February bookings ❄️",
      platforms: ["facebook", "instagram", "tiktok"],
      scheduledDate: new Date(2025, 0, 26, 10, 0),
      status: "scheduled",
    },
  ]);

  const handleGenerateCaption = async () => {
    toast.info("Generating AI caption...");
    // Simulate AI generation
    setTimeout(() => {
      const captions = [
        "Experience luxury living at ORBI City Batumi! 🌊 Modern apartments with breathtaking Black Sea views. Book your stay today! #ORBICity #Batumi #LuxuryApartments",
        "Wake up to stunning sunrises over the Black Sea 🌅 ORBI City offers the perfect blend of comfort and elegance. Limited availability! #Batumi #GeorgiaTourism",
        "Your dream vacation starts here! ✨ ORBI City Batumi - where luxury meets the sea. Check out our special offers! #TravelGeorgia #LuxuryStay",
      ];
      setPostContent(captions[Math.floor(Math.random() * captions.length)]);
      toast.success("AI caption generated!");
    }, 1500);
  };

  const handleSchedulePost = () => {
    if (!postContent || selectedPlatforms.length === 0 || !selectedDate) {
      toast.error("Please fill all fields");
      return;
    }

    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      content: postContent,
      platforms: selectedPlatforms,
      scheduledDate: selectedDate,
      status: "scheduled",
    };

    setScheduledPosts([...scheduledPosts, newPost]);
    setPostContent("");
    setSelectedPlatforms([]);
    setShowNewPost(false);
    toast.success("Post scheduled successfully!");
  };

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="w-4 h-4" />;
      case "instagram":
        return <Instagram className="w-4 h-4" />;
      case "tiktok":
        return <Music2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Calendar</h2>
          <p className="text-white/70">
            Schedule posts across Facebook, Instagram, and TikTok
          </p>
        </div>
        <Button
          onClick={() => setShowNewPost(!showNewPost)}
          className="bg-gradient-to-r from-blue-500 to-purple-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Schedule New Post</h3>
          
          {/* Content */}
          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Content</label>
              <Textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Write your post content..."
                className="bg-white/5 border-white/20 text-white min-h-[120px]"
              />
              <Button
                onClick={handleGenerateCaption}
                variant="ghost"
                size="sm"
                className="mt-2 text-purple-400 hover:text-purple-300"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Caption
              </Button>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="text-white/70 text-sm mb-2 block">Platforms</label>
              <div className="flex gap-3">
                <Button
                  onClick={() => togglePlatform("facebook")}
                  variant={selectedPlatforms.includes("facebook") ? "default" : "outline"}
                  className={
                    selectedPlatforms.includes("facebook")
                      ? "bg-blue-500 hover:bg-blue-600"
                      : ""
                  }
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  onClick={() => togglePlatform("instagram")}
                  variant={selectedPlatforms.includes("instagram") ? "default" : "outline"}
                  className={
                    selectedPlatforms.includes("instagram")
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : ""
                  }
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Button>
                <Button
                  onClick={() => togglePlatform("tiktok")}
                  variant={selectedPlatforms.includes("tiktok") ? "default" : "outline"}
                  className={
                    selectedPlatforms.includes("tiktok")
                      ? "bg-black hover:bg-gray-900"
                      : ""
                  }
                >
                  <Music2 className="w-4 h-4 mr-2" />
                  TikTok
                </Button>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Date</label>
                <Input
                  type="date"
                  className="bg-white/5 border-white/20 text-white"
                  value={selectedDate?.toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Time</label>
                <Input
                  type="time"
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleSchedulePost}
                className="bg-gradient-to-r from-blue-500 to-purple-500"
              >
                Schedule Post
              </Button>
              <Button
                onClick={() => setShowNewPost(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="text-white"
          />
        </Card>

        {/* Scheduled Posts */}
        <Card className="lg:col-span-2 bg-white/10 backdrop-blur-md border-white/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            Scheduled Posts ({scheduledPosts.length})
          </h3>
          <div className="space-y-3">
            {scheduledPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white text-sm flex-1">{post.content}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      post.status === "scheduled"
                        ? "bg-blue-500/20 text-blue-400"
                        : post.status === "published"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/70">
                  <span>
                    {post.scheduledDate.toLocaleDateString()} at{" "}
                    {post.scheduledDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="flex gap-2">
                    {post.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="flex items-center gap-1 text-white/50"
                      >
                        {getPlatformIcon(platform)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Best Posting Times Suggestion */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border-white/20 p-6">
        <div className="flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-purple-400 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              AI Recommendation
            </h3>
            <p className="text-white/70">
              Based on your audience activity, the best time to post today is{" "}
              <span className="text-purple-400 font-semibold">
                6:00 PM - 8:00 PM
              </span>
              . Your posts during this time get 45% more engagement!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
