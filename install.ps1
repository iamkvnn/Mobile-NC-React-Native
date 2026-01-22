# Install Script for Authentication App

Write-Host "🚀 Installing dependencies for Authentication App..." -ForegroundColor Cyan

# Navigate to project directory
Set-Location "d:\University\Third\MBNC\Ex\ex-app"

# Install required packages
Write-Host "`n📦 Installing core dependencies..." -ForegroundColor Yellow
npm install axios expo-blur expo-secure-store @react-native-async-storage/async-storage expo-linear-gradient

Write-Host "`n✅ Installation complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Make sure your backend API is running at http://localhost:8888/api/v1" -ForegroundColor White
Write-Host "  2. Run 'npm start' to start the development server" -ForegroundColor White
Write-Host "  3. Press 'a' for Android, 'i' for iOS, or 'w' for Web" -ForegroundColor White

Write-Host "`n🎉 Happy coding!" -ForegroundColor Magenta
