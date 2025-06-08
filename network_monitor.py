#!/usr/bin/env python3
"""
Network Usage Monitor - Installation and Runtime Script
Monitors network usage for a specific SSID with minimal resource footprint
"""

import os
import sys
import time
import json
import logging
import subprocess
import threading
import argparse
from datetime import datetime
from pathlib import Path
import base64

# Configuration paths
if getattr(sys, 'frozen', False):
    # Running as compiled executable
    CONFIG_DIR = Path(os.path.dirname(sys.executable)) / '.network_monitor'
else:
    # Running as script
    CONFIG_DIR = Path.home() / '.network_monitor'

CONFIG_FILE = CONFIG_DIR / "config.json"
LOG_FILE = CONFIG_DIR / "monitor.log"
DATA_FILE = CONFIG_DIR / "network_usage.json"
SCRIPT_FILE = CONFIG_DIR / "network_monitor.py"

# Ensure config directory exists
CONFIG_DIR.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)


class NetworkMonitor:
    def __init__(self, config):
        self.target_ssid = config.get('target_ssid', '')
        self.poll_interval = config.get('poll_interval', 5)
        self.debug = config.get('debug', False)
        self.last_bytes_sent = 0
        self.last_bytes_recv = 0
        self.usage_data = self.load_data()
        self.connected_to_target = False
        
    def load_data(self):
        """Load existing usage data"""
        if DATA_FILE.exists():
            try:
                with open(DATA_FILE, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def save_data(self):
        """Save usage data to file"""
        with open(DATA_FILE, 'w') as f:
            json.dump(self.usage_data, f, indent=2)
    
    def get_current_ssid(self):
        """Get current WiFi SSID - cross platform"""
        try:
            system = sys.platform
            
            if system == "darwin":  # macOS
                cmd = ["/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport", "-I"]
                output = subprocess.check_output(cmd).decode()
                for line in output.split('\n'):
                    if ' SSID' in line:
                        return line.split(':')[1].strip()
                        
            elif system == "win32":  # Windows
                cmd = ["netsh", "wlan", "show", "interfaces"]
                output = subprocess.check_output(cmd).decode()
                for line in output.split('\n'):
                    if 'SSID' in line and 'BSSID' not in line:
                        return line.split(':')[1].strip()
                        
            else:  # Linux
                cmd = ["nmcli", "-t", "-f", "active,ssid", "dev", "wifi"]
                output = subprocess.check_output(cmd).decode()
                for line in output.split('\n'):
                    if line.startswith('yes:'):
                        return line.split(':')[1].strip()
                        
        except Exception as e:
            if self.debug:
                logging.error(f"Error getting SSID: {e}")
        return None
    
    def get_network_stats(self):
        """Get network statistics - cross platform"""
        try:
            if sys.platform == "win32":
                # Windows - try multiple methods
                
                # Method 1: PowerShell (most reliable)
                try:
                    ps_cmd = [
                        "powershell", "-Command",
                        "Get-NetAdapterStatistics | Select-Object -Property ReceivedBytes, SentBytes | ConvertTo-Json"
                    ]
                    output = subprocess.check_output(ps_cmd, stderr=subprocess.DEVNULL).decode()
                    data = json.loads(output)
                    
                    total_recv = 0
                    total_sent = 0
                    
                    if isinstance(data, list):
                        for adapter in data:
                            total_recv += adapter.get('ReceivedBytes', 0)
                            total_sent += adapter.get('SentBytes', 0)
                    elif isinstance(data, dict):
                        total_recv = data.get('ReceivedBytes', 0)
                        total_sent = data.get('SentBytes', 0)
                    
                    if total_recv > 0 or total_sent > 0:
                        return total_recv, total_sent
                except:
                    pass
                
                # Method 2: netstat -e (fallback)
                try:
                    cmd = ["netstat", "-e"]
                    output = subprocess.check_output(cmd).decode()
                    lines = output.strip().split('\n')
                    
                    for i, line in enumerate(lines):
                        if 'Bytes' in line and 'Received' in line and 'Sent' in line:
                            if i + 1 < len(lines):
                                data_line = lines[i + 1].strip()
                                parts = data_line.split()
                                if len(parts) >= 3 and parts[0] == 'Bytes':
                                    return int(parts[1]), int(parts[2])
                except:
                    pass
                    
            else:
                # Unix-based systems
                with open('/proc/net/dev', 'r') as f:
                    lines = f.readlines()
                
                for line in lines[2:]:
                    if ':' in line:
                        parts = line.split()
                        interface = parts[0].strip(':')
                        if interface != 'lo':
                            bytes_recv = int(parts[1])
                            bytes_sent = int(parts[9])
                            return bytes_recv, bytes_sent
                            
        except Exception as e:
            if self.debug:
                logging.error(f"Error getting network stats: {e}")
        return 0, 0
    
    def update_usage(self):
        """Update network usage if connected to target SSID"""
        current_ssid = self.get_current_ssid()
        
        # Check if we're connected to the target network
        if current_ssid != self.target_ssid:
            if self.connected_to_target:
                # Just disconnected from target network
                logging.info(f"Disconnected from target network '{self.target_ssid}'")
                self.connected_to_target = False
                # Reset counters
                self.last_bytes_recv = 0
                self.last_bytes_sent = 0
            return
        
        # We're connected to the target network
        if not self.connected_to_target:
            # Just connected to target network
            logging.info(f"Connected to target network '{self.target_ssid}'")
            self.connected_to_target = True
            # Initialize counters
            bytes_recv, bytes_sent = self.get_network_stats()
            self.last_bytes_recv = bytes_recv
            self.last_bytes_sent = bytes_sent
            return
        
        # Get current stats
        bytes_recv, bytes_sent = self.get_network_stats()
        
        # Calculate delta (handle counter resets)
        if self.last_bytes_recv > 0 and bytes_recv >= self.last_bytes_recv:
            delta_recv = bytes_recv - self.last_bytes_recv
            delta_sent = bytes_sent - self.last_bytes_sent
        else:
            delta_recv = 0
            delta_sent = 0
        
        self.last_bytes_recv = bytes_recv
        self.last_bytes_sent = bytes_sent
        
        # Update usage data
        today = datetime.now().strftime("%Y-%m-%d")
        if today not in self.usage_data:
            self.usage_data[today] = {
                "download": 0,
                "upload": 0,
                "sessions": []
            }
        
        if delta_recv > 0 or delta_sent > 0:
            self.usage_data[today]["download"] += delta_recv
            self.usage_data[today]["upload"] += delta_sent
            
            # Log session info
            self.usage_data[today]["sessions"].append({
                "time": datetime.now().isoformat(),
                "download": delta_recv,
                "upload": delta_sent
            })
            
            # Save data
            self.save_data()
            
            # Log current usage
            total_today = (self.usage_data[today]["download"] + 
                          self.usage_data[today]["upload"]) / (1024 * 1024)
            
            if self.debug:
                print(f"Usage today on '{self.target_ssid}': {total_today:.2f} MB")
    
    def run(self):
        """Main monitoring loop"""
        logging.info(f"Network monitor started for SSID: {self.target_ssid}")
        print(f"Monitoring network usage for SSID: {self.target_ssid}")
        print(f"Data saved to: {DATA_FILE}")
        print("Press Ctrl+C to stop...")
        
        while True:
            try:
                self.update_usage()
            except Exception as e:
                logging.error(f"Monitor error: {e}")
            
            time.sleep(self.poll_interval)


class Installer:
    def __init__(self):
        self.config = self.load_config()
    
    def load_config(self):
        """Load existing configuration"""
        if CONFIG_FILE.exists():
            try:
                with open(CONFIG_FILE, 'r') as f:
                    return json.load(f)
            except:
                pass
        return {}
    
    def save_config(self, config):
        """Save configuration"""
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
    
    def get_available_ssids(self):
        """Get list of available WiFi networks"""
        ssids = []
        try:
            if sys.platform == "win32":
                cmd = ["netsh", "wlan", "show", "networks"]
                output = subprocess.check_output(cmd).decode()
                for line in output.split('\n'):
                    if 'SSID' in line and ':' in line:
                        ssid = line.split(':', 1)[1].strip()
                        if ssid and ssid not in ssids:
                            ssids.append(ssid)
            elif sys.platform == "darwin":
                cmd = ["/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport", "-s"]
                output = subprocess.check_output(cmd).decode()
                for line in output.split('\n')[1:]:
                    parts = line.split()
                    if parts:
                        ssid = parts[0]
                        if ssid not in ssids:
                            ssids.append(ssid)
            else:  # Linux
                cmd = ["nmcli", "-f", "SSID", "dev", "wifi"]
                output = subprocess.check_output(cmd).decode()
                for line in output.split('\n')[1:]:
                    ssid = line.strip()
                    if ssid and ssid not in ssids:
                        ssids.append(ssid)
        except:
            pass
        return ssids
    
    def get_current_ssid(self):
        """Get currently connected SSID"""
        monitor = NetworkMonitor({})
        return monitor.get_current_ssid()
    
    def interactive_setup(self):
        """Interactive setup wizard with back navigation"""
        current_step = 1
        target_ssid = None
        poll_interval = 5
        setup_cancelled = False

        while not setup_cancelled:
            print("\n" + "="*50)
            print("Network Usage Monitor - Setup Wizard")
            print("="*50 + "\n")

            # Step 1: Network Selection
            if current_step == 1:
                # Get current SSID
                current_ssid = self.get_current_ssid()
                if current_ssid:
                    print(f"Currently connected to: {current_ssid}")

                # Get available SSIDs
                print("\nScanning for available networks...")
                available_ssids = self.get_available_ssids()

                print("\nSelect the network to monitor:")
                print("1. Use current network" + (f" ({current_ssid})" if current_ssid else " (not connected)"))
                
                if available_ssids:
                    print("2. Choose from available networks")
                print("3. Enter network name manually")
                print("0. Cancel setup")

                choice = input("\nEnter your choice (0-3): ").strip()

                if choice == "0":
                    setup_cancelled = True
                    print("\nSetup cancelled.")
                elif choice == "1" and current_ssid:
                    target_ssid = current_ssid
                    current_step = 2
                elif choice == "2" and available_ssids:
                    while True:
                        print("\nAvailable networks:")
                        for i, ssid in enumerate(available_ssids, 1):
                            print(f"{i}. {ssid}")
                        print("0. Go back")

                        try:
                            idx = input("\nSelect network number (or 0 to go back): ").strip()
                            if idx == "0":
                                break
                            idx = int(idx) - 1
                            if 0 <= idx < len(available_ssids):
                                target_ssid = available_ssids[idx]
                                current_step = 2
                                break
                            else:
                                print("Invalid selection, please try again.")
                        except ValueError:
                            print("Please enter a valid number.")
                elif choice == "3":
                    while True:
                        target_ssid = input("\nEnter network name (SSID) or '0' to go back: ").strip()
                        if target_ssid == "0":
                            break
                        if target_ssid:
                            current_step = 2
                            break
                        else:
                            print("Network name cannot be empty")
                else:
                    print("Invalid selection, please try again.")

            # Step 2: Polling Interval Configuration
            elif current_step == 2:
                print(f"\nNetwork to monitor: {target_ssid}")
                print("\nConfigure polling interval:")
                print("1. Use default (5 seconds)")
                print("2. Enter custom interval")
                print("0. Go back to network selection")

                choice = input("\nEnter your choice (0-2): ").strip()

                if choice == "0":
                    current_step = 1
                elif choice == "1":
                    poll_interval = 5
                    current_step = 3
                elif choice == "2":
                    while True:
                        interval = input("\nEnter polling interval in seconds (1-60): ").strip()
                        try:
                            poll_interval = int(interval)
                            if 1 <= poll_interval <= 60:
                                current_step = 3
                                break
                            else:
                                print("Interval must be between 1 and 60 seconds")
                        except ValueError:
                            print("Please enter a valid number.")
                else:
                    print("Invalid selection, please try again.")

            # Step 3: Confirmation and Save
            elif current_step == 3:
                print("\nConfiguration Summary:")
                print(f"- Network: {target_ssid}")
                print(f"- Poll interval: {poll_interval} seconds")
                print("\n1. Save configuration and exit")
                print("2. Change network")
                print("3. Change polling interval")
                print("0. Cancel without saving")

                choice = input("\nEnter your choice (0-3): ").strip()

                if choice == "1":
                    # Save configuration
                    self.config = {
                        'target_ssid': target_ssid,
                        'poll_interval': poll_interval,
                        'debug': False
                    }
                    self.save_config(self.config)
                    print("\nConfiguration saved successfully!")
                    return True
                elif choice == "2":
                    current_step = 1
                elif choice == "3":
                    current_step = 2
                elif choice == "0":
                    setup_cancelled = True
                    print("\nSetup cancelled.")
                else:
                    print("Invalid selection, please try again.")

        return False
    
    def create_startup_script(self):
        """Create platform-specific startup configuration"""
        # First, copy this script to config directory
        current_script = os.path.abspath(__file__)
        
        # Create the monitor script
        with open(SCRIPT_FILE, 'w') as f:
            with open(current_script, 'r') as source:
                f.write(source.read())
        
        system = sys.platform
        
        if system == "darwin":  # macOS
            self._create_macos_startup()
        elif system == "win32":  # Windows
            self._create_windows_startup()
        else:  # Linux
            self._create_linux_startup()
    
    def _create_macos_startup(self):
        """Create macOS LaunchAgent"""
        plist_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.network.monitor</string>
    <key>ProgramArguments</key>
    <array>
        <string>{sys.executable}</string>
        <string>{SCRIPT_FILE}</string>
        <string>--run</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>{LOG_FILE}</string>
    <key>StandardErrorPath</key>
    <string>{LOG_FILE}</string>
</dict>
</plist>"""
        
        plist_path = Path.home() / "Library/LaunchAgents/com.network.monitor.plist"
        plist_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(plist_path, 'w') as f:
            f.write(plist_content)
        
        print(f"\nCreated LaunchAgent at: {plist_path}")
        print("\nTo enable auto-start, run:")
        print(f"launchctl load {plist_path}")
        print("\nTo disable auto-start, run:")
        print(f"launchctl unload {plist_path}")
    
    def _create_windows_startup(self):
        """Create Windows startup entry"""
        import winreg
        
        try:
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, 
                               r"Software\Microsoft\Windows\CurrentVersion\Run", 
                               0, winreg.KEY_SET_VALUE)
            
            command = f'"{sys.executable}" "{SCRIPT_FILE}" --run'
            winreg.SetValueEx(key, "NetworkMonitor", 0, winreg.REG_SZ, command)
            winreg.CloseKey(key)
            
            print("\nAdded to Windows startup registry")
            print("The monitor will start automatically on next login")
            
            # Create batch file for manual start
            batch_file = CONFIG_DIR / "start_monitor.bat"
            with open(batch_file, 'w') as f:
                f.write(f'@echo off\n"{sys.executable}" "{SCRIPT_FILE}" --run\n')
            
            print(f"\nCreated batch file for manual start: {batch_file}")
            
        except Exception as e:
            print(f"\nError adding to startup: {e}")
            print("You can manually add the monitor to startup")
    
    def _create_linux_startup(self):
        """Create Linux systemd service"""
        service_content = f"""[Unit]
Description=Network Usage Monitor
After=network.target

[Service]
Type=simple
ExecStart={sys.executable} {SCRIPT_FILE} --run
Restart=always
User={os.getenv('USER')}

[Install]
WantedBy=default.target"""
        
        service_dir = Path.home() / ".config/systemd/user"
        service_dir.mkdir(parents=True, exist_ok=True)
        service_path = service_dir / "network-monitor.service"
        
        with open(service_path, 'w') as f:
            f.write(service_content)
        
        print(f"\nCreated systemd service at: {service_path}")
        print("\nTo enable auto-start, run:")
        print("systemctl --user enable network-monitor.service")
        print("systemctl --user start network-monitor.service")
        print("\nTo disable auto-start, run:")
        print("systemctl --user disable network-monitor.service")
        print("systemctl --user stop network-monitor.service")
    
    def install(self):
        """Run installation process"""
        if self.interactive_setup():
            print("\nDo you want to set up automatic startup? (y/n): ", end='')
            if input().strip().lower() == 'y':
                self.create_startup_script()
            
            print("\nInstallation complete!")
            print("\nYou can now:")
            print("1. Run the monitor manually with: python network_monitor.py --run")
            print("2. View usage data at: " + str(DATA_FILE))
            print("3. Check logs at: " + str(LOG_FILE))
            print("4. Reconfigure with: python network_monitor.py --install")
            
            print("\nStart monitoring now? (y/n): ", end='')
            if input().strip().lower() == 'y':
                self.run_monitor()
    
    def run_monitor(self):
        """Run the monitor with current configuration"""
        if not self.config.get('target_ssid'):
            print("No configuration found. Please run setup first.")
            print("Run: python network_monitor.py --install")
            return
        
        monitor = NetworkMonitor(self.config)
        try:
            monitor.run()
        except KeyboardInterrupt:
            print("\nMonitor stopped.")


def main():
    debug_log = CONFIG_DIR / 'startup_debug.log'
    with open(debug_log, 'w') as f:
        f.write(f"Starting at {datetime.now()}\n")
        f.write(f"sys.argv: {sys.argv}\n")
        f.write(f"sys.path: {sys.path}\n")
        f.write(f"os.getcwd(): {os.getcwd()}\n")
        f.write(f"CONFIG_DIR: {CONFIG_DIR}\n")
        
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Network Usage Monitor')
    parser.add_argument('--install', action='store_true', help='Run installation wizard')
    parser.add_argument('--run', action='store_true', help='Run the monitor')
    parser.add_argument('--config', action='store_true', help='Show current configuration')
    parser.add_argument('--stats', action='store_true', help='Show usage statistics')
    
    args = parser.parse_args()
    
    installer = Installer()
    
    if args.install:
        installer.install()
    elif args.run:
        installer.run_monitor()
    elif args.config:
        if installer.config:
            print("\nCurrent configuration:")
            print(json.dumps(installer.config, indent=2))
        else:
            print("No configuration found. Run with --install to set up.")
    elif args.stats:
        if DATA_FILE.exists():
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
            print("\nNetwork usage statistics:")
            for date, stats in sorted(data.items()):
                total_mb = (stats['download'] + stats['upload']) / (1024 * 1024)
                print(f"\n{date}:")
                print(f"  Download: {stats['download'] / (1024 * 1024):.2f} MB")
                print(f"  Upload: {stats['upload'] / (1024 * 1024):.2f} MB")
                print(f"  Total: {total_mb:.2f} MB")
        else:
            print("No usage data found.")
    else:
        # Default action when no arguments provided - run installation wizard
        installer.install()


if __name__ == "__main__":
    main()