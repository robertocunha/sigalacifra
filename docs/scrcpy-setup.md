# scrcpy - Phone Screen Mirroring Setup

Guide for mirroring Android phone screen on desktop for mobile testing.

## Quick Start (After Initial Setup)

Connect to phone via WiFi and start mirroring:

```bash
adb connect 192.168.10.101:5555
scrcpy
```

## Keyboard Shortcuts

- **Close**: `Ctrl+C` in terminal or close the window
- **Fullscreen**: `Ctrl+F`
- **Back to original size**: `Ctrl+X`
- **Copy/paste**: Works between desktop and phone!
- **Click and control**: Mouse works directly on the mirrored screen

## Initial Setup (One-time)

### 1. Install Tools

```bash
sudo apt install scrcpy adb -y
```

### 2. Enable USB Debugging on Phone

1. Go to **Settings → About phone**
2. Tap **Build number** 7 times (enables developer mode)
3. Go back and enter **Developer options**
4. Enable **USB debugging**

### 3. Connect via USB (First Time)

1. Connect USB cable
2. Allow USB debugging popup on phone
3. Verify connection:
```bash
adb devices
```
Should show: `device` (not `unauthorized`)

### 4. Switch to WiFi

```bash
adb tcpip 5555
adb shell ip addr show wlan0 | grep 'inet ' | awk '{print $2}' | cut -d/ -f1
# Note the IP address (e.g., 192.168.10.101)
adb connect [PHONE_IP]:5555
```

Now you can disconnect the USB cable!

## Troubleshooting

**Phone not detected:**
- Check USB debugging is enabled
- Accept the authorization popup on phone
- Try a different USB cable/port

**WiFi connection fails:**
- Make sure phone and computer are on the same WiFi network
- Check the phone's IP address hasn't changed
- Reconnect via USB and run `adb tcpip 5555` again

**To reconnect after reboot:**
```bash
adb connect 192.168.10.101:5555
scrcpy
```

## Why This Setup?

Perfect for mobile web app testing:
- See phone screen on desktop monitor
- Take screenshots directly from desktop
- Paste screenshots into VS Code chat
- Control phone with mouse/keyboard
- No need to constantly grab the physical phone

## Related

This setup was created for testing the **Sigalacifra** mobile responsiveness improvements. See `CLAUDE.md` for project context.
