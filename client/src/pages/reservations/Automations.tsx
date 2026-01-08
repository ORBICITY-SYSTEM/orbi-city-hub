/**
 * Booking.com Butler - Automations Dashboard
 * 
 * Full dashboard for Butler AI Agent.
 * Shows pending tasks, reviews, metrics, and approval interface.
 */

import { useState } from "react";
import { Bot, CheckCircle, XCircle, Clock, TrendingUp, AlertCircle, Sparkles, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Automations() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [modifiedResponse, setModifiedResponse] = useState("");

  const { data: pendingTasks, refetch: refetchTasks } = trpc.butler.getPendingTasks.useQuery();
  const { data: reviews } = trpc.butler.getReviews.useQuery({ withoutResponseOnly: true });
  const { data: metrics } = trpc.butler.getMetrics.useQuery({ days: 30 });
  const { data: recommendations } = trpc.butler.getRecommendations.useQuery();
  const { data: stats } = trpc.butler.getStats.useQuery({ days: 30 });

  const approveMutation = trpc.butler.approve.useMutation({
    onSuccess: () => {
      toast.success("Task approved successfully!");
      refetchTasks();
      setSelectedTask(null);
      setModifiedResponse("");
    },
    onError: (error) => {
      toast.error(`Failed to approve: ${error.message}`);
    }
  });

  const rejectMutation = trpc.butler.reject.useMutation({
    onSuccess: () => {
      toast.success("Task rejected");
      refetchTasks();
      setSelectedTask(null);
    },
    onError: (error) => {
      toast.error(`Failed to reject: ${error.message}`);
    }
  });

  const generateResponseMutation = trpc.butler.generateResponse.useMutation({
    onSuccess: () => {
      toast.success("AI response generated! Check Pending Tasks tab.");
      refetchTasks();
    },
    onError: (error) => {
      toast.error(`Failed to generate: ${error.message}`);
    }
  });

  const handleApprove = (taskId: string) => {
    const task = pendingTasks?.find(t => t.id === taskId);
    if (!task) return;

    approveMutation.mutate({
      taskId,
      modifiedContent: modifiedResponse ? { responseText: modifiedResponse } : undefined
    });
  };

  const handleReject = (taskId: string) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    rejectMutation.mutate({
      taskId,
      reason
    });
  };

  const handleGenerateResponse = (review: any) => {
    generateResponseMutation.mutate({
      reviewId: review.id,
      guestName: review.guest_name,
      rating: review.rating,
      comment: review.comment,
      negativeComment: review.negative_comment,
      positiveComment: review.positive_comment,
      language: review.guest_country === 'GE' ? 'ka' : (review.guest_country === 'RU' ? 'ru' : 'en')
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            Booking.com Butler
          </h1>
          <p className="text-muted-foreground mt-2">AI-powered automation dashboard</p>
        </div>
        <Badge variant="default" className="bg-green-600 text-lg px-4 py-2">
          <div className="h-3 w-3 rounded-full bg-white mr-2 animate-pulse" />
          Active
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingTasks?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting your approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unanswered Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reviews?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Need response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.completed || 0}</div>
            <p className="text-xs text-green-600 mt-1">+{stats?.approved || 0} approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.timeSaved.toFixed(1) || 0}h</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Tasks ({pendingTasks?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Reviews ({reviews?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Pending Tasks Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingTasks && pendingTasks.length > 0 ? (
            pendingTasks.map((task) => (
              <Card key={task.id} className={selectedTask === task.id ? "border-2 border-purple-500" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {task.title}
                        <Badge variant={task.priority === 'urgent' || task.priority === 'high' ? 'destructive' : 'secondary'}>
                          {task.priority}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">{task.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AI Suggestion */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <h4 className="font-semibold">AI Generated Response:</h4>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm whitespace-pre-wrap">{task.ai_suggestion.responseText}</p>
                    </div>
                  </div>

                  {/* Modify Response (Optional) */}
                  {selectedTask === task.id && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Modify Response (Optional):</label>
                      <Textarea
                        value={modifiedResponse}
                        onChange={(e) => setModifiedResponse(e.target.value)}
                        placeholder="Edit the AI response if needed..."
                        className="min-h-[100px]"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {selectedTask === task.id ? (
                      <>
                        <Button
                          onClick={() => handleApprove(task.id)}
                          disabled={approveMutation.isPending}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {modifiedResponse ? "Approve with Changes" : "Approve & Send"}
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedTask(null);
                            setModifiedResponse("");
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => setSelectedTask(task.id)}
                          variant="default"
                          className="flex-1"
                        >
                          Review & Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(task.id)}
                          variant="destructive"
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No pending tasks at the moment.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {review.guest_name}
                        <Badge variant={review.rating < 5 ? 'destructive' : review.rating >= 7 ? 'default' : 'secondary'}>
                          {review.rating}/10
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {review.guest_country} • {new Date(review.review_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {review.comment && (
                    <div>
                      <h4 className="font-semibold mb-2">Comment:</h4>
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  )}
                  {review.negative_comment && (
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">Negative:</h4>
                      <p className="text-sm">{review.negative_comment}</p>
                    </div>
                  )}
                  {review.positive_comment && (
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">Positive:</h4>
                      <p className="text-sm">{review.positive_comment}</p>
                    </div>
                  )}
                  <Button
                    onClick={() => handleGenerateResponse(review)}
                    disabled={generateResponseMutation.isPending}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Response
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">All reviews answered!</h3>
                <p className="text-muted-foreground">Great job staying on top of guest feedback.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations && (
            <>
              {/* Alerts */}
              {recommendations.alerts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Critical Alerts
                  </h3>
                  {recommendations.alerts.map((alert, idx) => (
                    <Card key={idx} className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="text-red-900 dark:text-red-100">{alert.title}</CardTitle>
                        <CardDescription>{alert.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-semibold mb-2">Suggestions:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {alert.suggestions.map((suggestion, sidx) => (
                            <li key={sidx} className="text-sm">{suggestion}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {recommendations.recommendations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Smart Recommendations
                  </h3>
                  {recommendations.recommendations.map((rec, idx) => (
                    <Card key={idx} className="border-blue-200 dark:border-blue-900">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-blue-900 dark:text-blue-100">{rec.title}</CardTitle>
                            <CardDescription>{rec.description}</CardDescription>
                          </div>
                          <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                            {rec.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {rec.estimatedImpact && (
                          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                              💰 Estimated Impact: {rec.estimatedImpact}
                            </p>
                          </div>
                        )}
                        <Button>Take Action</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {recommendations.alerts.length === 0 && recommendations.recommendations.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Everything looks good!</h3>
                    <p className="text-muted-foreground">No critical issues or recommendations at this time.</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{metrics?.latest?.occupancy_rate?.toFixed(1) || 0}%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {metrics?.trends?.occupancyChange && metrics.trends.occupancyChange > 0 ? '↑' : '↓'} 
                  {Math.abs(metrics?.trends?.occupancyChange || 0).toFixed(1)}% vs yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{metrics?.latest?.review_score?.toFixed(1) || 0}/10</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {metrics?.trends?.reviewScoreChange && metrics.trends.reviewScoreChange > 0 ? '↑' : '↓'} 
                  {Math.abs(metrics?.trends?.reviewScoreChange || 0).toFixed(2)} vs yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">₾{(metrics?.latest?.total_revenue || 0).toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {metrics?.trends?.revenueChange && metrics.trends.revenueChange > 0 ? '↑' : '↓'} 
                  ₾{Math.abs(metrics?.trends?.revenueChange || 0).toLocaleString()} vs yesterday
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
