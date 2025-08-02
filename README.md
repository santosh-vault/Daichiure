# Daichiure Project

## Quick Start

You can now run the development server from either directory:

### Option 1: From parent directory (daichiure/)

```bash
npm run dev
```

### Option 2: From project directory (daichiure/Daichiure/)

```bash
cd Daichiure
npm run dev
```

### Option 3: Using convenience scripts

- **Windows Batch**: Double-click `dev.bat`
- **PowerShell**: Run `.\dev.ps1`

## Available Commands (from parent directory)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:netlify` - Build for Netlify deployment
- `npm run build:vercel` - Build for Vercel deployment
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run install` - Install dependencies in the project directory

## Project Structure

```
daichiure/
├── package.json          # Wrapper package (convenience commands)
├── dev.bat              # Windows batch script
├── dev.ps1              # PowerShell script
├── README.md            # This file
└── Daichiure/           # Main project directory
    ├── package.json     # Main project package
    ├── src/            # Source code
    ├── public/         # Public assets
    └── ...             # Other project files
```
