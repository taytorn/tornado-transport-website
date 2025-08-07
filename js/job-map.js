// Job Map JavaScript for Tornado Transport
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    const map = L.map('job-map').setView([39.8283, -98.5795], 4); // Center of US

    // Add the tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);

    // Load job data from JSON file
    fetch('data/jobs.json')
        .then(response => response.json())
        .then(jobs => {
            // Store jobs globally
            window.tornadoJobs = jobs;
            
            // Render job markers
            renderJobMarkers(jobs);
            
            // Add event listeners to filter checkboxes
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    applyFilters();
                });
            });
            
            // Reset filters button
            document.getElementById('reset-filters').addEventListener('click', function() {
                document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = true;
                });
                applyFilters();
            });
        })
        .catch(error => {
            console.error('Error loading job data:', error);
            document.getElementById('job-map').innerHTML = '<div class="alert alert-danger">Error loading job map data. Please try again later.</div>';
        });

    // Markers and circles for jobs
    let jobMarkers = [];
    let jobCircles = [];

    // Function to render job markers on the map
    function renderJobMarkers(jobs) {
        // Clear existing markers and circles
        jobMarkers.forEach(marker => map.removeLayer(marker));
        jobCircles.forEach(circle => map.removeLayer(circle));
        jobMarkers = [];
        jobCircles = [];

        // Add markers for jobs
        jobs.forEach(job => {
            // Create marker
            const marker = L.marker([job.lat, job.lng])
                .bindPopup(createJobPopup(job))
                .addTo(map);
            
            // Create hiring radius circle
            const circle = L.circle([job.lat, job.lng], {
                color: '#FFD700',
                fillColor: '#FFD700',
                fillOpacity: 0.1,
                radius: job.hiringRadius * 1609.34 // Convert miles to meters
            }).addTo(map);
            
            jobMarkers.push(marker);
            jobCircles.push(circle);
        });

        // Update job count
        document.getElementById('job-count').textContent = jobs.length;
    }

    // Function to create job popup content
    function createJobPopup(job) {
        return `
            <div class="job-popup">
                <h3>${job.title}</h3>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Pay:</strong> ${job.pay}</p>
                <p><strong>Experience:</strong> ${job.experience}</p>
                <p><strong>Equipment:</strong> ${job.equipment}</p>
                <p>${job.description}</p>
                <a href="https://intelliapp.driverapponline.com/c/truckers4hire?r=UthemesT" 
                   class="apply-btn" target="_blank">Apply Now</a>
            </div>
        `;
    }

    // Function to apply filters
    function applyFilters() {
        // Get filter values
        const jobTypeFilters = getCheckedValues('job-type');
        const experienceFilters = getCheckedValues('experience');
        const equipmentFilters = getCheckedValues('equipment');
        const regionFilters = getCheckedValues('region');

        // Filter jobs based on selected criteria
        const filteredJobs = window.tornadoJobs.filter(job => {
            return (jobTypeFilters.length === 0 || jobTypeFilters.includes(job.type)) &&
                   (experienceFilters.length === 0 || experienceFilters.includes(job.experience)) &&
                   (equipmentFilters.length === 0 || equipmentFilters.includes(job.equipment)) &&
                   (regionFilters.length === 0 || regionFilters.includes(job.region));
        });

        // Render filtered jobs
        renderJobMarkers(filteredJobs);
    }

    // Function to get checked values from checkboxes
    function getCheckedValues(name) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
        return Array.from(checkboxes).map(cb => cb.value);
    }

    // Admin panel access (Ctrl+Shift+A)
    let adminMode = false;
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            adminMode = !adminMode;
            toggleAdminPanel();
        }
    });

    function toggleAdminPanel() {
        let adminPanel = document.getElementById('admin-panel');
        if (adminMode) {
            if (!adminPanel) {
                createAdminPanel();
            } else {
                adminPanel.style.display = 'block';
            }
        } else {
            if (adminPanel) {
                adminPanel.style.display = 'none';
            }
        }
    }

    function createAdminPanel() {
        const panel = document.createElement('div');
        panel.id = 'admin-panel';
        panel.className = 'admin-panel';
        panel.innerHTML = `
            <h3>Job Map Admin Panel</h3>
            <p>Add, edit, or remove job listings</p>
            <div class="admin-controls">
                <button id="add-job">Add New Job</button>
                <button id="export-jobs">Export Jobs</button>
                <button id="close-admin">Close Panel</button>
            </div>
            <div id="job-list" class="job-list">
                <h4>Current Jobs</h4>
                <ul id="admin-job-list"></ul>
            </div>
            <div id="job-form" class="job-form" style="display: none;">
                <h4 id="form-title">Add New Job</h4>
                <form id="admin-job-form">
                    <input type="hidden" id="job-id">
                    <div class="form-group">
                        <label for="job-title">Job Title</label>
                        <input type="text" id="job-title" required>
                    </div>
                    <div class="form-group">
                        <label for="job-type">Job Type</label>
                        <select id="job-type" required>
                            <option value="OTR">OTR</option>
                            <option value="Regional">Regional</option>
                            <option value="Local">Local</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="job-location">Location</label>
                        <input type="text" id="job-location" required>
                    </div>
                    <div class="form-group">
                        <label for="job-lat">Latitude</label>
                        <input type="number" id="job-lat" step="0.0001" required>
                    </div>
                    <div class="form-group">
                        <label for="job-lng">Longitude</label>
                        <input type="number" id="job-lng" step="0.0001" required>
                    </div>
                    <div class="form-group">
                        <label for="job-radius">Hiring Radius (miles)</label>
                        <input type="number" id="job-radius" required>
                    </div>
                    <div class="form-group">
                        <label for="job-pay">Pay Range</label>
                        <input type="text" id="job-pay" required>
                    </div>
                    <div class="form-group">
                        <label for="job-experience">Experience</label>
                        <select id="job-experience" required>
                            <option value="Experienced (1+ years)">Experienced (1+ years)</option>
                            <option value="Recent Graduate">Recent Graduate</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="job-equipment">Equipment</label>
                        <select id="job-equipment" required>
                            <option value="Dry Van">Dry Van</option>
                            <option value="Refrigerated">Refrigerated</option>
                            <option value="Flatbed">Flatbed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="job-region">Region</label>
                        <select id="job-region" required>
                            <option value="Midwest">Midwest</option>
                            <option value="Northeast">Northeast</option>
                            <option value="Southeast">Southeast</option>
                            <option value="Southwest">Southwest</option>
                            <option value="West">West</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="job-description">Description</label>
                        <textarea id="job-description" required></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit">Save Job</button>
                        <button type="button" id="cancel-form">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(panel);

        // Admin panel event listeners
        document.getElementById('close-admin').addEventListener('click', function() {
            adminMode = false;
            toggleAdminPanel();
        });

        document.getElementById('add-job').addEventListener('click', function() {
            showJobForm();
        });

        document.getElementById('cancel-form').addEventListener('click', function() {
            hideJobForm();
        });

        document.getElementById('export-jobs').addEventListener('click', function() {
            exportJobs();
        });

        document.getElementById('admin-job-form').addEventListener('submit', function(e) {
            e.preventDefault();
            saveJob();
        });

        updateAdminJobList();
    }

    function updateAdminJobList() {
        const jobList = document.getElementById('admin-job-list');
        if (!jobList) return;

        jobList.innerHTML = '';
        window.tornadoJobs.forEach(job => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${job.title} (${job.location})</span>
                <div class="job-actions">
                    <button class="edit-job" data-id="${job.id}">Edit</button>
                    <button class="delete-job" data-id="${job.id}">Delete</button>
                </div>
            `;
            jobList.appendChild(li);
        });

        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-job').forEach(button => {
            button.addEventListener('click', function() {
                const jobId = parseInt(this.getAttribute('data-id'));
                editJob(jobId);
            });
        });

        document.querySelectorAll('.delete-job').forEach(button => {
            button.addEventListener('click', function() {
                const jobId = parseInt(this.getAttribute('data-id'));
                deleteJob(jobId);
            });
        });
    }

    function showJobForm(job = null) {
        const jobForm = document.getElementById('job-form');
        const formTitle = document.getElementById('form-title');
        
        if (job) {
            formTitle.textContent = 'Edit Job';
            document.getElementById('job-id').value = job.id;
            document.getElementById('job-title').value = job.title;
            document.getElementById('job-type').value = job.type;
            document.getElementById('job-location').value = job.location;
            document.getElementById('job-lat').value = job.lat;
            document.getElementById('job-lng').value = job.lng;
            document.getElementById('job-radius').value = job.hiringRadius;
            document.getElementById('job-pay').value = job.pay;
            document.getElementById('job-experience').value = job.experience;
            document.getElementById('job-equipment').value = job.equipment;
            document.getElementById('job-region').value = job.region;
            document.getElementById('job-description').value = job.description;
        } else {
            formTitle.textContent = 'Add New Job';
            document.getElementById('admin-job-form').reset();
            document.getElementById('job-id').value = '';
        }
        
        jobForm.style.display = 'block';
        document.getElementById('job-list').style.display = 'none';
    }

    function hideJobForm() {
        document.getElementById('job-form').style.display = 'none';
        document.getElementById('job-list').style.display = 'block';
    }

    function saveJob() {
        const jobId = document.getElementById('job-id').value;
        const newJob = {
            id: jobId ? parseInt(jobId) : Date.now(),
            title: document.getElementById('job-title').value,
            type: document.getElementById('job-type').value,
            location: document.getElementById('job-location').value,
            lat: parseFloat(document.getElementById('job-lat').value),
            lng: parseFloat(document.getElementById('job-lng').value),
            hiringRadius: parseInt(document.getElementById('job-radius').value),
            pay: document.getElementById('job-pay').value,
            experience: document.getElementById('job-experience').value,
            equipment: document.getElementById('job-equipment').value,
            region: document.getElementById('job-region').value,
            description: document.getElementById('job-description').value
        };

        if (jobId) {
            // Update existing job
            const index = window.tornadoJobs.findIndex(job => job.id === parseInt(jobId));
            if (index !== -1) {
                window.tornadoJobs[index] = newJob;
            }
        } else {
            // Add new job
            window.tornadoJobs.push(newJob);
        }

        // Update the map and admin panel
        applyFilters();
        updateAdminJobList();
        hideJobForm();
    }

    function editJob(jobId) {
        const job = window.tornadoJobs.find(job => job.id === jobId);
        if (job) {
            showJobForm(job);
        }
    }

    function deleteJob(jobId) {
        if (confirm('Are you sure you want to delete this job?')) {
            window.tornadoJobs = window.tornadoJobs.filter(job => job.id !== jobId);
            applyFilters();
            updateAdminJobList();
        }
    }

    function exportJobs() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.tornadoJobs, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "tornado_transport_jobs.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
});
