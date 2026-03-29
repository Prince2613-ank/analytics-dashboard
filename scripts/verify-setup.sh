#!/bin/bash
cd "$(dirname "$0")/.."

echo "🔍 Analytics Dashboard - Setup Verification"
echo "==========================================="
echo ""

# Check backend files
echo "Backend files:"
if [ -f "backend/main.py" ]; then echo "  ✅ main.py"; else echo "  ❌ main.py"; fi
if [ -f "backend/requirements.txt" ]; then echo "  ✅ requirements.txt"; else echo "  ❌ requirements.txt"; fi

echo ""
echo "Frontend files:"
# Check frontend files
if [ -f "frontend/package.json" ]; then echo "  ✅ package.json"; else echo "  ❌ package.json"; fi
if [ -f "frontend/vite.config.js" ]; then echo "  ✅ vite.config.js"; else echo "  ❌ vite.config.js"; fi
if [ -f "frontend/index.html" ]; then echo "  ✅ index.html"; else echo "  ❌ index.html"; fi

echo ""
echo "Frontend components:"
if [ -f "frontend/src/App.jsx" ]; then echo "  ✅ App.jsx"; else echo "  ❌ App.jsx"; fi
if [ -f "frontend/src/components/Dashboard.jsx" ]; then echo "  ✅ Dashboard.jsx"; else echo "  ❌ Dashboard.jsx"; fi
if [ -f "frontend/src/components/panels/ChartPanel.jsx" ]; then echo "  ✅ ChartPanel.jsx"; else echo "  ❌ ChartPanel.jsx"; fi
if [ -f "frontend/src/components/panels/TablePanel.jsx" ]; then echo "  ✅ TablePanel.jsx"; else echo "  ❌ TablePanel.jsx"; fi
if [ -f "frontend/src/components/panels/LogsPanel.jsx" ]; then echo "  ✅ LogsPanel.jsx"; else echo "  ❌ LogsPanel.jsx"; fi

echo ""
echo "Frontend services:"
if [ -f "frontend/src/services/api.js" ]; then echo "  ✅ api.js"; else echo "  ❌ api.js"; fi
if [ -f "frontend/src/services/layoutService.js" ]; then echo "  ✅ layoutService.js"; else echo "  ❌ layoutService.js"; fi

echo ""
echo "Frontend utilities:"
if [ -f "frontend/src/utils/panelRegistry.js" ]; then echo "  ✅ panelRegistry.js"; else echo "  ❌ panelRegistry.js"; fi

echo ""
echo "Documentation:"
if [ -f "README.md" ]; then echo "  ✅ README.md"; else echo "  ❌ README.md"; fi
if [ -f "ARCHITECTURE.md" ]; then echo "  ✅ ARCHITECTURE.md"; else echo "  ❌ ARCHITECTURE.md"; fi
if [ -f ".gitignore" ]; then echo "  ✅ .gitignore"; else echo "  ❌ .gitignore"; fi

echo ""
echo "✅ Verification complete!"
echo ""
echo "Next steps:"
echo "1. Run: bash setup.sh"
echo "2. Run: bash start-dev.sh"
echo "3. Visit: http://localhost:5173"
