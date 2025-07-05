/**
 * SDK Client Events
 */
export var ClientEvent;
(function (ClientEvent) {
    // Connection events
    ClientEvent["CONNECT"] = "connect";
    ClientEvent["DISCONNECT"] = "disconnect";
    // Authentication events
    ClientEvent["AUTH_SUCCESS"] = "auth:success";
    ClientEvent["AUTH_FAIL"] = "auth:fail";
    ClientEvent["AUTH_REVOKED"] = "auth:revoked";
    // Error event
    ClientEvent["ERROR"] = "error";
    // Game
    ClientEvent["GAME_FINISHED_LOADING"] = "game:finished_loading";
})(ClientEvent || (ClientEvent = {}));
