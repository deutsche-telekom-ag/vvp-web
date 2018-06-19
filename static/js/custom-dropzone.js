Dropzone.autoDiscover = false;
jQuery(document).ready(function () {
    $("#dropzone").dropzone({
        url: "/upload",
        dictDefaultMessage: "Drop files here or<br>click to upload...",
        acceptedFiles: ".zip",
        addRemoveLinks: true,
        maxFiles: 1,
        init: function () {
            this.on("success", function (file, serverResponse) {
                // If the image is already a thumbnail:
                this.emit('thumbnail', file, serverResponse.image_url);
                //this.createThumbnailFromUrl(file, serverResponse.image_url);
                window.file_uid = serverResponse.uid;
                $("#file-upload-form").attr('action', '/next/' + serverResponse.uid);
                //$("#uuid").val(serverResponse.uid);
            });
            this.on("removedfile", function (file) {
                axios.post('/delete/' + file_uid, {})
                    .then(function (response) {
                        console.log("OK: " + response);
                    })
                    .catch(function (error) {
                        console.log("Error: " + error);
                    });
            });
        },
    });
});