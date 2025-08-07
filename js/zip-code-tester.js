// ZIP code testing script for Tornado Transport
document.addEventListener('DOMContentLoaded', function() {
  const testZipCodes = [
    // Georgia and surrounding states
    '31909', // Columbus, GA - Should show OTR Dry Van Driver
    '30301', // Atlanta, GA
    '35201', // Birmingham, AL
    '32099', // Jacksonville, FL
    '37201', // Nashville, TN
    '29201', // Columbia, SC
    '28201', // Charlotte, NC
    
    // Midwest
    '60601', // Chicago, IL
    '48201', // Detroit, MI
    '55401', // Minneapolis, MN
    '53201', // Milwaukee, WI
    '46201', // Indianapolis, IN
    '43201', // Columbus, OH
    
    // Northeast
    '10001', // New York, NY
    '19101', // Philadelphia, PA
    '02101', // Boston, MA
    '21201', // Baltimore, MD
    '15201', // Pittsburgh, PA
    
    // South
    '75201', // Dallas, TX
    '70112', // New Orleans, LA
    '33101', // Miami, FL
    '23219', // Richmond, VA
    
    // West
    '90001', // Los Angeles, CA
    '97201', // Portland, OR
    '98101', // Seattle, WA
    '80201', // Denver, CO
    '85001', // Phoenix, AZ
    '89101'  // Las Vegas, NV
  ];
  
  const results = document.getElementById('results');
  
  // Create results table
  const table = document.createElement('table');
  table.className = 'results-table';
  
  // Add header row
  const headerRow = document.createElement('tr');
  ['ZIP Code', 'Location', 'Jobs Found', 'First Job', 'Carrier Names Found'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);
  
  // Function to test a ZIP code
  function testZipCode(zipCode) {
    return new Promise((resolve) => {
      // Create a row for this ZIP code
      const row = document.createElement('tr');
      
      // Add ZIP code cell
      const zipCell = document.createElement('td');
      zipCell.textContent = zipCode;
      row.appendChild(zipCell);
      
      // Add placeholder cells
      const locationCell = document.createElement('td');
      locationCell.textContent = 'Testing...';
      row.appendChild(locationCell);
      
      const jobsFoundCell = document.createElement('td');
      jobsFoundCell.textContent = 'Testing...';
      row.appendChild(jobsFoundCell);
      
      const firstJobCell = document.createElement('td');
      firstJobCell.textContent = 'Testing...';
      row.appendChild(firstJobCell);
      
      const carrierNamesCell = document.createElement('td');
      carrierNamesCell.textContent = 'Testing...';
      row.appendChild(carrierNamesCell);
      
      table.appendChild(row);
      
      // Fetch jobs data
      fetch('/data/jobs.json')
        .then(response => response.json())
        .then(data => {
          const jobs = data.jobs;
          
          // Filter jobs based on ZIP code
          const matchingJobs = jobs.filter(job => {
            // Check if ZIP is in any of the ranges
            if (!job.regionRestriction || !job.regionRestriction.zipRanges) {
              return true; // No restrictions means it matches
            }
            
            const zipNum = parseInt(zipCode);
            return job.regionRestriction.zipRanges.some(range => 
              zipNum >= range.min && zipNum <= range.max
            );
          });
          
          // Update cells with results
          locationCell.textContent = matchingJobs.length > 0 ? 
            matchingJobs[0].location : 'N/A';
          
          jobsFoundCell.textContent = matchingJobs.length;
          
          firstJobCell.textContent = matchingJobs.length > 0 ? 
            matchingJobs[0].title : 'None';
          
          // Check for carrier names in job titles and descriptions
          const carrierNames = ['Montgomery', 'Transport', 'Montgomery Transport', 
                               'Swift', 'Heartland', 'USX', 'Met Express', 'DTS', 
                               'Barr-Nunn', 'Barr Nunn'];
          
          let foundCarrierNames = [];
          
          matchingJobs.forEach(job => {
            carrierNames.forEach(name => {
              if (job.title.includes(name) && !foundCarrierNames.includes(name)) {
                foundCarrierNames.push(name);
              }
              if (job.description.includes(name) && !foundCarrierNames.includes(name)) {
                foundCarrierNames.push(name);
              }
            });
          });
          
          carrierNamesCell.textContent = foundCarrierNames.length > 0 ? 
            foundCarrierNames.join(', ') : 'None';
          
          // Highlight row if issues found
          if (foundCarrierNames.length > 0) {
            row.className = 'error';
          } else if (zipCode === '31909' && (matchingJobs.length === 0 || 
                    !matchingJobs.some(job => job.title.includes('OTR Dry Van')))) {
            row.className = 'warning';
          } else {
            row.className = 'success';
          }
          
          resolve();
        })
        .catch(error => {
          console.error('Error fetching jobs:', error);
          locationCell.textContent = 'Error';
          jobsFoundCell.textContent = 'Error';
          firstJobCell.textContent = 'Error';
          carrierNamesCell.textContent = 'Error';
          row.className = 'error';
          resolve();
        });
    });
  }
  
  // Add table to results
  results.appendChild(table);
  
  // Run tests sequentially
  async function runTests() {
    for (const zipCode of testZipCodes) {
      await testZipCode(zipCode);
    }
    
    // Add summary
    const summary = document.createElement('div');
    summary.className = 'summary';
    const successRows = table.querySelectorAll('tr.success').length;
    const warningRows = table.querySelectorAll('tr.warning').length;
    const errorRows = table.querySelectorAll('tr.error').length;
    
    summary.innerHTML = `
      <h3>Test Summary</h3>
      <p>Total ZIP codes tested: ${testZipCodes.length}</p>
      <p class="success">Passed: ${successRows}</p>
      <p class="warning">Warnings: ${warningRows}</p>
      <p class="error">Errors: ${errorRows}</p>
    `;
    
    results.appendChild(summary);
  }
  
  runTests();
});
