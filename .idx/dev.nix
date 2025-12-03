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
      };
    };
  };
}
