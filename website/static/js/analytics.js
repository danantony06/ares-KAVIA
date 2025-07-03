document.addEventListener('DOMContentLoaded', function() {
    // Elements for new filter controls
    const exerciseSelect = document.getElementById('exercise-select');
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');

    // Initial state for filters
    let currentFilters = {
        exercise: 'all',
        date_from: null,
        date_to: null
    };

    // Fetch list of exercises for selector
    if (exerciseSelect) {
        fetch('/api/analytics/exercises')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.exercises)) {
                    data.exercises.forEach(exName => {
                        const opt = document.createElement('option');
                        opt.value = exName;
                        opt.textContent = exName;
                        exerciseSelect.appendChild(opt);
                    });
                }
            });
    }

    // Hook up event listeners if elements exist
    if (exerciseSelect) {
        exerciseSelect.addEventListener('change', () => {
            currentFilters.exercise = exerciseSelect.value;
            updateAnalytics();
        });
    }
    if (dateFromInput) {
        dateFromInput.addEventListener('change', () => {
            currentFilters.date_from = dateFromInput.value || null;
            updateAnalytics();
        });
    }
    if (dateToInput) {
        dateToInput.addEventListener('change', () => {
            currentFilters.date_to = dateToInput.value || null;
            updateAnalytics();
        });
    }

    // Function to update analytics charts/statistics
    function updateAnalytics() {
        let url = '/api/analytics/data';
        let params = [];
        if (currentFilters.exercise && currentFilters.exercise !== 'all') params.push(`exercise=${encodeURIComponent(currentFilters.exercise)}`);
        if (currentFilters.date_from) params.push(`date_from=${encodeURIComponent(currentFilters.date_from)}`);
        if (currentFilters.date_to) params.push(`date_to=${encodeURIComponent(currentFilters.date_to)}`);
        if (params.length > 0) url += '?' + params.join('&');

        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Update each chart using new data (dummy chart functions for now)
                initProgressChart(data.progress || []);
                initSessionsChart(data.sessions || []);
                initWorkoutStats(data.stats || []);
            })
            .catch(error => {
                console.error('Analytics fetch error:', error);
            });
    }

    // Dummy chart rendering functions -- stub for integration with charting logic
    function initProgressChart(progressData) {
        // You'd use Chart.js or similar to update with new data here.
        // Example: destroy old chart instance, create new one with progressData.
    }
    function initSessionsChart(sessionsData) {}
    function initWorkoutStats(statsData) {}

    // Initial load
    if (exerciseSelect || dateFromInput || dateToInput) updateAnalytics();
});
