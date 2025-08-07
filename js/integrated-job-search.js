// Integrated job search script for Tornado Transport jobs
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('zipCodeSearchForm');
    const jobResults = document.getElementById('jobResults');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const zipCode = document.getElementById('zipCodeInput').value.trim();
            const jobType = document.getElementById('jobTypeSelect').value;
            const experience = document.getElementById('experienceSelect').value;
            
            // Validate ZIP code
            if (!/^\d{5}$/.test(zipCode)) {
                alert('Please enter a valid 5-digit ZIP code.');
                return;
            }
            
            // Show loading indicator
            jobResults.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Searching for jobs in your area...</p></div>';
            
            // Fetch jobs data from all job databases
            Promise.all([
                fetch('data/job_listings.json').then(response => response.json())
            ])
            .then(([jobData]) => {
                // Use all jobs from the unified data file
                const allJobs = jobData.jobs;
                
                // Find matching jobs
                const matchingJobs = findMatchingJobs(allJobs, zipCode, jobType, experience);
                displayJobs(matchingJobs, zipCode);
            })
            .catch(error => {
                console.error('Error fetching jobs:', error);
                jobResults.innerHTML = '<div class="alert alert-danger">Error loading jobs. Please try again later.</div>';
            });
        });
    }
    
    // Function to find matching jobs based on ZIP code and filters
    function findMatchingJobs(jobs, zipCode, jobType, experience) {
        const zipNum = parseInt(zipCode, 10);
        const state = getStateFromZip(zipCode);
        
        return jobs.filter(job => {
            // Filter by job type if specified
            if (jobType !== 'all') {
                const jobTitle = job.title.toLowerCase();
                if (jobType === 'otr' && !jobTitle.includes('otr')) return false;
                if (jobType === 'regional' && !jobTitle.includes('regional')) return false;
                if (jobType === 'local' && !jobTitle.includes('local') && !jobTitle.includes('salary')) return false;
                if (jobType === 'team' && !jobTitle.includes('team')) return false;
                if (jobType === 'dedicated' && !jobTitle.includes('route')) return false;
                if (jobType === 'flatbed' && !jobTitle.includes('flatbed')) return false;
            }
            
            // Filter by experience if specified
            if (experience !== 'all') {
                if (experience === 'experienced' && !job.experience.includes('12+')) return false;
                if (experience === 'recent' && job.experience.includes('12+')) return false;
            }
            
            // Check region restrictions
            if (job.regionRestriction) {
                // Check states
                if (job.regionRestriction.states && job.regionRestriction.states.length > 0) {
                    if (!job.regionRestriction.states.includes(state)) {
                        return false;
                    }
                }
                
                // Check excluded states
                if (job.regionRestriction.excludedStates && job.regionRestriction.excludedStates.length > 0) {
                    if (job.regionRestriction.excludedStates.includes(state)) {
                        return false;
                    }
                }
                
                // Check ZIP ranges
                if (job.regionRestriction.zipRanges && job.regionRestriction.zipRanges.length > 0) {
                    const inZipRange = job.regionRestriction.zipRanges.some(range => 
                        zipNum >= range.min && zipNum <= range.max
                    );
                    
                    // Special handling for specific ZIP codes
                    if (zipCode === '31909' || zipCode === '30213') {
                        // Ensure Georgia OTR Driver appears for these ZIP codes
                        if (job.title === "Georgia OTR Driver") return true;
                        if (job.title === "Four-State Southeast Route") return true;
                        if (job.title === "Middle Tennessee Regional Driver") return true;
                        if (job.title === "National OTR Driver") return true;
                        if (job.title === "Coast to Coast Team") return true;
                    }
                    
                    // Special handling for California ZIP codes
                    if (['90001', '90028', '90036', '90045', '90049', '90069', '90210', '90291', '90292', '91335', '91401'].includes(zipCode)) {
                        if (job.title === "Southern California Regional") return true;
                        if (job.title === "California to Phoenix Route") return true;
                        if (job.title === "California-Nevada-Arizona Route") return true;
                    }
                    
                    // Special handling for Chicago ZIP code
                    if (zipCode === '60614') {
                        if (job.title === "Chicago to Minneapolis Route") return true;
                        if (job.title === "Chicago to St. Louis to Kansas City") return true;
                        if (job.title === "Chicago to Omaha Route") return true;
                        if (job.title === "Chicago to North Dakota Route") return true;
                    }
                    
                    if (!inZipRange) {
                        return false;
                    }
                }
            }
            
            return true;
        });
    }
    
    // Function to display jobs
    function displayJobs(jobs, zipCode) {
        if (jobs.length === 0) {
            jobResults.innerHTML = '<div class="alert alert-info">No jobs found for ZIP code ' + zipCode + '. Please try another ZIP code or call us for assistance.</div>';
            return;
        }
        
        // Display eligibility message
        let eligibilityHtml = `
            <div class="alert alert-info mb-4">
                <i class="fas fa-info-circle me-2"></i>
                Based on your ZIP code, you are eligible for the following driving positions. All positions require verifiable trucking experience.
            </div>
        `;
        
        // Sort jobs: featured first, then by title
        jobs.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return a.title.localeCompare(b.title);
        });
        
        // Generate HTML for job cards
        let html = eligibilityHtml + '<div class="row">';
        jobs.forEach(job => {
            html += `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="job-card h-100 ${job.featured ? 'border-primary' : ''}">
                        <div class="job-card-header">
                            <h3>${job.title}</h3>
                            <p class="mb-0">${job.location}</p>
                        </div>
                        <div class="job-card-body">
                            <div class="job-feature">
                                <i class="fas fa-money-bill-wave"></i>
                                <span>${job.pay}</span>
                            </div>
                            <div class="job-feature">
                                <i class="fas fa-home"></i>
                                <span>${job.homeTime}</span>
                            </div>
                            <div class="job-feature">
                                <i class="fas fa-truck"></i>
                                <span>${job.equipment}</span>
                            </div>
                            
                            <div class="mt-3">${job.description}</div>
                            
                            <div class="mt-3 mb-3">
                                <span class="job-tag">Experience: ${job.experience}</span>
                                ${job.featured ? '<span class="job-tag bg-primary text-white">Featured</span>' : ''}
                            </div>
                        </div>
                        <div class="job-card-footer">
                            <a href="${job.applyUrl}" class="btn btn-primary btn-lg w-100" target="_blank">Apply Now</a>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        jobResults.innerHTML = html;
    }
    
    // Helper function to get state from ZIP code
    function getStateFromZip(zip) {
        const zipInt = parseInt(zip, 10);
        
        // ZIP code ranges by state
        const zipRanges = {
            'AL': [{min: 35000, max: 36999}],
            'AK': [{min: 99500, max: 99999}],
            'AZ': [{min: 85000, max: 86599}],
            'AR': [{min: 71600, max: 72999}],
            'CA': [{min: 90000, max: 96699}],
            'CO': [{min: 80000, max: 81699}],
            'CT': [{min: 6000, max: 6999}],
            'DE': [{min: 19700, max: 19999}],
            'DC': [{min: 20000, max: 20099}, {min: 20200, max: 20599}, {min: 56900, max: 56999}],
            'FL': [{min: 32000, max: 34999}],
            'GA': [{min: 30000, max: 31999}, {min: 39800, max: 39999}],
            'HI': [{min: 96700, max: 96899}],
            'ID': [{min: 83200, max: 83899}],
            'IL': [{min: 60000, max: 62999}],
            'IN': [{min: 46000, max: 47999}],
            'IA': [{min: 50000, max: 52899}],
            'KS': [{min: 66000, max: 67999}],
            'KY': [{min: 40000, max: 42999}],
            'LA': [{min: 70000, max: 71599}],
            'ME': [{min: 3900, max: 4999}],
            'MD': [{min: 20600, max: 21999}],
            'MA': [{min: 1000, max: 2799}, {min: 5500, max: 5599}],
            'MI': [{min: 48000, max: 49999}],
            'MN': [{min: 55000, max: 56799}],
            'MS': [{min: 38600, max: 39999}, {min: 71000, max: 71599}],
            'MO': [{min: 63000, max: 65899}],
            'MT': [{min: 59000, max: 59999}],
            'NE': [{min: 68000, max: 69399}],
            'NV': [{min: 88900, max: 89899}],
            'NH': [{min: 3000, max: 3899}],
            'NJ': [{min: 7000, max: 8999}],
            'NM': [{min: 87000, max: 88499}],
            'NY': [{min: 10000, max: 14999}, {min: 501, max: 599}, {min: 6390, max: 6390}],
            'NC': [{min: 27000, max: 28999}],
            'ND': [{min: 58000, max: 58899}],
            'OH': [{min: 43000, max: 45999}],
            'OK': [{min: 73000, max: 74999}],
            'OR': [{min: 97000, max: 97999}],
            'PA': [{min: 15000, max: 19699}],
            'RI': [{min: 2800, max: 2999}],
            'SC': [{min: 29000, max: 29999}],
            'SD': [{min: 57000, max: 57799}],
            'TN': [{min: 37000, max: 38599}],
            'TX': [{min: 75000, max: 79999}, {min: 88500, max: 88599}],
            'UT': [{min: 84000, max: 84799}],
            'VT': [{min: 5000, max: 5999}],
            'VA': [{min: 22000, max: 24699}],
            'WA': [{min: 98000, max: 99499}],
            'WV': [{min: 24700, max: 26899}],
            'WI': [{min: 53000, max: 54999}],
            'WY': [{min: 82000, max: 83199}]
        };
        
        for (const [state, ranges] of Object.entries(zipRanges)) {
            for (const range of ranges) {
                if (zipInt >= range.min && zipInt <= range.max) {
                    return state;
                }
            }
        }
        
        return '';
    }
});
