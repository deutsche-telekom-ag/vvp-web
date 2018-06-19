$(document).ready(function () {
    var total = parseInt($("#val-total").val());
    var pass = parseInt($("#val-pass").val());
    var skip = parseInt($("#val-skip").val());
    var fail = parseInt($("#val-fail").val())


    var bar1 = new ProgressBar.Circle("#circle-passed", {
        color: '#fffff',
        strokeWidth: 4,
        trailWidth: 1,
        easing: 'easeInOut',
        duration: 1400,
        text: {
            autoStyleContainer: false
        },
        from: {color: '#28a745', width: 3},
        to: {color: '#28a745', width: 3},
        step: function (state, circle) {
            circle.path.setAttribute('stroke', state.color);
            circle.path.setAttribute('stroke-width', state.width);

            var value = Math.round(circle.value() * total);
            if (value === 0) {
                circle.setText('');
            } else {
                circle.setText(value);
            }

        }
    });
    bar1.text.style.fontFamily = 'TeleGroteskScreen';
    bar1.text.style.fontSize = '3rem';

    bar1.animate(pass/total);  // Number from 0.0 to 1.0

    var bar2 = new ProgressBar.Circle("#circle-skipped", {
        color: '#fffff',
        strokeWidth: 4,
        trailWidth: 1,
        easing: 'easeInOut',
        duration: 1400,
        text: {
            autoStyleContainer: false
        },
        from: {color: '#fd7e14', width: 3},
        to: {color: '#fd7e14', width: 3},
        step: function (state, circle) {
            circle.path.setAttribute('stroke', state.color);
            circle.path.setAttribute('stroke-width', state.width);

            var value = Math.round(circle.value() * total);
            if (value === 0) {
                circle.setText('');
            } else {
                circle.setText(value);
            }

        }
    });
    bar2.text.style.fontFamily = 'TeleGroteskScreen';
    bar2.text.style.fontSize = '3rem';

    bar2.animate(skip/total);  // Number from 0.0 to 1.0

    var bar3 = new ProgressBar.Circle("#circle-failed", {
        color: '#fffff',
        strokeWidth: 4,
        trailWidth: 1,
        easing: 'easeInOut',
        duration: 1400,
        text: {
            autoStyleContainer: false
        },
        from: {color: '#dc3545', width: 3},
        to: {color: '#dc3545', width: 3},
        step: function (state, circle) {
            circle.path.setAttribute('stroke', state.color);
            circle.path.setAttribute('stroke-width', state.width);

            var value = Math.round(circle.value() * total);
            if (value === 0) {
                circle.setText('');
            } else {
                circle.setText(value);
            }

        }
    });
    bar3.text.style.fontFamily = 'TeleGroteskScreen';
    bar3.text.style.fontSize = '3rem';

    bar3.animate(fail/total);  // Number from 0.0 to 1.0
});