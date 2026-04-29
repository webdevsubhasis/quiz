export const exitFullscreenSafe = async () => {
    if (document.fullscreenElement) {
        try {
            await document.exitFullscreen();
        } catch (err) {
            console.error("Exit fullscreen failed", err);
        }
    }
};