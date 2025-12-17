# QR Code Generator Pro 🎨

A modern, feature-rich QR code generator built with React, TypeScript, and Tailwind CSS. Create customizable QR codes for URLs, text, contacts, and WiFi networks with advanced styling options.

![QR Code Generator](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Vite](https://img.shields.io/badge/Vite-7-646cff)

## ✨ Features

### Core Functionality
- 🔗 **URL QR Codes** - Automatic https:// formatting for direct browser opening
- 📝 **Text QR Codes** - Encode any text content
- 👤 **Contact QR Codes** - Generate vCard format for instant contact saving
- 📶 **WiFi QR Codes** - Share WiFi credentials instantly (WPA, WPA2, WPA3, WEP)

### Customization Options
- 🎨 **Color Customization** - Custom foreground and background colors
- 📏 **Size Control** - Adjustable QR code size (200px - 500px)
- 🖼️ **Logo Upload** - Add custom logos to QR code center
- ✏️ **Style Options** - Square, Rounded, or Dots patterns
- ⚠️ **Contrast Checker** - Real-time contrast ratio validation for scannability

### Advanced Features
- 📊 **History Tracking** - Save and reload previous QR codes
- 📈 **Analytics Dashboard** - Track generation and reload statistics
- 💾 **Download** - Export as high-quality PNG images
- 📤 **Share** - Native share API support (mobile) or clipboard copy (desktop)

## 🚀 Live Demo

[View Live Demo](https://your-app.vercel.app) *(Update with your deployed URL)*

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **QR Generation:** QRious (via CDN)

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## ⚡ Quick Start

### Installation
```bash
# Clone the repository
git clone https://github.com/KamranX07/qr_code_generator.git

# Navigate to project directory
cd qr_code_generator

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app running.

### Build for Production
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 📁 Project Structure
```
qr-code-generator-pro/
├── public/
│   └── logo.svg              # App favicon
├── src/
│   ├── assets/               # Static assets
│   ├── components/           # React components
│   │   └── Logo.tsx          # Logo component
│   ├── QRCodeGenerator.tsx   # Main app component
│   ├── App.tsx               # App entry point
│   ├── main.tsx              # React DOM entry
│   └── index.css             # Tailwind imports
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind configuration (if using v3)
└── package.json              # Project dependencies
```

## 🎯 Usage Examples

### Generate URL QR Code
1. Select **URL** tab
2. Enter website URL (e.g., `google.com`)
3. Click **Generate QR Code**
4. Customize colors, size, or add logo
5. Download or share

### Create WiFi QR Code
1. Select **WiFi** tab
2. Enter network SSID
3. Enter password
4. Choose encryption type (WPA/WPA2/WPA3)
5. Generate and share with guests

### Add Custom Logo
1. Generate any QR code
2. Open **Customization** panel
3. Click **Upload Image** under "Add Logo"
4. Select your logo image
5. Logo appears in QR code center

## 🎨 Customization

### Color Contrast Warning
The app automatically checks color contrast ratios:
- ✅ **3:1 or higher** - Good scannability
- ⚠️ **Below 3:1** - Warning shown (may not scan well)

**Best Practices:**
- Use dark foreground on light background
- Or light foreground on dark background
- Avoid: Red on black, yellow on white, etc.

### Supported WiFi Encryption Types
- **WPA/WPA2-PSK** - Most common for home networks
- **WPA2-Enterprise (EAP)** - Corporate networks
- **WPA3** - Latest security standard
- **WPA3-Personal (SAE)** - Modern personal security
- **WEP** - Legacy (not recommended)
- **Open Network** - No password

## 📱 Mobile Support

- ✅ Fully responsive design
- ✅ Touch-friendly interface
- ✅ Native share sheet on mobile
- ✅ Optimized for all screen sizes

## 🔧 Configuration

### Environment Variables
No environment variables required for basic usage.

### Custom Deployment Settings
For platforms like Vercel, Netlify:

**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`

## 🚀 Deployment

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Deploy to Netlify
```bash
# Build the project
npm run build

# Deploy dist folder to Netlify
# Or connect your GitHub repo on netlify.com
```

### Deploy to GitHub Pages
```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [QRious](https://github.com/neocotic/qrious) - QR code generation library
- [Lucide React](https://lucide.dev) - Beautiful icon library
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Vite](https://vitejs.dev) - Next generation frontend tooling

## 🐛 Known Issues

- Logo upload may not work optimally on very small QR codes (< 200px)
- Some older browsers may not support the native share API
- WPA3 QR codes require device support for WPA3

## ⭐ Star History

If you find this project useful, please consider giving it a star!
