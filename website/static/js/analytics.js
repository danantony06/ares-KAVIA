document.addEventListener('DOMContentLoaded', function() {
    // --- Selectors
    const exerciseSelect = document.getElementById('exercise-select');
    const weightsCtx = document.getElementById('weightsProgressChart').getContext('2d');
    const repsCtx = document.getElementById('repsProgressChart').getContext('2d');
    const statsList = document.getElementById('stats-list');

    // --- Chart instances
    let weightsChart = null;
    let repsChart = null;

    // --- Store all data
    let allProgressData = {};
    let bestLiftsData = {};

    // PUBLIC_INTERFACE
    async function fetchProgressData() {
        // Fetches aggregate progress data for authenticated user
        // Adjust the endpoint if needed
        const progressResp = await fetch('/progress/data');
        const bestLiftsResp = await fetch('/progress/best-lifts');
        if (!progressResp.ok || !bestLiftsResp.ok) {
            alert('Error fetching progress data.');
            return;
        }
        allProgressData = await progressResp.json(); // { exerciseName: [ {date, weight, reps}, ... ], ... }
        bestLiftsData = await bestLiftsResp.json(); // { exerciseName: {best_weight, best_reps, trend}, ... }
        updateExerciseList();
    }

    // PUBLIC_INTERFACE
    function updateExerciseList() {
        exerciseSelect.innerHTML = "";
        const exercises = Object.keys(allProgressData).sort();
        exercises.forEach(ex => {
            const opt = document.createElement('option');
            opt.value = ex;
            opt.textContent = ex;
            exerciseSelect.appendChild(opt);
        });
        if (exercises.length) {
            renderChartsAndStats(exercises[0]);
        }
    }

    // PUBLIC_INTERFACE
    function onExerciseChange() {
        renderChartsAndStats(exerciseSelect.value);
    }

    // Utility: Date sorting and chart labeling
    function sortByDate(entries) {
        return entries.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Chart rendering
    function renderChartsAndStats(selectedExercise) {
        const dataArr = allProgressData[selectedExercise] || [];
        const sorted = sortByDate(dataArr);
        const labels = sorted.map(item => item.date);
        const weights = sorted.map(item => item.weight);
        const reps = sorted.map(item => item.reps);

        // Destroy old charts
        if (weightsChart) weightsChart.destroy();
        if (repsChart) repsChart.destroy();

        weightsChart = new Chart(weightsCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weight (kg/lb)',
                    data: weights,
                    borderColor: '#eb8334',
                    backgroundColor: 'rgba(235,131,52,0.15)',
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    tension: 0.2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: false }
                },
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Weight' }, beginAtZero: true }
                }
            }
        });

        repsChart = new Chart(repsCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Reps',
                    data: reps,
                    borderColor: '#24a19c',
                    backgroundColor: 'rgba(36,161,156,0.15)',
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    tension: 0.2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: false }
                },
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Reps' }, beginAtZero: true }
                }
            }
        });

        // Stats section
        statsList.innerHTML = "";
        const liftStats = bestLiftsData[selectedExercise];
        if (liftStats) {
            statsList.innerHTML += `<li><b>Best Weight:</b> ${liftStats.best_weight}</li>`;
            statsList.innerHTML += `<li><b>Best Reps:</b> ${liftStats.best_reps}</li>`;
            statsList.innerHTML += `<li><b>Weight Trend:</b> ${liftStats.trend > 0 ? "⬆️ Improving" : (liftStats.trend < 0 ? "⬇️ Declining" : "⏸️ Stable")}</li>`;
        }
    }

    // --- Event listeners
    exerciseSelect.addEventListener('change', onExerciseChange);

    // --- Main
    fetchProgressData();
});
