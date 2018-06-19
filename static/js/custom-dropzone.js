Dropzone.autoDiscover = false;
jQuery(document).ready(function () {
    $("#dropzone").dropzone({
        url: "/upload",
        dictDefaultMessage: "Drop files here or<br>click to upload..."
    });
});