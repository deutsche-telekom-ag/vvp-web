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