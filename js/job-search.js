// Enhanced ZIP code matching logic for Tornado Transport job search
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('job-search-form');
    const resultsContainer = document.getElementById('job-results');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'block';
            }
            
            // Clear previous results
            if (resultsContainer) {
                resultsContainer.innerHTML = '';
            }
            
            const zipCode = document.getElementById('zip-code').value.trim();
            
            // Validate ZIP code format
            if (!/^\d{5}$/.test(zipCode)) {
                if (resultsContainer) {
                    resultsContainer.innerHTML = '<div class="alert alert-danger">Please enter a valid 5-digit ZIP code.</div>';
                }
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
                return;
            }
            
            // Fetch jobs data
            fetch('data/jobs.json')
                .then(response => response.json())
                .then(data => {
                    setTimeout(() => {
                        const matchedJobs = findMatchingJobs(data.jobs, zipCode);
                        displayResults(matchedJobs);
                        
                        // Hide loading indicator
                        if (loadingIndicator) {
                            loadingIndicator.style.display = 'none';
                        }
                    }, 1000); // Simulate loading for better UX
                })
                .catch(error => {
                    console.error('Error fetching jobs:', error);
                    if (resultsContainer) {
                        resultsContainer.innerHTML = '<div class="alert alert-danger">Error loading jobs. Please try again later.</div>';
                    }
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
                });
        });
    }
    
    // Enhanced function to find matching jobs based on ZIP code
    function findMatchingJobs(jobs, zipCode) {
        const zipNum = parseInt(zipCode, 10);
        const zipState = getStateFromZip(zipCode);
        
        // Special corridor and route handling
        const corridors = {
            // I-35 Corridor
            i35: (zip) => {
                const i35States = ['TX', 'OK', 'KS', 'MO', 'IA', 'MN'];
                const i35Zips = [
                    // Texas I-35 corridor
                    {min: 75000, max: 76299}, // Dallas area
                    {min: 76500, max: 76599}, // Waco area
                    {min: 78600, max: 78699}, // Austin area
                    {min: 78200, max: 78299}, // San Antonio area
                    // Oklahoma I-35 corridor
                    {min: 73000, max: 73199}, // Oklahoma City area
                    // Kansas I-35 corridor
                    {min: 66000, max: 66299}, // Kansas City KS area
                    // Missouri I-35 corridor
                    {min: 64000, max: 64199}, // Kansas City MO area
                    // Iowa I-35 corridor
                    {min: 50000, max: 50399}, // Des Moines area
                    // Minnesota I-35 corridor
                    {min: 55000, max: 55499}  // Minneapolis area
                ];
                
                const state = getStateFromZip(zip);
                if (!i35States.includes(state)) return false;
                
                return i35Zips.some(range => zipNum >= range.min && zipNum <= range.max);
            },
            
            // I-70 Corridor
            i70: (zip) => {
                const i70States = ['MD', 'PA', 'OH', 'IN', 'IL', 'MO', 'KS', 'CO', 'UT'];
                const i70Zips = [
                    // Maryland I-70
                    {min: 21700, max: 21799},
                    // Pennsylvania I-70
                    {min: 15300, max: 15399},
                    // Ohio I-70
                    {min: 43000, max: 43099}, // Columbus area
                    {min: 45300, max: 45399}, // Dayton area
                    // Indiana I-70
                    {min: 47300, max: 47399}, // Indianapolis area
                    // Illinois I-70
                    {min: 62200, max: 62299}, // East St. Louis area
                    // Missouri I-70
                    {min: 63000, max: 63199}, // St. Louis area
                    {min: 64000, max: 64199}, // Kansas City area
                    // Kansas I-70
                    {min: 66000, max: 66099}, // Kansas City KS area
                    {min: 67400, max: 67499}, // Topeka area
                    // Colorado I-70
                    {min: 80000, max: 80299}, // Denver area
                    // Utah I-70
                    {min: 84500, max: 84599}  // Central Utah
                ];
                
                const state = getStateFromZip(zip);
                if (!i70States.includes(state)) return false;
                
                return i70Zips.some(range => zipNum >= range.min && zipNum <= range.max);
            },
            
            // Chicago to Minneapolis Corridor
            chiMin: (zip) => {
                const states = ['IL', 'WI', 'MN'];
                const zipRanges = [
                    {min: 60000, max: 60699}, // Chicago area
                    {min: 53000, max: 53299}, // Milwaukee area
                    {min: 54000, max: 54099}, // Madison area
                    {min: 55000, max: 55499}  // Minneapolis area
                ];
                
                const state = getStateFromZip(zip);
                if (!states.includes(state)) return false;
                
                return zipRanges.some(range => zipNum >= range.min && zipNum <= range.max);
            },
            
            // St. Louis to Memphis Corridor
            stlMem: (zip) => {
                const states = ['MO', 'IL', 'AR', 'TN'];
                const zipRanges = [
                    {min: 63000, max: 63199}, // St. Louis area
                    {min: 62200, max: 62299}, // East St. Louis area
                    {min: 72400, max: 72499}, // Northern AR
                    {min: 38000, max: 38199}  // Memphis area
                ];
                
                const state = getStateFromZip(zip);
                if (!states.includes(state)) return false;
                
                return zipRanges.some(range => zipNum >= range.min && zipNum <= range.max);
            }
        };
        
        // Special city-based hiring zones
        const cityZones = {
            // Met Express cities
            metExpress: [
                {city: "Boston", state: "MA", radius: 50, zip: {min: 02100, max: 02299}},
                {city: "Edison", state: "NJ", radius: 30, zip: {min: 08800, max: 08899}},
                {city: "Toledo", state: "OH", radius: 30, zip: {min: 43600, max: 43699}},
                {city: "Philadelphia", state: "PA", radius: 40, zip: {min: 19100, max: 19199}},
                {city: "Pittsburgh", state: "PA", radius: 40, zip: {min: 15200, max: 15299}},
                {city: "Columbus", state: "OH", radius: 40, zip: {min: 43200, max: 43299}},
                {city: "Dayton", state: "OH", radius: 30, zip: {min: 45400, max: 45499}},
                {city: "Bloomsburg", state: "PA", radius: 30, zip: {min: 17800, max: 17899}},
                {city: "Cleveland", state: "OH", radius: 40, zip: {min: 44100, max: 44199}},
                {city: "Plainfield", state: "CT", radius: 30, zip: {min: 06300, max: 06399}},
                {city: "Hammond", state: "IN", radius: 30, zip: {min: 46300, max: 46399}},
                {city: "Indianapolis", state: "IN", radius: 40, zip: {min: 46200, max: 46299}},
                {city: "Baltimore", state: "MD", radius: 40, zip: {min: 21200, max: 21299}},
                {city: "Detroit", state: "MI", radius: 40, zip: {min: 48200, max: 48299}},
                {city: "Cincinnati", state: "OH", radius: 40, zip: {min: 45200, max: 45299}},
                {city: "Harrisburg", state: "PA", radius: 30, zip: {min: 17100, max: 17199}}
            ],
            
            // DTS hub cities
            dts: [
                {city: "Davenport", state: "IA", radius: 100, zip: {min: 52800, max: 52899}},
                {city: "Chicago", state: "IL", radius: 80, zip: {min: 60600, max: 60699}},
                {city: "Omaha", state: "NE", radius: 80, zip: {min: 68100, max: 68199}},
                {city: "Minneapolis", state: "MN", radius: 80, zip: {min: 55400, max: 55499}}
            ]
        };
        
        // Special region restrictions
        const closedRegions = {
            // USX closed areas
            usxClosed: (zip) => {
                // WI & MI Upper Peninsula
                if (getStateFromZip(zip) === 'WI') return true;
                if (getStateFromZip(zip) === 'MI' && parseInt(zip) >= 49800 && parseInt(zip) <= 49999) return true;
                
                // Areas west of I-35 and south of I-70
                const westOfI35SouthOfI70States = ['TX', 'OK', 'KS', 'NM', 'CO'];
                if (westOfI35SouthOfI70States.includes(getStateFromZip(zip))) {
                    // Exceptions for I-35 corridor cities
                    if (corridors.i35(zip)) return false;
                    // Exceptions for I-70 corridor cities
                    if (corridors.i70(zip)) return false;
                    return true;
                }
                
                return false;
            },
            
            // Montgomery Transport restrictions
            montgomeryRestrictions: (zip) => {
                // Connecticut restriction
                if (getStateFromZip(zip) === 'CT') {
                    // Exception for CT border with NY
                    return !(parseInt(zip) >= 06800 && parseInt(zip) <= 06899);
                }
                return false;
            }
        };
        
        return jobs.filter(job => {
            // Check if job has region restrictions
            if (!job.regionRestriction) return true;
            
            // Check state restrictions
            if (job.regionRestriction.states && job.regionRestriction.states.length > 0) {
                if (!job.regionRestriction.states.includes(zipState)) {
                    return false;
                }
            }
            
            // Check excluded states
            if (job.regionRestriction.excludedStates && job.regionRestriction.excludedStates.length > 0) {
                if (job.regionRestriction.excludedStates.includes(zipState)) {
                    return false;
                }
            }
            
            // Check ZIP ranges
            if (job.regionRestriction.zipRanges && job.regionRestriction.zipRanges.length > 0) {
                const inZipRange = job.regionRestriction.zipRanges.some(range => 
                    zipNum >= range.min && zipNum <= range.max
                );
                
                if (!inZipRange) {
                    // Check if in special corridor
                    const inCorridor = Object.values(corridors).some(corridor => corridor(zipCode));
                    
                    // Check if in city zone
                    const inCityZone = Object.values(cityZones).some(cities => 
                        cities.some(city => 
                            zipNum >= city.zip.min && zipNum <= city.zip.max
                        )
                    );
                    
                    if (!inCorridor && !inCityZone) {
                        return false;
                    }
                }
            }
            
            // Check closed regions
            if (closedRegions.usxClosed(zipCode)) {
                // If job is for USX regions, exclude
                if (job.id === 7 || job.id === 8 || job.id === 9) {
                    return false;
                }
            }
            
            // Check Montgomery restrictions
            if (closedRegions.montgomeryRestrictions(zipCode)) {
                // If job is for Montgomery flatbed, exclude
                if (job.id === 1) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    // Function to display job results
    function displayResults(jobs) {
        if (!resultsContainer) return;
        
        if (jobs.length === 0) {
            resultsContainer.innerHTML = '<div class="alert alert-info">No jobs found for this ZIP code. Please try another location.</div>';
            return;
        }
        
        let html = '';
        
        // Display featured jobs first
        const featuredJobs = jobs.filter(job => job.featured);
        const regularJobs = jobs.filter(job => !job.featured);
        
        // Combine featured and regular jobs
        const sortedJobs = [...featuredJobs, ...regularJobs];
        
        sortedJobs.forEach(job => {
            html += `
                <div class="job-card ${job.featured ? 'featured' : ''}">
                    ${job.featured ? '<div class="featured-badge">Featured</div>' : ''}
                    <h3>${job.title}</h3>
                    <p class="location">${job.location}</p>
                    <div class="job-details">
                        <div class="detail">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>${job.pay}</span>
                        </div>
                        <div class="detail">
                            <i class="fas fa-home"></i>
                            <span>${job.homeTime}</span>
                        </div>
                        <div class="detail">
                            <i class="fas fa-road"></i>
                            <span>${job.experience}</span>
                        </div>
                    </div>
                    <p class="description">${job.description}</p>
                    <div class="requirements">
                        <h4>Requirements:</h4>
                        <ul>
                            ${job.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                    <a href="${job.applyUrl}" class="btn btn-primary apply-btn" target="_blank">Apply Now</a>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = html;
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
            'KY': [{min: 40000, max: 42799}],
            'LA': [{min: 70000, max: 71599}],
            'ME': [{min: 3900, max: 4999}],
            'MD': [{min: 20600, max: 21999}],
            'MA': [{min: 1000, max: 2799}],
            'MI': [{min: 48000, max: 49999}],
            'MN': [{min: 55000, max: 56799}],
            'MS': [{min: 38600, max: 39799}],
            'MO': [{min: 63000, max: 65899}],
            'MT': [{min: 59000, max: 59999}],
            'NE': [{min: 68000, max: 69399}],
            'NV': [{min: 88900, max: 89899}],
            'NH': [{min: 3000, max: 3899}],
            'NJ': [{min: 7000, max: 8999}],
            'NM': [{min: 87000, max: 88499}],
            'NY': [{min: 10000, max: 14999}, {min: 500, max: 599}, {min: 6390, max: 6390}],
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
            'TX': [{min: 75000, max: 79999}, {min: 73301, max: 73301}, {min: 73344, max: 73344}, {min: 88500, max: 88599}],
            'UT': [{min: 84000, max: 84999}],
            'VT': [{min: 5000, max: 5999}],
            'VA': [{min: 22000, max: 24699}, {min: 20100, max: 20199}],
            'WA': [{min: 98000, max: 99499}],
            'WV': [{min: 24700, max: 26899}],
            'WI': [{min: 53000, max: 54999}],
            'WY': [{min: 82000, max: 83199}],
            'PR': [{min: 600, max: 799}, {min: 900, max: 999}]
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
