import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

export interface GanttReservation {
  id: number;
  roomNumber: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  status: "confirmed" | "pending" | "checked_out";
  price: number;
  source: string;
}

interface PlotlyGanttChartProps {
  reservations: GanttReservation[];
  startDate?: Date;
  endDate?: Date;
}

const STATUS_COLORS = {
  confirmed: "#10b981", // Green
  pending: "#f59e0b",   // Yellow/Orange
  checked_out: "#6b7280", // Grey
} as const;

const STATUS_LABELS = {
  confirmed: "Confirmed",
  pending: "Pending",
  checked_out: "Checked Out",
} as const;

export default function PlotlyGanttChart({ 
  reservations, 
  startDate, 
  endDate 
}: PlotlyGanttChartProps) {
  
  const plotData: Data[] = useMemo(() => {
    // Group by status for legend
    const grouped = reservations.reduce((acc, res) => {
      if (!acc[res.status]) acc[res.status] = [];
      acc[res.status].push(res);
      return acc;
    }, {} as Record<string, GanttReservation[]>);

    return Object.entries(grouped).map(([status, items]) => ({
      type: "bar" as const,
      orientation: "h" as const,
      name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
      x: items.map(r => {
        const duration = r.checkOut.getTime() - r.checkIn.getTime();
        return duration;
      }),
      y: items.map(r => `Room ${r.roomNumber}`),
      base: items.map(r => r.checkIn.getTime()),
      marker: {
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
      },
      text: items.map(r => 
        `${r.guestName}<br>₾${r.price}<br>${r.source}`
      ),
      hovertemplate: 
        "<b>%{y}</b><br>" +
        "Guest: %{text}<br>" +
        "Check-in: %{base|%b %d, %Y}<br>" +
        "Check-out: %{base|%b %d, %Y}<br>" +
        "<extra></extra>",
      customdata: items.map(r => ([
        r.checkIn.toISOString(),
        r.checkOut.toISOString(),
        r.guestName,
        r.price,
        r.source,
      ] as any)),
    }));
  }, [reservations]);

  const layout: Partial<Layout> = useMemo(() => {
    // Get all unique room numbers and sort them
    const rooms = Array.from(
      new Set(reservations.map(r => `Room ${r.roomNumber}`))
    ).sort((a, b) => {
      const numA = parseInt(a.replace("Room ", ""));
      const numB = parseInt(b.replace("Room ", ""));
      return numA - numB;
    });

    // Calculate date range
    const minDate = startDate || new Date(
      Math.min(...reservations.map(r => r.checkIn.getTime()))
    );
    const maxDate = endDate || new Date(
      Math.max(...reservations.map(r => r.checkOut.getTime()))
    );

    return {
      title: {
        text: "Room Occupancy Timeline",
        font: { size: 20, family: "Inter, sans-serif" },
      },
      xaxis: {
        type: "date",
        title: { text: "Date" },
        range: [minDate.getTime(), maxDate.getTime()],
        tickformat: "%b %d",
        gridcolor: "#e5e7eb",
      },
      yaxis: {
        title: { text: "Room Number" },
        categoryorder: "array",
        categoryarray: rooms,
        gridcolor: "#e5e7eb",
      },
      barmode: "overlay",
      bargap: 0.2,
      plot_bgcolor: "#f9fafb",
      paper_bgcolor: "white",
      font: {
        family: "Inter, sans-serif",
        size: 12,
      },
      margin: {
        l: 100,
        r: 50,
        t: 80,
        b: 80,
      },
      legend: {
        orientation: "h",
        yanchor: "bottom",
        y: 1.02,
        xanchor: "right",
        x: 1,
      },
      hovermode: "closest",
    };
  }, [reservations, startDate, endDate]);

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ["lasso2d", "select2d"] as any,
    displaylogo: false,
  };

  if (reservations.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-center">
          <p className="text-slate-600 text-lg mb-2">No reservations to display</p>
          <p className="text-slate-400 text-sm">Add reservations to see the timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 p-4">
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        className="w-full"
        style={{ width: "100%", height: "600px" }}
        useResizeHandler
      />
    </div>
  );
}
