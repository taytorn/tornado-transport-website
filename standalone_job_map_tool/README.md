# Tornado Transport Job Map Administration Tool

This standalone tool allows you to manage job listings for the Tornado Transport website with 100% accuracy for carrier hiring radiuses.

## Features

- **Interactive Map**: Visualize job locations and hiring radiuses on a map of the United States
- **Precise Hiring Radius Control**: Set exact hiring radiuses for each position to match carrier requirements
- **Easy Job Management**: Add, edit, and delete job listings with a user-friendly interface
- **Data Import/Export**: Export job data as JSON and import by dragging files onto the job list
- **Filtering Options**: Quickly find jobs by type or region
- **Automatic Saving**: Changes are saved locally until you explicitly save them to the server

## How to Use

1. **Open the Tool**: Open `index.html` in any modern web browser
2. **Manage Jobs**:
   - Click "Add New" to create a new job listing
   - Select a job from the list to edit its details
   - Click on the map to set job coordinates
   - Adjust hiring radius to match carrier requirements
   - Click "Save Job" to update a single job
   - Click "Save All Changes" to update all jobs

3. **Map Controls**:
   - Click "Center Map" to reset the view to the entire United States
   - Use "Toggle All Radiuses" to show or hide hiring radius circles
   - Click directly on the map to set coordinates for the selected job

4. **Data Management**:
   - Use "Export Data" to download jobs as JSON
   - Import data by dragging a JSON file onto the job list
   - All changes are saved locally until you click "Save All Changes"

## Integration with Website

This tool is designed to work alongside the main Tornado Transport website. When you click "Save All Changes", the job data is saved to:

1. Your browser's local storage (for immediate use in the tool)
2. The website's data directory (when properly configured)

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for map tiles
- File system access for importing/exporting data

## Technical Details

- Built with HTML, CSS, and JavaScript
- Uses Leaflet.js for mapping functionality
- Uses Bootstrap 5 for responsive design
- No server-side dependencies required
