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
            if(response.status === 200)
            {
                if (last_status !== response.data.progress) {
                    last_status = response.data.progress;
                    //if(response.data.progress < 50)
                    bar.animate(response.data.progress / 100);
                    //else
                    //    bar.set(response.data.progress / 100);
                $("#message").text(response.data.message);
                }
                if (response.data.status !== "success")
                {
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

