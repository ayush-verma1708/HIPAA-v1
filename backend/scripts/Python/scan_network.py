from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, OperationFailure, WriteError
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# MongoDB connection string
MONGO_URI = "mongodb+srv://admin:qwerTy_@hipaa.5dfhx.mongodb.net/dpdp-v1?retryWrites=true&w=majority"  # Replace with your MongoDB URI if different

def connect_and_insert(mongo_uri):
    """Connect to MongoDB using the URI, insert data into the default 'test' database."""
    try:
        # Connect to MongoDB
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        logging.info("Connected to MongoDB.")

        # Verify MongoDB connection
        try:
            client.admin.command("ping")
            logging.info("MongoDB connection verified.")
        except ServerSelectionTimeoutError as sste:
            logging.error("MongoDB connection timeout.")
            raise sste

        # Use the 'test' database and 'default_collection'
        db_name = "dpdp-v1"
        collection_name = "default_collection"
        db = client[db_name]
        collection = db[collection_name]

        logging.info(f"Using database: {db_name}, collection: {collection_name}")

        # Dummy data to insert
        dummy_data = {
            "name": "Default Test Entry",
            "description": "This entry is added to the default 'test' database.",
        }

        # Insert the data
        try:
            result = collection.insert_one(dummy_data)
            logging.info(f"Inserted data with ID: {result.inserted_id}")
        except WriteError as we:
            logging.error(f"Write failed: {we}")
            raise we

        # Retrieve the inserted data
        try:
            inserted_data = collection.find_one({"_id": result.inserted_id})
            logging.info(f"Retrieved data: {inserted_data}")
        except OperationFailure as oe:
            logging.error(f"Failed to retrieve data: {oe}")
            raise oe

        return inserted_data

    except ServerSelectionTimeoutError as sste:
        logging.error(f"Connection timeout: {sste}")
        raise sste
    except OperationFailure as oe:
        logging.error(f"Operation failed: {oe}")
        raise oe
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        raise e

if __name__ == "__main__":
    try:
        # Insert and retrieve data
        data = connect_and_insert(MONGO_URI)
        print("Inserted and Retrieved Data:", data)
    except Exception as e:
        logging.error(f"Script failed: {e}")

# import nmap
# import socket
# import subprocess
# import platform
# from ipaddress import IPv4Network
# import time
# import json
# import sys
# import concurrent.futures
# import logging
# import uuid
# import pytz
# import datetime
# from pymongo import MongoClient
# from dotenv import load_dotenv
# import os

# # Configure logging
# logging.basicConfig(filename='network_scan.log', level=logging.ERROR, 
#                     format='%(asctime)s:%(levelname)s:%(message)s')

# # Load environment variables from .env file
# load_dotenv()

# MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
# DB_NAME = os.getenv('DB_NAME', 'network_scans')

# def get_current_ip():
#     """Returns the current IP address of the machine."""
#     try:
#         hostname = socket.gethostname()
#         current_ip = socket.gethostbyname(hostname)
#         return current_ip
#     except Exception as e:
#         logging.error(f"Error getting current IP: {e}")
#         return None

# def scan_network(ip):
#     """Scans the network for active devices."""
#     try:
#         subnet = '.'.join(ip.split('.')[:3]) + '.0/24'

#         devices = []
#         with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
#             futures = []
#             for addr in IPv4Network(subnet, strict=False):
#                 addr_str = str(addr)
#                 if addr_str == ip:
#                     continue
#                 futures.append(executor.submit(ping_device, addr_str))

#             for future in concurrent.futures.as_completed(futures):
#                 result = future.result()
#                 if result:
#                     devices.append(result)

#         return devices
#     except Exception as e:
#         return []

# def ping_device(addr_str):
#     """Pings a device to check if it is active."""
#     try:
#         ping_command = (
#             ['ping', '-c', '1', '-W', '1', addr_str] if platform.system().lower() != 'windows'
#             else ['ping', '-n', '1', '-w', '1000', addr_str]
#         )
#         result = subprocess.run(ping_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
#         if result.returncode == 0:
#             return addr_str
#         return None
#     except Exception as e:
#         return None

# def identify_device_type(ip):
#     """Identifies the type of a device using nmap."""
#     nm = nmap.PortScanner()
#     try:
#         nm.scan(ip, '22-443', arguments='-O -A', timeout=60)
        
