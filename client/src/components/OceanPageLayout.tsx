/**
 * Ocean Page Layout Component
 * Provides consistent ocean blue theme across all modules
 */

import { ReactNode } from "react";

interface OceanPageLayoutProps {
  title: string;
  titleKa?: string;
  subtitle?: string;
  subtitleKa?: string;
  children: ReactNode;
  headerActions?: ReactNode;
  language?: "en" | "ka";
}

export function OceanPageLayout({
  title,
  titleKa,
  subtitle,
  subtitleKa,
  children,
  headerActions,
  language = "en",
}: OceanPageLayoutProps) {
  const displayTitle = language === "ka" && titleKa ? titleKa : title;
  const displaySubtitle = language === "ka" && subtitleKa ? subtitleKa : subtitle;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header with Wave Effect */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-white/10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="text-cyan-400">{title}</span>
                {titleKa && language === "ka" && (
                  <span className="text-white/80 ml-3">{titleKa}</span>
                )}
              </h1>
              {displaySubtitle && (
                <p className="text-white/60 mt-2">{displaySubtitle}</p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-3">{headerActions}</div>
            )}
          </div>
        </div>
        {/* Wave Effect SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[30px]"
            style={{ transform: "rotate(180deg)" }}
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              className="fill-slate-900/80"
              opacity=".25"
            />
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              className="fill-slate-900/60"
              opacity=".5"
            />
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              className="fill-slate-900"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">{children}</div>
    </div>
  );
}

// Ocean themed card styles for consistency
export const oceanCardStyles = {
  card: "bg-white/5 border-white/10 backdrop-blur-sm",
  cardHover: "bg-white/5 border-white/10 hover:bg-white/10 transition-all",
  cardHeader: "border-b border-white/10",
  title: "text-white",
  subtitle: "text-white/60",
  text: "text-white/80",
  muted: "text-white/40",
  accent: "text-cyan-400",
  input: "bg-white/10 border-white/20 text-white placeholder:text-white/40",
  button: "bg-cyan-600 hover:bg-cyan-700 text-white",
  buttonOutline: "border-white/20 text-white hover:bg-white/10",
  badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export default OceanPageLayout;
