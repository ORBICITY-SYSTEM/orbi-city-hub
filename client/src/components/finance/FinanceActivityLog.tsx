import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FileText, Upload, Trash2, Edit, Download } from 'lucide-react';

const actionIcons = {
  created: FileText,
  updated: Edit,
  deleted: Trash2,
  uploaded: Upload,
  imported: Upload,
  exported: Download,
};

const actionColors = {
  created: 'default',
  updated: 'secondary',
  deleted: 'destructive',
  uploaded: 'default',
  imported: 'default',
  exported: 'secondary',
} as const;

export const FinanceActivityLog = () => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['finance-activity-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finance_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Loading activity history...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance Activity Log</CardTitle>
        <CardDescription>
          Recent changes and activities in the Finance module
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No activity recorded yet
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => {
                const ActionIcon = actionIcons[activity.action as keyof typeof actionIcons] || FileText;
                const actionColor = actionColors[activity.action as keyof typeof actionColors] || 'default';

                return (
                  <TableRow key={activity.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{activity.user_email}</TableCell>
                    <TableCell>
                      <Badge variant={actionColor} className="flex items-center gap-1 w-fit">
                        <ActionIcon className="h-3 w-3" />
                        {activity.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{activity.entity_type}</span>
                        {activity.entity_name && (
                          <span className="text-sm text-muted-foreground">{activity.entity_name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.changes && (
                        <pre className="text-xs max-w-md overflow-auto">
                          {JSON.stringify(activity.changes, null, 2)}
                        </pre>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
