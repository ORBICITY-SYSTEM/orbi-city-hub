import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertCircle,
  Lightbulb,
  MessageSquare,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

type FeedbackType = "bug" | "feature" | "feedback";
type FeedbackStatus = "new" | "in_progress" | "resolved" | "closed";

interface Feedback {
  id: number;
  userId: number | null;
  userEmail: string | null;
  type: FeedbackType;
  title: string;
  description: string;
  url: string | null;
  userAgent: string | null;
  screenshot: string | null;
  status: FeedbackStatus;
  createdAt: string;
}

export default function AdminFeedback() {
  const [filterType, setFilterType] = useState<FeedbackType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | "all">("all");

  // Fetch feedback data
  const { data: feedbackList = [], refetch } = trpc.feedback.list.useQuery();
  const { data: stats } = trpc.feedback.getStats.useQuery();

  // Mutations
  const updateStatusMutation = trpc.feedback.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const deleteMutation = trpc.feedback.delete.useMutation({
    onSuccess: () => {
      toast.success("Feedback deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete feedback: ${error.message}`);
    },
  });

  // Filter feedback
  const filteredFeedback = feedbackList.filter((item: Feedback) => {
    if (filterType !== "all" && item.type !== filterType) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    return true;
  });

  // Type icons and colors
  const getTypeIcon = (type: FeedbackType) => {
    switch (type) {
      case "bug":
        return <AlertCircle className="h-4 w-4" />;
      case "feature":
        return <Lightbulb className="h-4 w-4" />;
      case "feedback":
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: FeedbackType) => {
    switch (type) {
      case "bug":
        return "destructive";
      case "feature":
        return "default";
      case "feedback":
        return "secondary";
    }
  };

  const getStatusIcon = (status: FeedbackStatus) => {
    switch (status) {
      case "new":
        return <AlertCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: FeedbackStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-500";
      case "in_progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
    }
  };

  const handleStatusChange = (id: number, status: FeedbackStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this feedback?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Feedback Management
          </h1>
          <p className="text-slate-300">
            Manage user feedback, bug reports, and feature requests
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white">
                Total Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats?.total || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                Bug Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats?.byType.bug || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                Feature Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats?.byType.feature || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                General Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats?.byType.feedback || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Filters</CardTitle>
            <CardDescription className="text-slate-300">
              Filter feedback by type and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-white mb-2 block">
                  Type
                </label>
                <Select
                  value={filterType}
                  onValueChange={(value) =>
                    setFilterType(value as FeedbackType | "all")
                  }
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="bug">Bug Reports</SelectItem>
                    <SelectItem value="feature">Feature Requests</SelectItem>
                    <SelectItem value="feedback">General Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-white mb-2 block">
                  Status
                </label>
                <Select
                  value={filterStatus}
                  onValueChange={(value) =>
                    setFilterStatus(value as FeedbackStatus | "all")
                  }
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="py-12 text-center">
                <p className="text-slate-300">No feedback found</p>
              </CardContent>
            </Card>
          ) : (
            filteredFeedback.map((item: Feedback) => (
              <Card
                key={item.id}
                className="bg-white/10 backdrop-blur-md border-white/20"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getTypeColor(item.type)}>
                          <span className="flex items-center gap-1">
                            {getTypeIcon(item.type)}
                            {item.type}
                          </span>
                        </Badge>
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {getStatusIcon(item.status)}
                          {item.status.replace("_", " ")}
                        </div>
                      </div>
                      <CardTitle className="text-white text-lg">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-slate-300 mt-1">
                        {item.userEmail || "Anonymous"} •{" "}
                        {new Date(item.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-200 mb-4 whitespace-pre-wrap">
                    {item.description}
                  </p>

                  {item.url && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-400 mb-1">Page URL:</p>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:underline"
                      >
                        {item.url}
                      </a>
                    </div>
                  )}

                  {item.screenshot && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-400 mb-2">Screenshot:</p>
                      <img
                        src={item.screenshot}
                        alt="Screenshot"
                        className="max-w-md rounded-lg border border-white/20"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-white">
                      Update Status:
                    </label>
                    <Select
                      value={item.status}
                      onValueChange={(value) =>
                        handleStatusChange(item.id, value as FeedbackStatus)
                      }
                    >
                      <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
