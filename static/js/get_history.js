var run_history;
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
        this.id = id;
        this.uid = run_data.uid;
        this.result = run_data.result;
        this.status = run_data.status;
        this.commit = run_data.commit;
        this.running = (run_data.status === "running");
        this.node = this.create_html();
    }

    update_html() {
        $(this.node).find(this.uid + "_pass").html(this.result.pass);
        $(this.node).find(this.uid + "_pass").html(this.result.skip);
        $(this.node).find(this.uid + "_pass").html(this.result.fail);
        return this.node;
    }

    create_html() {
        return $("<tr id=\"" +
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
    }

    update_run(run_data) {
        this.uid = run_data.uid;
        this.result = run_data.result;
        this.status = run_data.status;
        this.commit = run_data.commit;
        this.running = (run_data.status === "running");
        this.update_html();
    }
}

class History {

    constructor(history_data) {
        this.runs = [];
        this.active_runs = [];
        for (let run in history_data) {
            this.runs[run] = new Run(run, history_data[run]);
            if (this.runs[run].running) {
                // do nothing
            } else {
                // add to set of active runs
                this.active_runs.push(this.runs[run]);
            }
        }
    }

    create_html() {
        let empty = true;
        if ($("#history_table tbody").children().length > 0)
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
            if ($("#" + this.runs[run].uid).length > 0)
                $("#" + this.runs[run].uid).replaceWith(this.runs[run].update_html());
            else
                this.runs[run].update_html().insertAfter($("#" + this.runs[run - 1].uid));
        }
    }

    update_from_history(new_history) {
        for (let run in new_history) {
            if (this.runs[run].running && new_history[run].status !== "running") {
                // remove from active runs set
                this.active_runs.remove(this.runs[run]);
            }
            // update run data
            this.runs[run].update_run(new_history[run]);
        }
    }

    update_from_runs(runs) {
        for (let run in runs) {
            if (typeof this.runs[run] === 'undefined' || this.runs[run].running)
                axios.get('/status/' + runs[run] + '/slim')
                    .then(response => this.call_runs(response, run))
                    .catch(function (error) {
                        console.log(error);
                    });
        }
    }

    call_runs(response, run) {
        if (typeof this.runs[run] === 'undefined') {
            this.runs[run] = new Run(run, response.data);
            this.update_html();
        } else {
            if (this.runs[run].running && response.data.status !== "running") {
                // remove from active runs set
                this.remove_run_from_active(this.runs[run].uid);
            }
            this.runs[run].update_run(response.data);
            this.update_html();
        }
    }

    remove_run_from_active(run) {
        let index = this.active_runs.indexOf(run);
        if (index > -1) {
            this.active_runs.splice(index, 1);
        }
    }

}

function get_history() {
    let repo = window.location.pathname;
    repo = repo.replace("/repo/", "");
    if (typeof run_history !== 'undefined') {
        axios.get('/runs/' + repo)
            .then(function (response) {
                console.log(response);
                run_history.update_from_runs(response.data);
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    } else {
        axios.get('/history/' + repo)
            .then(function (response) {
                console.log(response);
                run_history = new History(response.data);
                run_history.create_html();
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }
}