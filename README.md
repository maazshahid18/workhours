# WorkTime - Work Hours Calculator PWA

A beautiful Progressive Web App to calculate your work hours and know exactly when you can leave the office.

## ✨ Features

- ⏰ **Smart Time Calculation** - Calculate departure time based on arrival time
- 📊 **Customizable Settings** - Adjust required hours and buffer percentage
- 🕐 **12h/24h Format** - Toggle between time formats
- 💾 **LocalStorage Persistence** - Remembers your settings throughout the day
- 📱 **PWA Support** - Install as a native app on any device
- 🎨 **Beautiful UI** - Modern dark theme with smooth animations
- 📴 **Offline Support** - Works without internet connection

## 🚀 Installation

### As a Web App (Desktop)

1. Visit the deployed URL
2. Look for the install icon in your browser's address bar
3. Click "Install" to add WorkTime to your applications

**Chrome/Edge:**
- Click the ⊕ icon in the address bar
- Or click the three dots menu → "Install WorkTime"

**Safari:**
- File → Add to Dock

### As a Mobile App (iOS)

1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### As a Mobile App (Android)

1. Open the app in Chrome
2. Tap the three dots menu
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install"

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📦 Tech Stack

- **Next.js 16** - React framework
- **next-pwa** - PWA support
- **CSS Modules** - Scoped styling
- **LocalStorage API** - Data persistence

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import repository in Vercel
3. Deploy automatically

### Manual Deployment

```bash
npm run build
npm start
```

## 📱 PWA Features

- ✅ Installable on all devices
- ✅ Works offline
- ✅ Fast loading with service workers
- ✅ App-like experience
- ✅ Home screen icon
- ✅ Splash screen
- ✅ Standalone mode (no browser UI)

## 🎯 Usage

1. **Set Arrival Time** - Enter when you arrived at work
2. **Customize Settings** (optional) - Adjust required hours, buffer %, time format
3. **Calculate** - Click the Calculate button
4. **Track Progress** - Watch the real-time countdown
5. **Leave on Time** - Get notified when you can leave!

## 🔧 Configuration

The app uses these default settings:
- **Required Hours:** 9 hours
- **Buffer:** 5% (27 minutes)
- **Time Format:** 24-hour

All settings are customizable and persist throughout the day.

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Feel free to open issues or submit PRs.

---

Made with ❤️ for productive teams
