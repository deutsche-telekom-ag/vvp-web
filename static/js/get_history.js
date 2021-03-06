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

var run_history;

class Run {
    constructor(id, run_data) {
        this.id = id;
        this.uid = run_data.uid;
        this.result = run_data.result;
        this.status = run_data.status;
        this.commit = run_data.commit;
        this.running = (run_data.status === "running");
        this.linked_repo = window.location.pathname.split('/')[2];
        this.node = this.create_html();
    }

    update_html() {
        this.node.find("#" + this.uid + "_pass").html(this.result.pass);
        this.node.find("#" + this.uid + "_skip").html(this.result.skip);
        this.node.find("#" + this.uid + "_fail").html(this.result.fail);
        if (!this.running)
            this.node.find("#" + this.uid + "_running").hide();
        return this.node;
    }

    create_html() {
        let commit_link = window.location.protocol + '/git/' + this.linked_repo + '.git/commit/' + this.commit;
        let results_link = window.location.protocol + '/result/' + this.uid;
        var theTemplateScript = $("#example-template").html();
        var theTemplate = Handlebars.compile(theTemplateScript);
        var context = {
            node_uid: this.uid,
            node_id: this.id,
            node_running: this.running,
            node_commit: this.commit,
            results_link: results_link,
            commit_link: commit_link,
            result_pass: this.result.pass,
            result_skip: this.result.skip,
            result_fail: this.result.fail
        };
        var html = theTemplate(context);
        //this probably shouldnt update here, but it works
        repoChart_updateRun(this.id, this.result.pass, this.result.skip, this.result.fail);
        return $(html);
    }

    update_run(run_data) {
        this.uid = run_data.uid;
        this.result = run_data.result;
        this.status = run_data.status;
        this.commit = run_data.commit;
        this.running = (run_data.status === "running");
        this.update_html();

        //update chart
        repoChart_updateRun(this.id, this.result.pass, this.result.skip, this.result.fail);
    }
}

class History {

    constructor(history_data) {
        this.runs = [];
        this.active_runs = [];
        for (let run in history_data) {
            this.runs[run] = new Run(run, history_data[run]);
            if (this.runs[run].running)
            // add to set of active runs
                this.active_runs[run] = this.runs[run];
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
            if ($("#" + this.runs[run].uid).length)
                $("#" + this.runs[run].uid).replaceWith(this.runs[run].update_html());
            else
                this.runs[run].update_html().insertAfter($("#" + this.runs[run - 1].uid));
        }
    }

    update_from_history(new_history) {
        for (let run in new_history) {
            if (this.runs[run].running && new_history[run].status !== "running") {
                // remove from active runs set
                this.active_runs.remove_run_from_active(run);
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
        console.log(response);
        if (typeof this.runs[run] === 'undefined') {
            this.runs[run] = new Run(run, response.data);
            repoChart_updateRun(this.runs[run].id, this.runs[run].result.pass, this.runs[run].result.skip, this.runs[run].result.fail);
            if (this.runs[run].running)
                this.active_runs[run] = this.runs[run];
            this.update_html();
        } else {
            this.runs[run].update_run(response.data);
            this.update_html();
            if (this.runs[run].running && response.data.status !== "running") {
                // remove from active runs set
                this.remove_run_from_active(this.runs[run].uid);
            }
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