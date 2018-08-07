function get_runs() {
    let repo = window.location.pathname;
    repo = repo.replace("/repo", "");
    axios.get('/runs/' + repo)
        .then(function (response) {
            // handle success
            console.log(response);
            if (response.status === 200) {
                let data = response.data;
                let run_num = 0;
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
                                run_num++;
                                $("#table_run_summary").find('tbody').append("<tr>\n" +
                                    "<td class=\"align-middle text-bold text-xxlarge\">" +
                                    "#" + run_num +
                                    "</td>" +
                                    "<td class=\"align-middle\">" +
                                    "<a>" + commit_hash + "</a>" +
                                    "</td>" +
                                    "<td class=\"text-success align-middle text-semibold text-xxlarge\">" +
                                    response2.data.result.pass +
                                    "</td>" +
                                    "<td class=\"text-warning align-middle text-semibold text-xxlarge\">" +
                                    response2.data.result.skip +
                                    "</td>" +
                                    "<td class=\"text-danger align-middle text-semibold text-xxlarge\">" +
                                    response2.data.result.fail +
                                    "</td>" +
                                    "</tr>");
                            }
                        })
                }
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