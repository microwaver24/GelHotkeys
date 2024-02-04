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

    var _enableLogs = true;

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
    }

    function removeFavorite() {
        const imageId = getImageId();
        var url = new URL("/index.php", "https://gelbooru.com");
        url.searchParams.append("page", "favorites");
        url.searchParams.append("s", "delete");
        url.searchParams.append("id", imageId);
        parent.location.href = url;

        if (_enableLogs) {
            console.log(`removeFavorite: imageId [${imageId}]`);
        }
    }

    function handleInput(e) {
        if (_enableLogs) {
            console.log(`handleInput: code [${e.code}] key [${e.key}] keyCode [${e.keyCode}]`);
        }

        var inputIsHandled = false;
        switch (e.code) {
            // case "KeyB": // "B" for "bookmark".
            case "Numpad0": // This is just close to the arrow keys, so it's convenient.
                addFavorite();
                inputIsHandled = true;
                break;
            // case "KeyN": // "N" for "no bookmark".
            case "Numpad1": // This is just close to the arrow keys, so it's convenient.
                removeFavorite();
                inputIsHandled = true;
                break;
        }

        if (!inputIsHandled) {
            switch (e.key) {
                case "b": // "b" for "bookmark".
                    addFavorite();
                    inputIsHandled = true;
                    break;
                case "B": // "shift + b" to do the reverse.
                    removeFavorite();
                    inputIsHandled = true;
                    break;
            }
        }

        if (inputIsHandled) {
            e.preventDefault();
            e.stopPropagation();
        }

        return !inputIsHandled;
    }

    parent.onkeypress = function (e) {
        var inputResult = handleInput(e);

        if (inputResult != false) {
            inputResult = handleInput(window.event);
        }

        return inputResult;
    };
})();
