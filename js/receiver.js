const LOG_RECEIVER_TAG = "RECV_CHROME";
const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();
const playbackConfig = new cast.framework.PlaybackConfig();
cast.framework.CastReceiverContext.getInstance().setLoggerLevel(cast.framework.LoggerLevel.DEBUG);
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

playerManager.setMediaPlaybackInfoHandler((loadRequestData, playbackConfig) =>{
    playbackConfig.licenUrl = loadRequestData.media.customData['license_url'];
    playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
})

context.start({
    playerManager: playerManager,
    playbackConfig: playbackConfig
});