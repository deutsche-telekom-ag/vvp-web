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

$(document).ready(function () {
    window.bar = new ProgressBar.SemiCircle('#progressbar', {
        strokeWidth: 6,
        color: '#e20074',
        trailColor: '#eee',
        trailWidth: 1,
        easing: 'easeInOut',
        duration: 1400,
        svgStyle: null,
        text: {
            value: '',
            alignToBottom: false
        },
        from: {color: '#c6c6c6'},
        to: {color: '#e20074'},
        // Set default step function for all animate calls
        step: (state, bar) => {
            bar.path.setAttribute('stroke', state.color);
            var value = Math.round(bar.value() * 100);
            if (value === 0) {
                bar.setText('');
            } else {
                bar.setText(value);
            }

            bar.text.style.color = state.color;
        }
    });

    bar.text.style.fontFamily = 'TeleGroteskScreen';
    bar.text.style.fontSize = '1.5rem';

    bar.animate(0.01);

    window.poll_uid = $("#uid").val();
    doPoll();
});

var last_status = 0;

function doPoll() {
    axios.get('/status/'+poll_uid, {})
        .then(function (response) {
            console.log(response);
            if (response.status === 200) {
                $("#message").text(response.data.message);
                if (last_status !== response.data.progress) {
                    last_status = response.data.progress;
                    //if(response.data.progress < 50)
                    bar.animate(response.data.progress / 100);
                    //else
                    //    bar.set(response.data.progress / 100);
                }
                if (response.data.state !== "success") {
                    setTimeout(doPoll, 500);
                } else {
                    setTimeout(function () {
                        window.location = '/result/' + poll_uid;
                    }, 2000);
                }
            }

        })
        .catch(function (error) {
            console.log(error);
        });
}

