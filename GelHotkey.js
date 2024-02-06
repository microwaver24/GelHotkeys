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
// @comment      Input handling code from here: https://github.com/jaywcjlove/hotkeys-js
// ==/UserScript==

// Ideas for more features:
// Editable hotkeys
// Blacklist tag shortcut, maybe alt+click a tag?

(function () {
    "use strict";

    let _enableLogs = false;

    // Input Binding -----------------------------------------------------------

    // Bind hotkeys to actions.
    window.hotkeys("num_0,b", addFavorite); // "b" for "bookmark"

    window.hotkeys("num_decimal,shift+b", removeFavorite);

    window.hotkeys("num_2,v", toggleVideoFocus); // "v" for "video"

    window.hotkeys("num_1", toggleVideoPlay);
    window.hotkeys("space", function (event, handler) {
        if (event.target instanceof HTMLVideoElement) {
            // If the video is focused, let it handle the space bar input itself.
            return true;
        }
        return toggleVideoPlay(event, handler);
    });

    window.hotkeys("num_4", navigatePrev);
    window.hotkeys("shift+left", function (event, handler) {
        if (!(event.target instanceof HTMLVideoElement)) {
            return true;
        }
        return navigatePrev(event, handler);
    });

    window.hotkeys("num_6", navigateNext);
    window.hotkeys("shift+right", function (event, handler) {
        if (!(event.target instanceof HTMLVideoElement)) {
            return true;
        }
        return navigateNext(event, handler);
    });

    window.hotkeys("num_7", historyBack);
    window.hotkeys("num_9", historyForward);

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

    function logObjProps(obj) {
        if (!_enableLogs) {
            return;
        }

        for (var property in obj) {
            console.log(`${property}: ${obj[property]}`);
        }
    }

    function logHotkeysHandler(handler) {
        // logObjProps(handler);
    }

    // Actions -----------------------------------------------------------------

    function addFavorite(event, handler) {
        const imageId = getImageId();
        window.post_vote(imageId, "up");
        window.addFav(imageId);

        if (_enableLogs) {
            console.log(`addFavorite: imageId [${imageId}]`);
            logHotkeysHandler(handler);
        }

        return false;
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
            logHotkeysHandler(handler);
        }

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

        if (_enableLogs) {
            console.log(`toggleVideoFocus: new activeElement [${window.document.activeElement}]`);
            logHotkeysHandler(handler);
        }

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

        if (_enableLogs) {
            console.log(`toggleVideoPlay: new paused status [${video.paused}]`);
            logHotkeysHandler(handler);
        }

        return false;
    }

    function navigatePrev(event, handler) {
        window.navigatePrev();

        if (_enableLogs) {
            console.log(`navigatePrev`);
            logHotkeysHandler(handler);
        }

        return false;
    }

    function navigateNext(event, handler) {
        window.navigateNext();

        if (_enableLogs) {
            console.log(`navigateNext`);
            logHotkeysHandler(handler);
        }

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

    // todo: maybe I can just set the video to start playing right away so I don't need to focus or unfocus it.
    // autoPlayVideo();

    function historyBack(event, handler) {
        history.back();
        return false;
    }

    function historyForward(event, handler) {
        history.forward();
        return false;
    }
})();
