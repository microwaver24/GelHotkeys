// ==UserScript==
// @name         Gelbooru Hotkeys
// @namespace    http://tampermonkey.net/
// @version      2024-02-03
// @description  try to take over the world!
// @author       You
// @match        *://gelbooru.com/index.php?page=post&s=view*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gelbooru.com
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    function getImageId() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
    }

    parent.onkeypress = function (e) {
        //console.log(`pressed key [${e.key}]  keyCode [${e.keyCode}]`);
        if (e.key === "b" || e.key === "0") {
            const imageId = getImageId();
            //console.log(`adding a favorite! imageId [${imageId}]`);
            post_vote(imageId, "up");
            addFav(imageId);
            return false;
        } else if (e.key === "B" || e.key === "1") {
            const imageId = getImageId();
            //console.log(`removing a favorite! imageId [${imageId}]`);
            var url = new URL("/index.php", "https://gelbooru.com");
            url.searchParams.append("page", "favorites");
            url.searchParams.append("s", "delete");
            url.searchParams.append("id", imageId);
            parent.location.href = url; //.toString();
            return false;
        }
    };
})();
