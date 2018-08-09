let repo_summary = {
    0: {
        'uid': '12345',
        'status': 'running/success/error',
        'commit': 'hash',
        'result': {
            'pass': 31,
            'skip': 1,
            'fail': 25,
        },
    }
};

class Run {
    constructor(id, run_data) {
        this.id = id + 1;
        this.uid = run_data.uid;
        this.result = run_data.result;
        this.status = run_data.status;
        this.commit = run_data.commit;
        this.running = (run_data.status !== "running");
    }

    update_html() {
        $(this.node).find(this.uid + "_pass").html(this.result.pass);
        $(this.node).find(this.uid + "_pass").html(this.result.skip);
        $(this.node).find(this.uid + "_pass").html(this.result.fail);
    }

    create_html() {
        this.node = $("<tr id=\"" +
            this.uid + "\">\n" +
            "<td class=\"align-middle text-bold text-xxlarge\">" +
            "#" + this.id +
            "<span class=\"js-secret-variables-save-loading-icon\" id=\"git_loading\" style=\"display: none;\">\n" +
            "<i aria-hidden=\"true\" data-hidden=\"true\" class=\"fa fa-refresh fa-spin\"></i>\n" +
            "</span>" +
            "</td>" +
            "<td class=\"align-middle\">" +
            "<a>" + this.commit + "</a>" +
            "</td>" +
            "<td class=\"text-success align-middle text-semibold text-xxlarge\" id=\"" + this.uid + "_pass\">" +
            this.result.pass +
            "</td>" +
            "<td class=\"text-warning align-middle text-semibold text-xxlarge\" id=\"" + this.uid + "_skip\">" +
            this.result.skip +
            "</td>" +
            "<td class=\"text-danger align-middle text-semibold text-xxlarge\" id=\"" + this.uid + "_fail\">" +
            this.result.fail +
            "</td>" +
            "</tr>");
        return this.node;
    }

    update_run(run_data) {
        this.uid = run_data.uid;
        this.result = run_data.result;
        this.status = run_data.status;
        this.commit = run_data.commit;
        this.running = (run_data.status !== "running");
    }
}

class History {

    constructor(history_data) {
        this.runs = [];
        this.active_runs = [];
        for (let run in history_data) {
            this.runs[run] = new Run(run, history_data[run]);
            if (this.runs[run].status !== "running") {
                // do nothing
            } else {
                // add to set of active runs
                this.active_runs.push(this.runs[run]);
            }
        }
    }

    create_html() {
        let empty = true;
        let test = $("#history_table tbody").children().length;
        console.log(test);
        if (test > 0)
            empty = false;
        for (let run in this.runs) {
            if (empty) {
                this.runs[run].create_html().appendTo($("#history_table > tbody"));
                empty = false;
            } else {
                this.runs[run].create_html().insertAfter($("#" + this.runs[run - 1].uid));
            }
        }
    }

    update_html() {
        for (let run in this.runs) {
            $("#" + runs.uid).replaceWith(run.node);
        }
    }

    update_from_history(new_history) {
        for (let run in new_history) {
            if (this.runs[run].status === "running" && history_data[run].status !== "running") {
                // remove from active runs set
                this.active_runs.remove(this.runs[run]);
            }
            // update run data
            this.runs[run].update_run(history_data[run]);
        }
    }

}

/*
function Run(uid) {
    this.uid = uid;
}

Run.prototype.update = function () {
    // update html
    return this;
};
*/

function get_history() {
    let repo = window.location.pathname;
    repo = repo.replace("/repo/", "");
    axios.get('/history/' + repo)
        .then(function (response) {
            console.log(response);
            history_table = new History(response.data);
            history_table.create_html();
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always do
            console.log("hi");
        });
}