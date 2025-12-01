import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type FinanceActivityAction = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'uploaded'
  | 'imported'
  | 'exported';

export type FinanceEntityType = 
  | 'finance_record' 
  | 'expense_record' 
  | 'monthly_analysis' 
  | 'excel_analysis'
  | 'file_upload';

interface LogActivityParams {
  entityType: FinanceEntityType;
  entityId?: string;
  entityName?: string;
  action: FinanceActivityAction;
  changes?: Record<string, any>;
}

export const useFinanceActivity = () => {
  const logActivity = useCallback(async ({
    entityType,
    entityId,
    entityName,
    action,
    changes,
  }: LogActivityParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const activityLog = {
        user_id: user?.id || '00000000-0000-0000-0000-000000000000',
        user_email: user?.email || 'anonymous',
        entity_type: entityType,
        entity_id: entityId || null,
        entity_name: entityName || null,
        action,
        changes: changes || null,
      };

      const { error } = await supabase
        .from('finance_activity_log')
        .insert(activityLog);

      if (error) {
        console.error('Error logging finance activity:', error);
      }
    } catch (error) {
      console.error('Error in logActivity:', error);
    }
  }, []);

  return { logActivity };
};
