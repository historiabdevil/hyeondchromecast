const LOG_RECEIVER_TAG = "RECV_CHROME";
const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();
const playbackConfig = new cast.framework.PlaybackConfig();

playerManager.addEventListener(
    cast.framework.events.EventType.ERROR, (event) => {
        if (event && event.detailedErrorCode == 905) {
        }
    });

playerManager.setMessageInterceptor(
    cast.framework.messages.MessageType.LOAD, loadRequestData => {
        console.log(loadRequestData);
        return loadRequestData;
    }
);


context.start({
    playerManager: playerManager,
    playbackConfig: playbackConfig
});