import nmap
import socket
import subprocess
import platform
from ipaddress import IPv4Network
import time
import json
import sys
import concurrent.futures


def get_current_ip():
    """Returns the current IP address of the machine."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0)
        s.connect(('8.8.8.8', 80))
        current_ip = s.getsockname()[0]
        s.close()
        return current_ip
    except Exception as e:
        return None

def scan_network(ip):
    """Scans the network for active devices."""
    try:
        subnet = '.'.join(ip.split('.')[:3]) + '.0/24'

        devices = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            futures = []
            for addr in IPv4Network(subnet, strict=False):
                addr_str = str(addr)
                if addr_str == ip:
                    continue
                futures.append(executor.submit(ping_device, addr_str))

            for future in concurrent.futures.as_completed(futures):
                result = future.result()
                if result:
                    devices.append(result)

        return devices
    except Exception as e:
        return []

def ping_device(addr_str):
    """Pings a device to check if it is active."""
    try:
        ping_command = (
            ['ping', '-c', '1', '-W', '1', addr_str] if platform.system().lower() != 'windows'
            else ['ping', '-n', '1', '-w', '1000', addr_str]
        )
        result = subprocess.run(ping_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if result.returncode == 0:
            return addr_str
        return None
    except Exception as e:
        return None

def identify_device_type(ip):
    """Identifies the type of a device using nmap."""
    nm = nmap.PortScanner()
    try:
        nm.scan(ip, '22-443', arguments='-O -A')
        
        device_info = nm[ip]
        hostnames = [host['name'] for host in device_info.hostnames()] if 'hostnames' in device_info else []
        os = device_info['osmatch'][0]['name'] if 'osmatch' in device_info and device_info['osmatch'] else "Unknown"
        open_ports = list(device_info['tcp'].keys()) if 'tcp' in device_info else []

        return {
            'IP': ip,
            'Hostnames': hostnames,
            'OS': os,
            'Open Ports': open_ports
        }
    except Exception as e:
        return None

def get_devices_info(devices):
    """Fetches detailed information about each device."""
    device_info_list = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(identify_device_type, device): device for device in devices}
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            if result:
                device_info_list.append(result)
    return device_info_list

if __name__ == "__main__":
    try:
        ip = get_current_ip()
        if ip:
            
            devices = scan_network(ip)
            
            devices_info = get_devices_info(devices)
            
            # Output the result as JSON
            print(json.dumps(devices_info, indent=4))
        else:
            print(json.dumps({"error": "Could not determine the IP address."}))
    except Exception as e:
        print(json.dumps({"error": f"Error scanning network: {str(e)}"}))