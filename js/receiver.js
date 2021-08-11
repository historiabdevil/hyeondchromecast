window.onload = function () {
    if (typeof console  != "undefined")
        if (typeof console.log != 'undefined')
            console.olog = console.log;
        else
            console.olog = function() {};

    console.log = function(message) {
        console.olog(message);
        $('#debugDiv').append('<p>' + message + '</p>');
    };
    console.error = console.debug = console.info =  console.log
    cast.framework.CastReceiverContext.getInstance().setLoggerLevel(cast.framework.LoggerLevel.DEBUG);
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

    playbackConfig.licenseUrl = 'https://license-global.pallycon.com/ri/licenseManager.do';
    playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
    playbackConfig.licenseRequestHandler = requestInfo => {
        // requestInfo.withCredentials = true;
        requestInfo.headers = {
            'pallycon-customdata-v2': 'eyJkcm1fdHlwZSI6IldpZGV2aW5lIiwic2l0ZV9pZCI6IkpLUEIiLCJ1c2VyX2lkIjoiY2F0ZW5vaWR0ZXN0IiwiY2lkIjoiMjAxOTA5MDktZXYwMDl5dXEiLCJ0b2tlbiI6ImZ3Zk1SODAxU0RsNEhkMDBDZGtLMkJrWUQ0cTBlSmJDU2w4emZBQXRZTHJVM2ZzaXVtbmNtcm0wS051OWVxSXpRTlhldkgyck1Mb2YzT3MySmxsRldUZFA2NWl5d2lMZ0VWakQwVHllVGx3M2N1ODNsbVhhTVVONERiaEtGWURGSXhhK2grXC9vSjNsTkVjb0hOcTF2UGVJZ1prYm1cL0JWZDNhQ0lERDZxdDY3WURzZ1pnaWlKUWFZSzBiOFZKSnlQIiwidGltZXN0YW1wIjoiMjAyMS0wOC0xMVQwNjoyMDo0N1oiLCJoYXNoIjoiK09CUkFQMVlQS1AxMGVsd3lwSUFOXC9XXC9qZ3ZnVkx0NjIxMHZOcEZ0SlhRPSJ9'
        }
        return playbackConfig;
    };

    playerManager.addEventListener(
        cast.framework.events.EventType.ERROR, (event) => {
            if (event && event.detailedErrorCode == 905) {
            }
        });

    playerManager.setMessageInterceptor(
        cast.framework.messages.MessageType.LOAD, loadRequestData => {
            castDebugLogger.info(LOG_RECEIVER_TAG,
                JSON.stringify(loadRequestData));
            console.log(loadRequestData);
            return loadRequestData;
        }
    );

    playerManager.setMediaPlaybackInfoHandler((loadRequestData, playbackConfig) => {
        playbackConfig.licenseUrl = 'https://license-global.pallycon.com/ri/licenseManager.do';
        playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
        playbackConfig.licenseRequestHandler = requestInfo => {
            // requestInfo.withCredentials = true;
            requestInfo.headers = {
                'pallycon-customdata-v2': 'eyJkcm1fdHlwZSI6IldpZGV2aW5lIiwic2l0ZV9pZCI6IkpLUEIiLCJ1c2VyX2lkIjoiY2F0ZW5vaWR0ZXN0IiwiY2lkIjoiMjAxOTA5MDktZXYwMDl5dXEiLCJ0b2tlbiI6ImZ3Zk1SODAxU0RsNEhkMDBDZGtLMkJrWUQ0cTBlSmJDU2w4emZBQXRZTHJVM2ZzaXVtbmNtcm0wS051OWVxSXpRTlhldkgyck1Mb2YzT3MySmxsRldUZFA2NWl5d2lMZ0VWakQwVHllVGx3M2N1ODNsbVhhTVVONERiaEtGWURGSXhhK2grXC9vSjNsTkVjb0hOcTF2UGVJZ1prYm1cL0JWZDNhQ0lERDZxdDY3WURzZ1pnaWlKUWFZSzBiOFZKSnlQIiwidGltZXN0YW1wIjoiMjAyMS0wOC0xMVQwNjoyMDo0N1oiLCJoYXNoIjoiK09CUkFQMVlQS1AxMGVsd3lwSUFOXC9XXC9qZ3ZnVkx0NjIxMHZOcEZ0SlhRPSJ9'
            }
            return playbackConfig;
        };
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
    context.getPlayerManager().setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
        if (loadRequest.media.customData && loadRequest.media.customData.licenseUrl) {
            playbackConfig.licenseUrl = loadRequest.media.customData['license_url'];
        }
        return playbackConfig;
    });
}