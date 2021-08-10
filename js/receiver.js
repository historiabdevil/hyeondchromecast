const LOG_RECEIVER_TAG = "RECV_CHROME";
const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();
const playbackConfig = new cast.framework.PlaybackConfig();

playerManager.addEventListener(
    cast.framework.events.EventType.ERROR, (event) => {
        castDebugLogger.error(LOG_RECEIVER_TAG, 'Detailed Error Code - ' + event.detailedErrorCode);
        if (event && event.detailedErrorCode == 905) {
            castDebugLogger.error(LOG_RECEIVER_TAG, 'LOAD_FAILED: Verify the load request is set up ' +
                'properly and the media is able to play.');
        }
    });

playerManager.setMessageInterceptor(
    cast.framework.messages.MessageType.LOAD, loadRequestData => {
        castDebugLogger.debug(LOG_RECEIVER_TAG,
            `loadRequestData: ${JSON.stringify(loadRequestData)}`);

        // If the loadRequestData is incomplete return an error message
        if (!loadRequestData || !loadRequestData.media) {
            const error = new cast.framework.messages.ErrorData(
                cast.framework.messages.ErrorType.LOAD_FAILED);
            error.reason = cast.framework.messages.ErrorReason.INVALID_REQUEST;
            return error;
        }

        // check all content source fields for asset URL or ID
        let source = loadRequestData.media.contentUrl || loadRequestData.media.entity || loadRequestData.media.contentId;

        // If there is no source or a malformed ID then return an error.
        if (!source || source == "" || !source.match(ID_REGEX)) {
            let error = new cast.framework.messages.ErrorData(
                cast.framework.messages.ErrorType.LOAD_FAILED);
            error.reason = cast.framework.messages.ErrorReason.INVALID_REQUEST;
            return error;
        }

        let sourceId = source.match(ID_REGEX)[1];

        // Add breaks to the media information and set the contentUrl
        return addBreaks(loadRequestData.media)
            .then(() => {
                // If the source is a url that points to an asset don't fetch from backend
                if (sourceId.includes('.')) {
                    castDebugLogger.debug(LOG_RECEIVER_TAG,
                        "Interceptor received full URL");
                    loadRequestData.media.contentUrl = source;
                    return loadRequestData;
                }

                // Fetch the contentUrl if provided an ID or entity URL
                else {
                    castDebugLogger.debug(LOG_RECEIVER_TAG, "Interceptor received ID");
                    return fetchMediaById(sourceId)
                        .then((item) => {
                            let metadata = new cast.framework.messages.GenericMediaMetadata();
                            metadata.title = item.title;
                            metadata.subtitle = item.description;
                            loadRequestData.media.contentId = item.stream.dash;
                            loadRequestData.media.contentType = 'application/dash+xml';
                            loadRequestData.media.metadata = metadata;
                            return loadRequestData;
                        })
                }
            })
            .catch((errorMessage) => {
                let error = new cast.framework.messages.ErrorData(
                    cast.framework.messages.ErrorType.LOAD_FAILED);
                error.reason = cast.framework.messages.ErrorReason.INVALID_REQUEST;
                castDebugLogger.error(LOG_RECEIVER_TAG, errorMessage);
                return error;
            });
    }
);


context.start({
    playerManager: playerManager,
    playbackConfig: playbackConfig
});