import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AnalysisResult } from '@/utils/excelAnalyzer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FinanceAnalysisContextType {
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  saveAnalysisResult: (result: AnalysisResult, file: File) => Promise<void>;
  loadLatestAnalysis: () => Promise<void>;
  analysisHistory: any[];
  loadAnalysisHistory: () => Promise<void>;
  deleteAnalysis: (id: string) => Promise<void>;
}

const FinanceAnalysisContext = createContext<FinanceAnalysisContextType | undefined>(undefined);

export const FinanceAnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const { toast } = useToast();

  // Load latest analysis on mount
  useEffect(() => {
    loadLatestAnalysis();
    loadAnalysisHistory();
  }, []);

  const loadLatestAnalysis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('excel_analysis_results')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Ignore "no rows" error
          throw error;
        }
        return;
      }

      if (data) {
        const result: AnalysisResult = {
          overallStats: {
            totalRevenue: Number(data.total_revenue),
            totalNights: data.total_nights,
            totalBookings: data.total_bookings,
            avgADR: Number(data.avg_adr),
            uniqueRooms: data.unique_rooms,
            occupancyRate: data.occupancy_rate ? Number(data.occupancy_rate) : 0,
            revPAR: data.rev_par ? Number(data.rev_par) : 0,
          },
          monthlyStats: data.monthly_stats as any,
          roomStats: data.room_stats as any,
          channelStats: (data.channel_stats as any) || [],
          buildingStats: (data.building_stats as any) || [],
        };
        setAnalysisResult(result);
      }
    } catch (error: any) {
      console.error('Error loading analysis:', error);
    }
  };

  const loadAnalysisHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('excel_analysis_results')
        .select('id, file_name, upload_date, total_revenue, total_bookings')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setAnalysisHistory(data || []);
    } catch (error: any) {
      console.error('Error loading history:', error);
    }
  };

  const saveAnalysisResult = async (result: AnalysisResult, file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload file to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('excel-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save analysis to database
      const { error: dbError } = await supabase
        .from('excel_analysis_results')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          total_revenue: result.overallStats.totalRevenue,
          total_nights: result.overallStats.totalNights,
          total_bookings: result.overallStats.totalBookings,
          avg_adr: result.overallStats.avgADR,
          unique_rooms: result.overallStats.uniqueRooms,
          occupancy_rate: result.overallStats.occupancyRate || null,
          rev_par: result.overallStats.revPAR || null,
          monthly_stats: result.monthlyStats as any,
          room_stats: result.roomStats as any,
          channel_stats: result.channelStats as any,
          building_stats: result.buildingStats as any,
        });

      if (dbError) throw dbError;

      await loadAnalysisHistory();
      
      toast({
        title: "✅ შენახულია",
        description: "Excel ანალიზი წარმატებით შეინახა",
      });
    } catch (error: any) {
      console.error('Error saving analysis:', error);
      toast({
        title: "შეცდომა",
        description: "ანალიზის შენახვა ვერ მოხერხდა",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get file path before deleting
      const { data: analysis } = await supabase
        .from('excel_analysis_results')
        .select('file_path')
        .eq('id', id)
        .single();

      if (analysis?.file_path) {
        // Delete file from storage
        await supabase.storage
          .from('excel-files')
          .remove([analysis.file_path]);
      }

      // Delete from database
      const { error } = await supabase
        .from('excel_analysis_results')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadAnalysisHistory();
      
      // If deleted analysis was the current one, load the latest
      await loadLatestAnalysis();

      toast({
        title: "✅ წაიშალა",
        description: "ანალიზი წარმატებით წაიშალა",
      });
    } catch (error: any) {
      console.error('Error deleting analysis:', error);
      toast({
        title: "შეცდომა",
        description: "ანალიზის წაშლა ვერ მოხერხდა",
        variant: "destructive",
      });
    }
  };

  return (
    <FinanceAnalysisContext.Provider value={{ 
      analysisResult, 
      setAnalysisResult,
      saveAnalysisResult,
      loadLatestAnalysis,
      analysisHistory,
      loadAnalysisHistory,
      deleteAnalysis,
    }}>
      {children}
    </FinanceAnalysisContext.Provider>
  );
};

export const useFinanceAnalysis = () => {
  const context = useContext(FinanceAnalysisContext);
  if (context === undefined) {
    throw new Error('useFinanceAnalysis must be used within a FinanceAnalysisProvider');
  }
  return context;
};
