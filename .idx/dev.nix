{pkgs}: {
  channel = "stable-24.05";
  
  packages = [
    pkgs.nodejs_22
    pkgs.pnpm
    pkgs.mysql80
    pkgs.git
  ];
  
  idx.extensions = [
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "bradlc.vscode-tailwindcss"
    "ms-vscode.vscode-typescript-next"
  ];
  
  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = [
          "pnpm"
          "run"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--host"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
  
  # Environment variables
  env = {
    VITE_APP_TITLE = "ORBI City Hub";
    VITE_APP_LOGO = "/logo.png";
    VITE_OAUTH_PORTAL_URL = "https://oauth.example.com";
    VITE_APP_ID = "orbi-city-hub";
    VITE_SUPABASE_URL = "https://your-project.supabase.co";
    VITE_SUPABASE_PUBLISHABLE_KEY = "your-publishable-key";
    VITE_FRONTEND_FORGE_API_KEY = "your-forge-api-key";
    VITE_FRONTEND_FORGE_API_URL = "https://forge.butterfly-effect.dev";
    VITE_ANALYTICS_ENDPOINT = "https://analytics.example.com";
    VITE_ANALYTICS_WEBSITE_ID = "orbi-city-hub";
  };
}
