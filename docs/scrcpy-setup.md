# scrcpy - Phone Screen Mirroring Setup

Guide for mirroring Android phone screen on desktop for mobile testing.

## Quick Start (If Already Connected)

If you recently used scrcpy and didn't reboot the phone:

```bash
adb connect 192.168.10.101:5555
scrcpy
```

**⚠️ If you get "Connection refused":** Skip to "Reconnecting After Reboot" below!

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

## Reconnecting After Reboot (Common!)

**If phone rebooted or you get "Connection refused":**

The TCP mode resets! You need to re-enable it via USB:

```bash
# 1. Connect USB cable to phone
# 2. Run:
adb devices          # Should show device connected via USB
adb tcpip 5555       # Re-enable TCP mode
# 3. Disconnect USB cable
# 4. Connect via WiFi:
adb connect 192.168.10.101:5555
scrcpy
```

**This is NOT a one-time setup** - you'll need to do this every time the phone reboots or loses TCP connection!

## Troubleshooting

**Phone not detected via USB:**
- Check USB debugging is enabled
- Accept the authorization popup on phone
- Try a different USB cable/port

**WiFi connection still fails:**
- Make sure phone and computer are on the same WiFi network
- Check the phone's IP address hasn't changed (Settings → About → Status)

## Why This Setup?

Perfect for mobile web app testing:
- See phone screen on desktop monitor
- Take screenshots directly from desktop
- Paste screenshots into VS Code chat
- Control phone with mouse/keyboard
- No need to constantly grab the physical phone

## Related

This setup was created for testing the **Sigalacifra** mobile responsiveness improvements. See `CLAUDE.md` for project context.
