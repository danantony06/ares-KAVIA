document.addEventListener("DOMContentLoaded", function () {
    if (typeof window.exercise_stats_for_charts !== "undefined" && Array.isArray(window.exercise_stats_for_charts)) {
        window.exercise_stats_for_charts.forEach(function (ex_stat, idx) {
            var chartId = "chart-" + idx;
            var ctx = document.getElementById(chartId);
            if (!ctx) return;

            const labels = ex_stat.labels;
            const data = ex_stat.values;

            new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: ex_stat.series_label || "Best Weight",
                        data: data,
                        borderColor: "#ef8531",
                        backgroundColor: "rgba(239, 133, 49, 0.1)",
                        fill: true,
                        tension: 0.35,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                    }]
                },
                options: {
                    plugins: {
                        legend: { display: false },
                        title: { display: false }
                    },
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: ex_stat.y_label || "Weight"
                            }
                        }
                    }
                }
            });
        });
    }
});
