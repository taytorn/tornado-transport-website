#!/usr/bin/env python3
import json
import os

# Define paths to JSON data files
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
HEARTLAND_JOBS_FILE = os.path.join(DATA_DIR, 'heartland_jobs_updated.json')
MONTGOMERY_JOBS_FILE = os.path.join(DATA_DIR, 'montgomery_flatbed_jobs_updated.json')
LEASE_PURCHASE_JOBS_FILE = os.path.join(DATA_DIR, 'lease_purchase_job.json')

# Define default coordinates for common locations
DEFAULT_COORDINATES = {
    # Nationwide/regions
    "Nationwide": {"lat": 39.8283, "lng": -98.5795},  # Center of US
    "Eastern US": {"lat": 39.0119, "lng": -77.3585},  # Approximate center of Eastern US
    "Western US": {"lat": 40.7608, "lng": -111.8910},  # Salt Lake City (Western hub)
    "Southeast": {"lat": 33.7490, "lng": -84.3880},  # Atlanta (Southeast hub)
    "Southern California": {"lat": 34.0522, "lng": -118.2437},  # Los Angeles
    "Central & Eastern US": {"lat": 39.9612, "lng": -82.9988},  # Columbus, OH (Central-Eastern hub)
    "Peninsular Florida": {"lat": 28.5383, "lng": -81.3792},  # Orlando, FL
    "Texas & Louisiana Gulf Coast": {"lat": 29.7604, "lng": -95.3698},  # Houston, TX
    "Western & Northern US": {"lat": 44.9778, "lng": -93.2650},  # Minneapolis, MN
    
    # Cities
    "Atlanta, GA": {"lat": 33.7490, "lng": -84.3880},
    "Columbus, GA": {"lat": 32.4610, "lng": -84.9877},
    "Nashville, TN": {"lat": 36.1627, "lng": -86.7816},
    "Los Angeles, CA": {"lat": 34.0522, "lng": -118.2437}
}

def assign_coordinates_to_jobs():
    """Assign coordinates to all jobs in the JSON files"""
    files_updated = 0
    jobs_updated = 0
    
    # Process Heartland jobs
    try:
        with open(HEARTLAND_JOBS_FILE, 'r') as f:
            heartland_data = json.load(f)
        
        updated = False
        for job in heartland_data.get('jobs', []):
            if not (job.get('latitude') and job.get('longitude')) and not job.get('coordinates'):
                location = job.get('location', '')
                if location in DEFAULT_COORDINATES:
                    job['coordinates'] = DEFAULT_COORDINATES[location]
                    updated = True
                    jobs_updated += 1
                else:
                    # Assign default US center if no match
                    job['coordinates'] = DEFAULT_COORDINATES["Nationwide"]
                    updated = True
                    jobs_updated += 1
        
        if updated:
            with open(HEARTLAND_JOBS_FILE, 'w') as f:
                json.dump(heartland_data, f, indent=2)
            files_updated += 1
            print(f"Updated Heartland jobs file with coordinates")
    except Exception as e:
        print(f"Error processing Heartland jobs: {e}")
    
    # Process Montgomery jobs
    try:
        with open(MONTGOMERY_JOBS_FILE, 'r') as f:
            montgomery_data = json.load(f)
        
        updated = False
        for job in montgomery_data.get('jobs', []):
            if not (job.get('latitude') and job.get('longitude')) and not job.get('coordinates'):
                location = job.get('location', '')
                if location in DEFAULT_COORDINATES:
                    job['coordinates'] = DEFAULT_COORDINATES[location]
                    updated = True
                    jobs_updated += 1
                else:
                    # Assign default US center if no match
                    job['coordinates'] = DEFAULT_COORDINATES["Nationwide"]
                    updated = True
                    jobs_updated += 1
        
        if updated:
            with open(MONTGOMERY_JOBS_FILE, 'w') as f:
                json.dump(montgomery_data, f, indent=2)
            files_updated += 1
            print(f"Updated Montgomery jobs file with coordinates")
    except Exception as e:
        print(f"Error processing Montgomery jobs: {e}")
    
    # Process Lease Purchase jobs
    try:
        with open(LEASE_PURCHASE_JOBS_FILE, 'r') as f:
            lease_data = json.load(f)
        
        updated = False
        for job in lease_data.get('jobs', []):
            if not (job.get('latitude') and job.get('longitude')) and not job.get('coordinates'):
                location = job.get('location', '')
                if location in DEFAULT_COORDINATES:
                    job['coordinates'] = DEFAULT_COORDINATES[location]
                    updated = True
                    jobs_updated += 1
                else:
                    # Assign default US center if no match
                    job['coordinates'] = DEFAULT_COORDINATES["Nationwide"]
                    updated = True
                    jobs_updated += 1
        
        if updated:
            with open(LEASE_PURCHASE_JOBS_FILE, 'w') as f:
                json.dump(lease_data, f, indent=2)
            files_updated += 1
            print(f"Updated Lease Purchase jobs file with coordinates")
    except Exception as e:
        print(f"Error processing Lease Purchase jobs: {e}")
    
    return files_updated, jobs_updated

if __name__ == "__main__":
    files_updated, jobs_updated = assign_coordinates_to_jobs()
    print(f"Completed! Updated {jobs_updated} jobs across {files_updated} files.")
