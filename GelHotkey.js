// ==UserScript==
// @name         Gelbooru Hotkeys
// @namespace    http://tampermonkey.net/
// @version      2024-02-03
// @description  Add some hotkeys while browsing posts on Gelbooru.
// @author       microwaver24
// @match        *://gelbooru.com/index.php?page=post&s=view*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gelbooru.com
// @grant        none
// ==/UserScript==

// Hotkeys:
// Favorite post: "b" or numpad 0
// Unfavorite post: "B" or numpad 1
// Focus/unfocus video: "v"
// Play/pause video (without focusing it): space
// Previous post (while focusing video): shift + arrow left or shift + numpad 4 with numlock off
// Next post (while focusing video): shift + arrow right or shift + numpad 6 with numlock off

(function () {
    "use strict";

    let _enableLogs = false;

    function getImageId() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
    }

    function addFavorite() {
        const imageId = getImageId();
        window.post_vote(imageId, "up");
        window.addFav(imageId);

        if (_enableLogs) {
            console.log(`addFavorite: imageId [${imageId}]`);
        }

        return true;
    }

    function removeFavorite() {
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

    function getVideo() {
        // This way seems like it might be more accurate if there are multiple videos in the page for some reason.
        // return window.document.querySelector("#gelcomVideoPlayer");

        // This might be safer in the long run if they change the query selector of the video or something.
        return document.getElementsByTagName("video")[0];
    }

    function toggleVideoFocus() {
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

    function toggleVideoPlay(e) {
        // If we are focusing the video, let the video's normal handling do its thing.
        if (e.target instanceof HTMLVideoElement) {
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

    function autoPlayVideo() {
        let video = getVideo();
        if (!(video instanceof HTMLVideoElement)) {
            return;
        }

        // This doesn't work because of permissions.
        video.autoplay = true;
        video.play();
    }

    function navigatePrev(e) {
        if (!(e.target instanceof HTMLVideoElement)) {
            return false;
        }

        window.navigatePrev();
        return true;
    }

    function navigateNext(e) {
        if (!(e.target instanceof HTMLVideoElement)) {
            return false;
        }

        window.navigateNext();
        return true;
    }

    function handleInput(e) {
        if (_enableLogs) {
            console.log(
                `handleInput:` +
                    ` code [${e.code}]` +
                    ` key [${e.key}]` +
                    ` keyCode [${e.keyCode}]` +
                    ` shiftKey [${e.shiftKey}]` +
                    ` target [${e.target}] [${typeof e.target}]`,
            );
        }

        let inputIsHandled = false;

        // Check keys by location.
        switch (e.code) {
            // Acccept only the numpad and not the number keys since it's conveniently close to the arrow keys.
            case "Numpad0":
                // Make sure numlock is on.
                if (e.key === "0") {
                    inputIsHandled = addFavorite();
                }
                break;
            // Acccept only the numpad and not the number keys since it's conveniently close to the arrow keys.
            case "Numpad1":
                // Make sure numlock is on.
                if (e.key === "1") {
                    inputIsHandled = removeFavorite();
                }
                break;
            case "Space":
                inputIsHandled = toggleVideoPlay(e);
                break;
        }

        if (!inputIsHandled) {
            // Check keys by name.
            switch (e.key) {
                case "b": // "b" for "bookmark".
                    inputIsHandled = addFavorite();
                    break;
                case "B": // "shift + b" to do the reverse.
                    inputIsHandled = removeFavorite();
                    break;
                case "v": // "v" for "video".
                    inputIsHandled = toggleVideoFocus();
                    break;

                // Arow keys are handled by `key` instead of `code` so that you can use the numpad with numlock off,
                // since that works in the existing Gelbooru hotkeys.
                case "ArrowLeft":
                    if (e.shiftKey) {
                        inputIsHandled = navigatePrev(e);
                    }
                    break;
                case "ArrowRight":
                    if (e.shiftKey) {
                        inputIsHandled = navigateNext(e);
                    }
                    break;
            }
        }

        if (inputIsHandled) {
            e.preventDefault();
            e.stopPropagation();
        }

        return inputIsHandled != true;
    }

    // Using `onkeydown` instead of `onkeypress` so that I can detect the arrow keys.
    parent.onkeydown = function (e) {
        // If you type in a text box, disable all input handling.
        // You'll have to click something besides the text box to get the hotkeys back.
        if (e.target instanceof HTMLInputElement) {
            return;
        }

        let inputResult = handleInput(e);

        if (inputResult != false) {
            inputResult = handleInput(window.event);
        }

        return inputResult;
    };

    // todo: maybe I can just set the video to start playing right away so I don't need to focus or unfocus it.
    // autoPlayVideo();
})();
