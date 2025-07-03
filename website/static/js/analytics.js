document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const dateFromEl = document.getElementById('dateFrom');
    const dateToEl = document.getElementById('dateTo');
    const exerciseSelectEl = document.getElementById('exerciseSelect');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const statsBlock = document.getElementById('statsBlock');
    const progressCtx = document.getElementById('progressChart').getContext('2d');

    let chartInstance = null;

    // PUBLIC_INTERFACE
    function fetchExercises() {
        /**
         * Fetch all exercises available for the user and populate dropdown.
         * Assumes an endpoint /api/user_exercises that returns:
         * [{id: 1, name: 'Bench Press'}, ...]
         */
        fetch('/api/user_exercises')
            .then(response => response.json())
            .then(exercises => {
                exerciseSelectEl.innerHTML = '<option value="">All</option>';
                exercises.forEach(ex => {
                    let opt = document.createElement('option');
                    opt.value = ex.id;
                    opt.textContent = ex.name;
                    exerciseSelectEl.appendChild(opt);
                });
            });
    }

    // PUBLIC_INTERFACE
    function fetchAnalytics(dateFrom, dateTo, exerciseId) {
        /** 
         * Fetches analytic data given filters from:
         * /api/user_analytics?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&exercise_id=<id>
         * Expects response: {
         *   stats: {...}, 
         *   chartData: { labels: [...], values: [...] }
         * }
         */
        let params = [];
        if (dateFrom) params.push(`dateFrom=${encodeURIComponent(dateFrom)}`);
        if (dateTo) params.push(`dateTo=${encodeURIComponent(dateTo)}`);
        if (exerciseId) params.push(`exercise_id=${encodeURIComponent(exerciseId)}`);
        let url = '/api/user_analytics';
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error("Failed to load analytics");
                return response.json();
            })
            .then(data => {
                updateStats(data.stats);
                updateChart(data.chartData);
            })
            .catch(err => {
                statsBlock.innerHTML = `<div class="error-msg">Error: ${err.message}</div>`;
                if (chartInstance) {
                    chartInstance.destroy();
                }
            });
    }

    // PUBLIC_INTERFACE
    function updateStats(stats) {
        /**
         * Update stats HTML section.
         * Format stats object: {totalWorkouts, topExercise, weeklyAvg, ...}
         */
        if (!stats) {
            statsBlock.innerHTML = '<div>No stats available.</div>';
            return;
        }
        statsBlock.innerHTML = `
            <div class="stat-item"><b>Total Workouts:</b> ${stats.totalWorkouts ?? '-'}</div>
            <div class="stat-item"><b>Top Exercise:</b> ${stats.topExercise ?? '-'}</div>
            <div class="stat-item"><b>Weekly Avg:</b> ${stats.weeklyAvg ?? '-'}</div>
            <div class="stat-item"><b>Last Workout:</b> ${stats.lastWorkout ?? '-'}</div>
        `;
    }

    // PUBLIC_INTERFACE
    function updateChart(chartData) {
        /**
         * Plots or updates the progress chart.
         * Expects chartData: {labels:[], values:[]}
         * Uses Chart.js if loaded (if not, shows fallback).
         */
        if (!window.Chart) {
            // No Chart.js -- fallback
            document.getElementById('progressChart').style.display = "none";
            return;
        }
        if (chartInstance) {
            chartInstance.destroy();
        }
        chartInstance = new Chart(progressCtx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Weight Progress',
                    data: chartData.values,
                    fill: false,
                    borderColor: '#ff6600',
                    tension: 0.2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    x: { title: { display: true, text: "Date" }},
                    y: { title: { display: true, text: "Weight" }}
                }
            }
        });
    }

    // PUBLIC_INTERFACE
    function handleApplyFilters(e) {
        e.preventDefault();
        fetchAnalytics(dateFromEl.value, dateToEl.value, exerciseSelectEl.value);
    }

    // PUBLIC_INTERFACE
    function initializeResponsiveNav() {
        // Integrate with main navigation for responsiveness, e.g. menu toggles.
        // (Implementation depends on base.html/nav, kept for UI consistency.)
        // Example placeholder: collapse navbar on small screens.
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function() {
                navMenu.classList.toggle('open');
            });
        }
    }

    // Start-up: populate filters, set default date range.
    fetchExercises();
    // Default: last 30 days
    const today = new Date();
    const prior = new Date(today); prior.setDate(today.getDate() - 29);
    dateFromEl.value = prior.toISOString().substr(0, 10);
    dateToEl.value = today.toISOString().substr(0, 10);
    fetchAnalytics(dateFromEl.value, dateToEl.value, "");

    // Event listeners
    applyFiltersBtn.addEventListener('click', handleApplyFilters);

    // Nav UX
    initializeResponsiveNav();

    // Optionally: auto-update on filter change
    // exerciseSelectEl.addEventListener('change', handleApplyFilters);
    // dateFromEl.addEventListener('change', handleApplyFilters);
    // dateToEl.addEventListener('change', handleApplyFilters);
});
