function git_init() {
    // get base url
    let getUrl = window.location;
    let baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
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
                        let git_repo_url = baseUrl + "git/" + git_repo_uid;
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
                    } else {
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