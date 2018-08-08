function get_runs() {
    let repo = window.location.pathname;
    repo = repo.replace("/repo/", "");
    axios.get('/runs/' + repo)
        .then(function (response) {
            // handle success
            console.log(response);
            if (response.status === 200) {
                let data = response.data;
                for (let key in data) {
                    console.log(key);
                    let run = data[key];
                    let run_id = run;
                    console.log(run_id);
                    let commit_hash = run.commit_hash;
                    let run_results = axios.get('/results/' + run_id)
                        .then(function (response2) {
                            //handle success
                            console.log(response2);
                            if (response2.status === 200) {
                                if ($("#" + run_id).length) {
                                    $("#" + run_id + "_pass").html(response2.data.result.pass);
                                    $("#" + run_id + "_skip").html(response2.data.result.skip);
                                    $("#" + run_id + "_fail").html(response2.data.result.fail);
                                } else {
                                    $("#table_run_summary").find('tbody').append("<tr id=\"" +
                                        run_id + "\">\n order" +
                                        "<td class=\"align-middle text-bold text-xxlarge\">" +
                                        "#" + key +
                                        "<span class=\"js-secret-variables-save-loading-icon\" id=\"git_loading\" style=\"display: none;\">\n" +
                                        "<i aria-hidden=\"true\" data-hidden=\"true\" class=\"fa fa-refresh fa-spin\"></i>\n" +
                                        "</span>" +
                                        "</td>" +
                                        "<td class=\"align-middle\">" +
                                        "<a>" + commit_hash + "</a>" +
                                        "</td>" +
                                        "<td class=\"text-success align-middle text-semibold text-xxlarge\" id=\"" + run_id + "_pass\">" +
                                        response2.data.result.pass +
                                        "</td>" +
                                        "<td class=\"text-warning align-middle text-semibold text-xxlarge\" id=\"" + run_id + "_skip\">" +
                                        response2.data.result.skip +
                                        "</td>" +
                                        "<td class=\"text-danger align-middle text-semibold text-xxlarge\" id=\"" + run_id + "_fail\">" +
                                        response2.data.result.fail +
                                        "</td>" +
                                        "</tr>");
                                }
                            }
                        })
                    $('#table_run_summary').DataTable({
                        "order": [[1, "desc"]]
                    });
                }
                setTimeout(get_runs, 2000);
            }
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always do
        });
}