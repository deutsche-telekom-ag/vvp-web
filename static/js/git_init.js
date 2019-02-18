function git_init() {
    // get base url
    let getUrl = window.location;
    let baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1] + ".git";
    if (!$("#git_url_text_field").hasClass('initialized')) {
        $("#git_loading").show();
        axios.get('/git_init')
            .then(function (response) {
                // handle success
                console.log(response);
                if (response.status === 200) {
                    if (response.data.status === "success") {
                        // get uid
                        let git_repo_uid = response.data.uid;
                        // concatenate the git repository url
                        let git_repo_url = baseUrl + "git/" + git_repo_uid + ".git";
                        let $git_url_field = $("#git_url_text_field");
                        // set initialized class for the url field
                        $git_url_field.addClass('initialized');
                        // set git repository url in url field
                        $git_url_field.val(git_repo_url);

                        function enable(i) {
                            i.prop("disabled", false);
                        }

                        enable($("#button_git_url_copy"));
                        enable($("#git_url_text_field"));

                        //quoted function is ugly but causes the function not to be executed immediately.
                        setTimeout(function () {
                            wait_for_commit(git_repo_uid)
                        }, 2000);
                    } else {
                        $("#git_url_text_field").val("Sorry, an error occured. Please use the upload feature instead.");
                        // do nothing;
                    }
                }
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .then(function () {
                // always do
                $("#git_loading").hide();
            });
    }
}

function wait_for_commit(git_repo_uid) {
    console.log("waiting for commit..");
    if (git_repo_uid === false)
        return false;

    axios.get('/runs/' + git_repo_uid)
        .then(function (response) {
                console.log(response);
                if (response.status === 200) {
                    if ('0' in response.data) {
                        setTimeout(function () {
                            window.location = '/repo/' + git_repo_uid;
                        }, 1000);
                    }
                    else {
                        setTimeout(function () {
                            wait_for_commit(git_repo_uid)
                        }, 2000);
                    }
                }
            }
        ).catch(function (error) {
        console.log(error);
    });
}
