async function processEpisodes() {
    const waitForButtons = () => new Promise(resolve => {
        const checkInterval = setInterval(() => {
            const buttons = document.querySelectorAll('#halim-list-server .halim-btn');
            if (buttons.length > 0) {
                clearInterval(checkInterval);
                resolve(Array.from(buttons));
            }
        }, 1000);
    });

    const buttons = await waitForButtons();
    console.log(`Found ${buttons.length} episodes`);
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        console.log(`Processing episode ${i + 1}`);

        button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        await new Promise(resolve => {
            chrome.runtime.sendMessage(
                { action: "waitForM3u8", episode: i + 1 },
                () => {
                    setTimeout(resolve, 2000);
                }
            );
        });
    }
    fetch('http://localhost:3000/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
}
if (document.readyState === 'complete') {
    setTimeout(processEpisodes, 5000);
} else {
    window.addEventListener('load', () => {
        setTimeout(processEpisodes, 5000);
    });
}