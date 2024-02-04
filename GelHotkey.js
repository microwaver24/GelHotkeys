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
        return window.document.querySelector("#gelcomVideoPlayer");
        // This might be safer in the long run if they change the query selector or something.
        // return document.getElementsByTagName("video")[0];
    }

    function toggleVideoFocus() {
        let video = document.getElementsByTagName("video")[0];
        if ((!video) instanceof HTMLVideoElement) {
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

    function autoPlayVideo() {
        let video = getVideo();
        if ((!video) instanceof HTMLVideoElement) {
            return;
        }

        video.autoplay = true;
    }

    function navigatePrev(e) {
        if (!e.shiftKey) {
            return false;
        }

        if ((!e.target) instanceof HTMLVideoElement) {
            return false;
        }

        window.navigatePrev();
        return true;
    }

    function navigateNext(e) {
        if (!e.shiftKey) {
            return false;
        }

        if ((!e.target) instanceof HTMLVideoElement) {
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
            case "Numpad0": // This is just close to the arrow keys, so it's convenient.
                inputIsHandled = addFavorite();
                break;
            case "Numpad1": // This is just close to the arrow keys, so it's convenient.
                inputIsHandled = removeFavorite();
                break;
            case "ArrowLeft":
                inputIsHandled = navigatePrev(e);
                break;
            case "ArrowRight":
                inputIsHandled = navigateNext(e);
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
        let inputResult = handleInput(e);

        if (inputResult != false) {
            inputResult = handleInput(window.event);
        }

        return inputResult;
    };

    // todo: maybe I can just set the video to start playing right away so I don't need to focus or unfocus it.
})();
