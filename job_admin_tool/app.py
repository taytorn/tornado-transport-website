from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
import sys

app = Flask(__name__)

# Define paths to JSON data files
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
HEARTLAND_JOBS_FILE = os.path.join(DATA_DIR, 'heartland_jobs_updated.json')
MONTGOMERY_JOBS_FILE = os.path.join(DATA_DIR, 'montgomery_flatbed_jobs_updated.json')
LEASE_PURCHASE_JOBS_FILE = os.path.join(DATA_DIR, 'lease_purchase_job.json')

def load_all_jobs():
    """Load jobs from all JSON files and combine them"""
    all_jobs = []
    
    # Load Heartland jobs
    try:
        with open(HEARTLAND_JOBS_FILE, 'r') as f:
            heartland_data = json.load(f)
            for job in heartland_data.get('jobs', []):
                job['source'] = 'heartland'
                job['active'] = job.get('active', True)  # Default to active if not specified
                all_jobs.append(job)
    except Exception as e:
        print(f"Error loading Heartland jobs: {e}")
    
    # Load Montgomery jobs
    try:
        with open(MONTGOMERY_JOBS_FILE, 'r') as f:
            montgomery_data = json.load(f)
            for job in montgomery_data.get('jobs', []):
                job['source'] = 'montgomery'
                job['active'] = job.get('active', True)  # Default to active if not specified
                all_jobs.append(job)
    except Exception as e:
        print(f"Error loading Montgomery jobs: {e}")
    
    # Load Lease Purchase jobs
    try:
        with open(LEASE_PURCHASE_JOBS_FILE, 'r') as f:
            lease_data = json.load(f)
            for job in lease_data.get('jobs', []):
                job['source'] = 'lease'
                job['active'] = job.get('active', True)  # Default to active if not specified
                all_jobs.append(job)
    except Exception as e:
        print(f"Error loading Lease Purchase jobs: {e}")
    
    return all_jobs

def save_job(job):
    """Save a job to its source file"""
    source = job.pop('source', None)  # Remove source from job before saving
    
    if source == 'heartland':
        file_path = HEARTLAND_JOBS_FILE
    elif source == 'montgomery':
        file_path = MONTGOMERY_JOBS_FILE
    elif source == 'lease':
        file_path = LEASE_PURCHASE_JOBS_FILE
    else:
        return False
    
    try:
        # Load the current file
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        # Find and update the job
        for i, existing_job in enumerate(data['jobs']):
            if str(existing_job['id']) == str(job['id']):
                data['jobs'][i] = job
                break
        else:
            # Job not found, add it
            data['jobs'].append(job)
        
        # Save the updated file
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        return True
    except Exception as e:
        print(f"Error saving job: {e}")
        return False

def delete_job(job_id, source):
    """Delete a job from its source file"""
    if source == 'heartland':
        file_path = HEARTLAND_JOBS_FILE
    elif source == 'montgomery':
        file_path = MONTGOMERY_JOBS_FILE
    elif source == 'lease':
        file_path = LEASE_PURCHASE_JOBS_FILE
    else:
        return False
    
    try:
        # Load the current file
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        # Find and remove the job
        data['jobs'] = [job for job in data['jobs'] if str(job['id']) != str(job_id)]
        
        # Save the updated file
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        return True
    except Exception as e:
        print(f"Error deleting job: {e}")
        return False

def toggle_job_active(job_id, source, active):
    """Toggle a job's active status"""
    if source == 'heartland':
        file_path = HEARTLAND_JOBS_FILE
    elif source == 'montgomery':
        file_path = MONTGOMERY_JOBS_FILE
    elif source == 'lease':
        file_path = LEASE_PURCHASE_JOBS_FILE
    else:
        return False
    
    try:
        # Load the current file
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        # Find and update the job
        for job in data['jobs']:
            if str(job['id']) == str(job_id):
                job['active'] = active
                break
        
        # Save the updated file
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        return True
    except Exception as e:
        print(f"Error toggling job active status: {e}")
        return False

def toggle_all_jobs(active):
    """Toggle all jobs' active status"""
    success = True
    
    # Toggle Heartland jobs
    try:
        with open(HEARTLAND_JOBS_FILE, 'r') as f:
            data = json.load(f)
        
        for job in data['jobs']:
            job['active'] = active
        
        with open(HEARTLAND_JOBS_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error toggling Heartland jobs: {e}")
        success = False
    
    # Toggle Montgomery jobs
    try:
        with open(MONTGOMERY_JOBS_FILE, 'r') as f:
            data = json.load(f)
        
        for job in data['jobs']:
            job['active'] = active
        
        with open(MONTGOMERY_JOBS_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error toggling Montgomery jobs: {e}")
        success = False
    
    # Toggle Lease Purchase jobs
    try:
        with open(LEASE_PURCHASE_JOBS_FILE, 'r') as f:
            data = json.load(f)
        
        for job in data['jobs']:
            job['active'] = active
        
        with open(LEASE_PURCHASE_JOBS_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error toggling Lease Purchase jobs: {e}")
        success = False
    
    return success

@app.route('/')
def index():
    """Render the main admin page"""
    return render_template('index.html')

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    """API endpoint to get all jobs"""
    jobs = load_all_jobs()
    return jsonify(jobs)

@app.route('/api/job', methods=['POST'])
def save_job_api():
    """API endpoint to save a job"""
    job = request.json
    success = save_job(job)
    return jsonify({'success': success})

@app.route('/api/job/<job_id>/<source>', methods=['DELETE'])
def delete_job_api(job_id, source):
    """API endpoint to delete a job"""
    success = delete_job(job_id, source)
    return jsonify({'success': success})

@app.route('/api/job/toggle/<job_id>/<source>', methods=['POST'])
def toggle_job_api(job_id, source):
    """API endpoint to toggle a job's active status"""
    active = request.json.get('active', True)
    success = toggle_job_active(job_id, source, active)
    return jsonify({'success': success})

@app.route('/api/jobs/toggle-all', methods=['POST'])
def toggle_all_jobs_api():
    """API endpoint to toggle all jobs' active status"""
    active = request.json.get('active', True)
    success = toggle_all_jobs(active)
    return jsonify({'success': success})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
