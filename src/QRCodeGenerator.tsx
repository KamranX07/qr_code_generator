import React, { useState, useEffect, useRef } from 'react';
import { Globe, MessageSquare, User, Download, Share2, Wifi, History, BarChart3, Settings, Upload, X } from 'lucide-react';

// Declare QRious type for the external library
declare global {
  interface Window {
    QRious: any;
  }
}

interface HistoryItem {
  id: number;
  type: string;
  value: string;
  timestamp: string;
  customization: {
    fgColor: string;
    bgColor: string;
    qrSize: number;
    qrStyle: string;
  };
}

interface ScanCount {
  [key: number]: number;
}

export default function QRCodeGenerator() {
  const [activeTab, setActiveTab] = useState<string>('url');
  const [qrValue, setQrValue] = useState<string>('');
  const [showQR, setShowQR] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // URL fields
  const [url, setUrl] = useState<string>('');
  
  // Text fields
  const [text, setText] = useState<string>('');
  
  // Contact fields
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  
  // WiFi fields
  const [ssid, setSsid] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const [encryption, setEncryption] = useState<string>('WPA');
  const [hidden, setHidden] = useState<boolean>(false);
  
  // Customization options
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [qrSize, setQrSize] = useState<number>(300);
  const [qrStyle, setQrStyle] = useState<string>('square');
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [showCustomization, setShowCustomization] = useState<boolean>(false);
  
  // History and Analytics
  const [qrHistory, setQrHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [scanCount, setScanCount] = useState<ScanCount>({});

  // Check color contrast for scannability
  const getContrastRatio = (fg: string, bg: string): number => {
    const getLuminance = (hex: string): number => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const l1 = getLuminance(fg);
    const l2 = getLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  };
  
  const contrastRatio = getContrastRatio(fgColor, bgColor);
  const hasGoodContrast = contrastRatio >= 3;

  const formatUrl = (input: string): string => {
    if (!input) return '';
    const trimmed = input.trim();
    if (trimmed.match(/^[a-zA-Z]+:\/\//)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const generateVCard = (): string => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName};${firstName};;;`,
      `FN:${firstName} ${lastName}`,
      organization ? `ORG:${organization}` : '',
      phone ? `TEL:${phone}` : '',
      email ? `EMAIL:${email}` : '',
      'END:VCARD'
    ].filter(line => line).join('\n');
    
    return vcard;
  };
  
  const generateWiFi = (): string => {
    return `WIFI:T:${encryption};S:${ssid};P:${wifiPassword};H:${hidden};`;
  };

  useEffect(() => {
    if (showQR && qrValue && canvasRef.current) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
      script.async = true;
      
      script.onload = () => {
        if (window.QRious) {
          new window.QRious({
            element: canvasRef.current,
            value: qrValue,
            size: qrSize,
            level: 'H',
            foreground: fgColor,
            background: bgColor
          });
          
          // Add logo if present
          if (logoImage && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const img = new Image();
              img.onload = () => {
                const logoSize = qrSize * 0.2;
                const x = (qrSize - logoSize) / 2;
                const y = (qrSize - logoSize) / 2;
                
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
                ctx.drawImage(img, x, y, logoSize, logoSize);
              };
              img.src = logoImage;
            }
          }
        }
      };
      
      document.body.appendChild(script);
      
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [showQR, qrValue, qrSize, fgColor, bgColor, qrStyle, logoImage]);

  const handleGenerate = () => {
    let value = '';
    let type = activeTab;
    
    if (activeTab === 'url') {
      value = formatUrl(url);
    } else if (activeTab === 'text') {
      value = text;
    } else if (activeTab === 'contact') {
      value = generateVCard();
    } else if (activeTab === 'wifi') {
      value = generateWiFi();
    }
    
    setQrValue(value);
    setShowQR(true);
    
    const historyItem: HistoryItem = {
      id: Date.now(),
      type,
      value,
      timestamp: new Date().toISOString(),
      customization: { fgColor, bgColor, qrSize, qrStyle }
    };
    
    setQrHistory(prev => [historyItem, ...prev.slice(0, 9)]);
    setScanCount(prev => ({ ...prev, [historyItem.id]: 0 }));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      alert('QR code not found. Please generate a QR code first.');
      return;
    }

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download QR code: ' + (error as Error).message);
    }
  };
  
  const handleShare = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      alert('QR code not found. Please generate a QR code first.');
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        alert('Failed to process QR code. Please try again.');
        return;
      }

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'qrcode.png', { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: 'QR Code',
            text: 'Check out this QR code!'
          }).catch((error) => {
            if (error.name !== 'AbortError') {
              copyToClipboard(blob);
            }
          });
          return;
        }
      }
      
      copyToClipboard(blob);
    });
  };
  
  const copyToClipboard = (blob: Blob) => {
    if (navigator.clipboard && window.ClipboardItem) {
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).then(() => {
        alert('✓ QR code copied to clipboard! You can now paste it anywhere.');
      }).catch((err) => {
        console.error('Clipboard failed:', err);
        alert('Unable to share or copy. Please use the Download button instead.');
      });
    } else {
      alert('Share and copy features are not supported on this browser. Please use the Download button instead.');
    }
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeLogo = () => {
    setLogoImage(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };
  
  const loadFromHistory = (item: HistoryItem) => {
    setQrValue(item.value);
    setFgColor(item.customization.fgColor);
    setBgColor(item.customization.bgColor);
    setQrSize(item.customization.qrSize);
    setQrStyle(item.customization.qrStyle);
    setShowQR(true);
    setShowHistory(false);
    
    setScanCount(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const isFormValid = (): boolean => {
    if (activeTab === 'url') return url.trim() !== '';
    if (activeTab === 'text') return text.trim() !== '';
    if (activeTab === 'contact') return firstName.trim() !== '' || lastName.trim() !== '' || phone.trim() !== '' || email.trim() !== '';
    if (activeTab === 'wifi') return ssid.trim() !== '';
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">QR Code Generator Pro</h1>
          <p className="text-gray-600">Create customizable QR codes with advanced features</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b">
              <button
                onClick={() => setActiveTab('url')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'url'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Globe size={18} />
                URL
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'text'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare size={18} />
                Text
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'contact'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User size={18} />
                Contact
              </button>
              <button
                onClick={() => setActiveTab('wifi')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'wifi'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Wifi size={18} />
                WiFi
              </button>
            </div>

            {/* Form Content */}
            <div className="mb-6">
              {activeTab === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="example.com or https://example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    We'll automatically add https:// if needed
                  </p>
                </div>
              )}

              {activeTab === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Content
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter any text you want to encode..."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Company Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
              
              {activeTab === 'wifi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Network Name (SSID)</label>
                    <input
                      type="text"
                      value={ssid}
                      onChange={(e) => setSsid(e.target.value)}
                      placeholder="MyWiFiNetwork"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="WiFi password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Encryption</label>
                    <select
                      value={encryption}
                      onChange={(e) => setEncryption(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="WPA">WPA/WPA2-PSK (Most Common)</option>
                      <option value="WPA2-EAP">WPA2-Enterprise (EAP)</option>
                      <option value="WPA3">WPA3 (Latest & Most Secure)</option>
                      <option value="SAE">WPA3-Personal (SAE)</option>
                      <option value="WEP">WEP (Legacy - Not Recommended)</option>
                      <option value="nopass">Open Network (No Password)</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {encryption === 'WPA' && 'Standard security for most home networks'}
                      {encryption === 'WPA2-EAP' && 'Enterprise networks with authentication server'}
                      {encryption === 'WPA3' && 'Latest security standard, not all devices support it yet'}
                      {encryption === 'SAE' && 'Modern personal network security'}
                      {encryption === 'WEP' && 'Outdated and insecure, only for legacy devices'}
                      {encryption === 'nopass' && 'No password required, not secure'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hidden"
                      checked={hidden}
                      onChange={(e) => setHidden(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="hidden" className="text-sm text-gray-700">Hidden Network</label>
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!isFormValid()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Generate QR Code
            </button>

            {/* QR Code Display */}
            {showQR && qrValue && (
              <div className="mt-8 text-center">
                <div className="inline-block p-6 bg-white border-4 border-gray-200 rounded-xl">
                  <canvas ref={canvasRef}></canvas>
                </div>
                <div className="mt-4 flex gap-3 justify-center flex-wrap">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <Download size={20} />
                    Download
                  </button>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 bg-purple-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    <Share2 size={20} />
                    Share
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customization Panel */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <button
                onClick={() => setShowCustomization(!showCustomization)}
                className="w-full flex items-center justify-between mb-4"
              >
                <div className="flex items-center gap-2">
                  <Settings size={20} />
                  <h3 className="font-semibold text-gray-800">Customization</h3>
                </div>
              </button>
              
              {showCustomization && (
                <div className="space-y-4">
                  {/* Contrast Warning */}
                  {!hasGoodContrast && (
                    <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                      <p className="text-xs text-yellow-800 font-medium">
                        ⚠️ Low Contrast Warning
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Your color combination may not scan well. For best results, use high contrast colors (dark on light or light on dark).
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Contrast ratio: {contrastRatio.toFixed(1)}:1 (recommended: 3:1 minimum)
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Foreground Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size: {qrSize}px</label>
                    <input
                      type="range"
                      min="200"
                      max="500"
                      value={qrSize}
                      onChange={(e) => setQrSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                    <select
                      value={qrStyle}
                      onChange={(e) => setQrStyle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="square">Square</option>
                      <option value="rounded">Rounded</option>
                      <option value="dots">Dots</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Logo</label>
                    {logoImage ? (
                      <div className="flex items-center gap-2">
                        <img src={logoImage} alt="Logo" className="w-12 h-12 object-cover rounded" />
                        <button
                          onClick={removeLogo}
                          className="flex items-center gap-1 text-red-600 text-sm hover:text-red-700"
                        >
                          <X size={16} />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                        >
                          <Upload size={16} />
                          <span className="text-sm">Upload Image</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* History Panel */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between mb-4"
              >
                <div className="flex items-center gap-2">
                  <History size={20} />
                  <h3 className="font-semibold text-gray-800">History</h3>
                </div>
                <span className="text-sm text-gray-500">{qrHistory.length}</span>
              </button>
              
              {showHistory && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {qrHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No history yet</p>
                  ) : (
                    qrHistory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">{item.type}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">{item.value}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Analytics Panel */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={20} />
                <h3 className="font-semibold text-gray-800">Analytics</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Generated:</span>
              <span className="font-semibold text-gray-800">{qrHistory.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Reloads:</span>
              <span className="font-semibold text-gray-800">
                {Object.values(scanCount).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}