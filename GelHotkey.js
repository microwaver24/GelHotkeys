// ==UserScript==
// @name         Gelbooru Hotkeys
// @namespace    http://tampermonkey.net/
// @version      2024-02-03
// @description  Add some hotkeys while browsing posts on Gelbooru.
// @author       microwaver24
// @match        *://gelbooru.com/index.php?page=post&s=view*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gelbooru.com
// @grant        none
// @require      https://unpkg.com/hotkeys-js/dist/hotkeys.min.js
// ==/UserScript==

(function () {
    "use strict";

    let _enableLogs = true;

    // Bind hotkeys to actions.
    window.hotkeys("b,num_0", addFavorite);
    window.hotkeys("shift+b,num_1", removeFavorite);
    window.hotkeys("v,num_4", toggleVideoFocus);
    window.hotkeys("space,num_5", toggleVideoPlay);
    window.hotkeys("shift+left", navigatePrev);
    window.hotkeys("shift+right", navigateNext);

    function getImageId() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
    }

    function getVideo() {
        // This way seems like it might be more accurate if there are multiple videos in the page for some reason.
        // return window.document.querySelector("#gelcomVideoPlayer");

        // This might be safer in the long run if they change the query selector of the video or something.
        return document.getElementsByTagName("video")[0];
    }

    function addFavorite(event, handler) {
        const imageId = getImageId();
        window.post_vote(imageId, "up");
        window.addFav(imageId);

        if (_enableLogs) {
            console.log(`addFavorite: imageId [${imageId}]`);
        }

        return true;
    }

    function removeFavorite(event, handler) {
        const imageId = getImageId();
        let url = new URL("/index.php", "https://gelbooru.com");
        url.searchParams.append("page", "favorites");
        url.searchParams.append("s", "delete");
        url.searchParams.append("id", imageId);
        parent.location.href = url;

        if (_enableLogs) {
            console.log(`removeFavorite: imageId [${imageId}]`);
        }

        return true;
    }

    function toggleVideoFocus(event, handler) {
        let video = getVideo();
        if (!(video instanceof HTMLVideoElement)) {
            return false;
        }

        if (window.document.activeElement === video) {
            video.blur();
        } else {
            video.focus({ preventScroll: false });
        }

        if (_enableLogs) {
            console.log(`toggleVideoFocus: new activeElement [${window.document.activeElement}]`);
        }

        return true;
    }

    function toggleVideoPlay(event, handler) {
        // If we are focusing the video, let the video's normal handling do its thing.
        if (event.target instanceof HTMLVideoElement) {
            return false;
        }

        let video = getVideo();
        if (!(video instanceof HTMLVideoElement)) {
            return false;
        }

        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }

        if (_enableLogs) {
            console.log(`toggleVideoPlay: new paused status [${video.paused}]`);
        }

        return true;
    }

    function navigatePrev(event, handler) {
        if (!(event.target instanceof HTMLVideoElement)) {
            return false;
        }

        window.navigatePrev();
        return true;
    }

    function navigateNext(event, handler) {
        if (!(event.target instanceof HTMLVideoElement)) {
            return false;
        }

        window.navigateNext();
        return true;
    }

    function autoPlayVideo() {
        let video = getVideo();
        if (!(video instanceof HTMLVideoElement)) {
            return;
        }

        // This doesn't work because of permissions.
        video.autoplay = true;
        video.play();
    }

    // todo: maybe I can just set the video to start playing right away so I don't need to focus or unfocus it.
    // autoPlayVideo();
})();
