# Mobile Testing Setup

To test this application on your mobile device (on the same WiFi network), follow these steps:

## 1. Network Access

The dev server is configured to bind to `0.0.0.0`, making it accessible on your local network.

1. Find your local IP address:
   - macOS: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Windows: `ipconfig`
   - You can also run `node scripts/get-network-ip.js` in this project.
2. Open your mobile browser and navigate to `http://<YOUR_LOCAL_IP>:3000`.

## 2. Firewall Settings

### macOS
If you see a "Cannot Connect" error, ensure the macOS firewall allows incoming connections for Node.js:
1. Go to **System Settings > Network > Firewall**.
2. Click **Options**.
3. Ensure **Node** or **Next.js** (or the terminal you use) is set to **Allow incoming connections**.

### Windows
1. Go to **Control Panel > System and Security > Windows Defender Firewall**.
2. Click **Allow an app or feature through Windows Defender Firewall**.
3. Find **Node.js JavaScript Runtime** and ensure both **Private** and **Public** are checked.

## 3. HTTPS (Optional but Recommended)

For features like camera access on mobile, you might need HTTPS.

### Setup mkcert
1. Install `mkcert`:
   - macOS: `brew install mkcert`
   - Windows: `choco install mkcert`
2. Install the local CA:
   - `mkcert -install`
3. Generate certificates for your local IP and localhost:
   - `mkdir -p certs`
   - `mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1 <YOUR_LOCAL_IP>`

### Run with HTTPS
Update your dev script or run:
`npm run dev-https`

## 4. Router Settings
Ensure your router does not have "AP Isolation" (Access Point Isolation) enabled, as this prevents devices on the same WiFi from communicating with each other.
