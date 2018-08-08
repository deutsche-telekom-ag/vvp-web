var ctx = document.getElementById("repochart");
ctx.height = 350;
var repoChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["#1", "#2", "#3", "#4", "#5", "#6"],
        datasets: [{
            fill: false,
            label: 'Failed',
            data: [45, 43, 47, 46, 42, 40],
            //backgroundColor: [
            //    'rgba(255, 99, 132, 0.2)',
            //],
            borderColor: [
                'rgba(255,99,132,1)',
            ],
            borderWidth: 1.5
        },
            {
                fill: false,
                label: 'Passed',
                data: [120, 128, 125, 40, 140, 145],
                //backgroundColor: [
                //    'rgba(98, 255, 130, 0.2)',
                //],
                borderColor: [
                    'rgba(98, 255, 130,1)',
                ],
                borderWidth: 1.5
            },
            {
                fill: false,
                label: 'Skipped',
                data: [30, 31, 25, 35, 29, 37],
                //backgroundColor: [
                //    'rgba(255, 192, 56, 0.2)',
                //],
                borderColor: [
                    'rgba(255, 192, 56,1)',
                ],
                borderWidth: 1.5
            }]
    },
    options: {
        maintainAspectRatio: false,
    }
});