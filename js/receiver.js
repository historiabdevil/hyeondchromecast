const LOG_RECEIVER_TAG = "RECV_CHROME";
const context = cast.framework.CastReceiverContext.getInstance();
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
castDebugLogger.loggerLevelByEvents = {
    'cast.framework.events.category.CORE': cast.framework.LoggerLevel.INFO,
    'cast.framework.events.EventType.MEDIA_STATUS': cast.framework.LoggerLevel.DEBUG
}
castDebugLogger.setEnabled(true);
castDebugLogger.showDebugLogs(true);
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
        castDebugLogger.debug(LOG_RECEIVER_TAG,
            JSON.stringify(loadRequestData));
        console.log(loadRequestData);
        playbackConfig.licenUrl = loadRequestData.media.customData['license_url'];
        playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;

        return loadRequestData;
    }
);

playerManager.setMediaPlaybackInfoHandler((loadRequestData, playbackConfig) => {
    playbackConfig.licenUrl = loadRequestData.media.customData['license_url'];
    playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
})

const controls = cast.framework.ui.Controls.getInstance();
controls.clearDefaultSlotAssignments();

/**
 * Assign buttons to control slots.
 */
controls.assignButton(
    cast.framework.ui.ControlsSlot.SLOT_SECONDARY_1,
    cast.framework.ui.ControlsButton.QUEUE_PREV
);
controls.assignButton(
    cast.framework.ui.ControlsSlot.SLOT_PRIMARY_1,
    cast.framework.ui.ControlsButton.CAPTIONS
);
controls.assignButton(
    cast.framework.ui.ControlsSlot.SLOT_PRIMARY_2,
    cast.framework.ui.ControlsButton.SEEK_FORWARD_15
);
controls.assignButton(
    cast.framework.ui.ControlsSlot.SLOT_SECONDARY_2,
    cast.framework.ui.ControlsButton.QUEUE_NEXT
);

context.start({
    playbackConfig: playbackConfig,
    supportedCommands: cast.framework.messages.Command.ALL_BASIC_MEDIA |
        cast.framework.messages.Command.QUEUE_PREV |
        cast.framework.messages.Command.QUEUE_NEXT |
        cast.framework.messages.Command.STREAM_TRANSFER
});