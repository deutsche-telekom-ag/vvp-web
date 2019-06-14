/*
 * Developed by Nicholas Dehnen & Vincent Scharf.
 * Copyright (c) 2019 Deutsche Telekom Intellectual Property.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var ctx = document.getElementById("repochart");
ctx.height = 350;

var repoChart_updateRun = function (number, passed, skipped, failed) {
    let no = Number(number);
    repoChart.data.labels[no] = "#" + no;
    repoChart.data.datasets[0].data[no] = Number(failed);
    repoChart.data.datasets[1].data[no] = Number(passed);
    repoChart.data.datasets[2].data[no] = Number(skipped);
    repoChart.update();
};

var repoChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], //repoChart.data.labels
        datasets: [
            {
                fill: false,
                label: 'Failed',
                data: [], //repoChart.data.datasets[0].data
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
                data: [], //repoChart.data.datasets[1].data
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
                data: [], //repoChart.data.datasets[2].data
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