#         device_info = nm[ip]
#         hostnames = [host['name'] for host in device_info.hostnames()] if 'hostnames' in device_info else []
#         os = device_info['osmatch'][0]['name'] if 'osmatch' in device_info and device_info['osmatch'] else "Unknown"
#         open_ports = list(device_info['tcp'].keys()) if 'tcp' in device_info else []
#         mac = device_info['addresses']['mac'] if 'addresses' in device_info and 'mac' in device_info['addresses'] else "Unknown"
#         vendor = device_info['vendor'][mac] if 'vendor' in device_info and mac in device_info['vendor'] else "Unknown"

#         return {
#             'IP': ip,
#             'Hostnames': hostnames,
#             'OS': os,
#             'Open Ports': open_ports,
#             'MAC': mac,
#             'Vendor': vendor
#         }
#     except Exception as e:
#         logging.error(f"Error identifying device type for {ip}: {e}")
#         return None

# def get_devices_info(devices):
#     """Fetches detailed information about each device."""
#     device_info_list = []
#     with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
#         futures = {executor.submit(identify_device_type, device): device for device in devices}
#         for future in concurrent.futures.as_completed(futures):
#             result = future.result()
#             if result:
#                 device_info_list.append(result)
#                 logging.info(f"Discovered device: {result}")
#     return device_info_list

# def generate_scan_id():
#     """Generates a unique ID for each scan."""
#     return str(uuid.uuid4())

# def save_results_to_file(devices_info, scan_id, filename='devices_info.json'):
#     """Saves the devices information to a file."""
#     try:
#         results = {
#             'scan_id': scan_id,
#             'timestamp': time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(pytz.timezone('Asia/Kolkata').localize(datetime.datetime.now()).utctimetuple())),
#             'devices': devices_info
#         }
        
#         # Load existing data
#         try:
#             with open(filename, 'r') as file:
#                 existing_data = json.load(file)
#         except FileNotFoundError:
#             existing_data = []

#         # Append new results
#         existing_data.append(results)

#         # Save updated data
#         with open(filename, 'w') as file:
#             json.dump(existing_data, file, indent=4)
#     except Exception as e:
#         logging.error(f"Error saving results to file: {e}")

# def save_results_to_mongo(devices_info, scan_id, mongo_uri=MONGO_URI, db_name=DB_NAME, collection_name='scans'):
#     """Saves the devices information to a MongoDB collection."""
#     try:
#         client = MongoClient(mongo_uri)
#         db = client[db_name]
#         collection = db[collection_name]

#         results = {
#             'scan_id': scan_id,
#             'timestamp': time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(pytz.timezone('Asia/Kolkata').localize(datetime.datetime.now()).utctimetuple())),
#             'devices': devices_info
#         }

#         collection.insert_one(results)
#         logging.info(f"Results saved to MongoDB with scan_id: {scan_id}")
#     except Exception as e:
#         logging.error(f"Error saving results to MongoDB: {e}")

# if __name__ == "__main__":
#     try:
#         scan_id = generate_scan_id()
#         ip = get_current_ip()
#         if ip:
#             devices = scan_network(ip)
#             if not devices:
#                 logging.error("No devices found on the network.")
#                 print(json.dumps({"error": "No devices found on the network."}))
#                 sys.exit(1)
            
#             devices_info = get_devices_info(devices)
#             if not devices_info:
#                 logging.error("No detailed information found for devices.")
#                 print(json.dumps({"error": "No detailed information found for devices."}))
#                 sys.exit(1)
            
#             # Output the result as JSON
#             print(json.dumps({'scan_id': scan_id, 'devices': devices_info}, indent=4))
            
#             # Save the results to a file
#             save_results_to_file(devices_info, scan_id)
            
#             # Save the results to MongoDB
#             save_results_to_mongo(devices_info, scan_id)
#         else:
#             logging.error("Could not determine the IP address.")
#             print(json.dumps({"error": "Could not determine the IP address."}))
#             sys.exit(1)
#     except Exception as e:
#         logging.error(f"Error scanning network: {e}")
#         print(json.dumps({"error": f"Error scanning network: {str(e)}"}))
#         sys.exit(1)