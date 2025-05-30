let currentResolver = null;

browser.webRequest.onCompleted.addListener(
    (details) => {
        const isRealStream =
            //details.type === 'media' &&
            //details.url.includes('/video/') &&
            details.url.endsWith('.m3u8') &&
            details.responseHeaders?.some(h =>
                h.name.toLowerCase() === 'content-type' &&
                h.value.includes('application/vnd.apple.mpegurl')
            );

        if (isRealStream && currentResolver) {
            fetch('http://localhost:3000/forward', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: details.url,
                    episode: currentResolver.episode
                })
            }).finally(() => {
                currentResolver.resolve();
                currentResolver = null;
            });
        }
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "waitForM3u8") {
        currentResolver = {
            resolve: sendResponse,
            episode: message.episode
        };
        return true;
    }
});