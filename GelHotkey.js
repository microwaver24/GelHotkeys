// ==UserScript==
// @name         Gelbooru Hotkeys
// @namespace    http://tampermonkey.net/
// @version      2024-02-03
// @description  Add some hotkeys while browsing posts on Gelbooru.
// @author       microwaver24
// @match        *://gelbooru.com/index.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gelbooru.com
// @grant        none
// @require      https://unpkg.com/hotkeys-js/dist/hotkeys.min.js
// ==/UserScript==

// Ideas for more features:
// Editable hotkeys
// Blacklist/unblacklist tag shortcut, maybe alt+click a tag?
// Hotkeys to go to the suggested posts (there are 6 of them),
// The next and previous hotkeys can use the suggested posts if there is no next or prev, like when going directly to an image.
// A hotkey for "Click here to expand image." and also to undo that.
// Fit image to window.
// Center image in window.
// Auto-play video posts on page load.

(function () {
    "use strict";

    const ENABLE_LOGS = false;
    const SCOPE_ALL = "all";
    const SCOPE_POST_VIEW = "postView";
    const SCOPE_POST_LIST = "postList";
    const POSTS_PER_PAGE = 42;

    // Input Binding -----------------------------------------------------------

    // Bind hotkeys to actions.
    // Input handling code from here: https://github.com/jaywcjlove/hotkeys-js

    {
        let scope = SCOPE_ALL;

        window.hotkeys("num_7", scope, historyBack);
        window.hotkeys("num_9", scope, historyForward);
        window.hotkeys("num_8", scope, reloadPage);
    }

    {
        let scope = SCOPE_POST_VIEW;

        window.hotkeys("num_0,b", scope, addFavorite); // "b" for "bookmark"

        window.hotkeys("num_decimal,shift+b", scope, removeFavorite);

        window.hotkeys("num_1,v", scope, toggleVideoFocus); // "v" for "video"

        window.hotkeys("num_5", scope, toggleVideoPlay);
        window.hotkeys("space", scope, wrapAction(toggleVideoPlay, isNotTargetingVideo));

        window.hotkeys("num_4", scope, navigatePrev);
        window.hotkeys("shift+left", scope, wrapAction(navigatePrev, isTargetingVideo));

        window.hotkeys("num_6", scope, navigateNext);
        window.hotkeys("shift+right", scope, wrapAction(navigateNext, isTargetingVideo));
    }

    {
        let scope = SCOPE_POST_LIST;

        window.hotkeys("num_4,left", scope, navigateListPrev);
        window.hotkeys("num_6,right", scope, navigateListNext);
    }

    // Helpers -----------------------------------------------------------------

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

    function setHotkeysScope() {
        const params = new URLSearchParams(window.location.search);
        let page = params.get("page");
        let s = params.get("s");

        if (page === "post" && s == "view") {
            window.hotkeys.setScope(SCOPE_POST_VIEW);
            return;
        }

        if (page === "post" && s == "list") {
            window.hotkeys.setScope(SCOPE_POST_LIST);
            return;
        }

        window.hotkeys.setScope(SCOPE_ALL);
    }

    function log(...args) {
        if (!ENABLE_LOGS) {
            return;
        }

        console.log(...args);
    }

    function logObjProps(obj) {
        if (!ENABLE_LOGS) {
            return;
        }

        for (var property in obj) {
            log(`${property}: ${obj[property]}`);
        }
    }

    function logHotkeysHandler(handler) {
        // logObjProps(handler);
    }

    function wrapAction(actionFunction, isOkCallback) {
        return validateAction.bind(null, actionFunction, isOkCallback);
    }

    // Wrap `actionFunction` so that it only fires if `isOkCallback` validates that it should fire.
    function validateAction(actionFunction, isOkCallback, event, handler) {
        if (!isOkCallback(event, handler)) {
            return true;
        }
        return actionFunction(event, handler);
    }

    // A validation function for `validateAction`.
    function isTargetingVideo(event, handler) {
        return event.target instanceof HTMLVideoElement;
    }

    // A validation function for `validateAction`.
    function isNotTargetingVideo(event, handler) {
        return !isTargetingVideo(event, handler);
    }

    // Actions -----------------------------------------------------------------

    function addFavorite(event, handler) {
        const imageId = getImageId();
        window.post_vote(imageId, "up");
        window.addFav(imageId);

        log(`addFavorite: imageId [${imageId}]`);
        logHotkeysHandler(handler);

        return false;
    }

    function removeFavorite(event, handler) {
        const imageId = getImageId();
        let url = new URL("/index.php", "https://gelbooru.com");
        url.searchParams.append("page", "favorites");
        url.searchParams.append("s", "delete");
        url.searchParams.append("id", imageId);

        // Seems like there is no way to remove your vote on the image.
        // window.post_vote(imageId, "down");
        parent.location.href = url;

        log(`removeFavorite: imageId [${imageId}]`);
        logHotkeysHandler(handler);

        return false;
    }

    function toggleVideoFocus(event, handler) {
        let video = getVideo();
        if (!(video instanceof HTMLVideoElement)) {
            return true;
        }

        if (window.document.activeElement === video) {
            video.blur();
        } else {
            video.focus({ preventScroll: false });
        }

        log(`toggleVideoFocus: new activeElement [${window.document.activeElement}]`);
        logHotkeysHandler(handler);

        return false;
    }

    function toggleVideoPlay(event, handler) {
        let video;

        if (event.target instanceof HTMLVideoElement) {
            video = event.target;
        } else {
            video = getVideo();
            if (!(video instanceof HTMLVideoElement)) {
                return true;
            }
        }

        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }

        log(`toggleVideoPlay: new paused status [${video.paused}]`);
        logHotkeysHandler(handler);

        return false;
    }

    function navigatePrev(event, handler) {
        window.navigatePrev();

        log(`navigatePrev`);
        logHotkeysHandler(handler);

        return false;
    }

    function navigateNext(event, handler) {
        window.navigateNext();

        log(`navigateNext`);
        logHotkeysHandler(handler);

        return false;
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

    function historyBack(event, handler) {
        history.back();
        return false;
    }

    function historyForward(event, handler) {
        history.forward();
        return false;
    }

    function reloadPage(event, handler) {
        parent.location.reload();
        return false;
    }

    function navigateListByDelta(delta, event, handler) {
        let params = new URLSearchParams(window.location.search);

        let pid = parseInt(params.get("pid"));
        if (isNaN(pid)) {
            pid = 0;
        }
        pid = Math.max(0, pid + delta);
        params.set("pid", pid);

        if ("?" + params.toString() === parent.location.search.toString()) {
            // Nothing changed.
            return true;
        }

        parent.location.search = params;

        if (ENABLE_LOGS) {
            let dir = delta < 0 ? "prev" : "next";
            let pageNumber = 1 + Math.floor(pid / POSTS_PER_PAGE);
            log(`navigateListByDelta: dir [${dir}] pageNumber [${pageNumber}] pid [${pid}]`);
            logHotkeysHandler(handler);
        }

        return true;
    }

    function navigateListPrev(event, handler) {
        return navigateListByDelta(-POSTS_PER_PAGE, event, handler);
    }

    function navigateListNext(event, handler) {
        return navigateListByDelta(POSTS_PER_PAGE, event, handler);
    }

    setHotkeysScope();
    // log(`hotkeys scope [${window.hotkeys.getScope()}]`);
})();
