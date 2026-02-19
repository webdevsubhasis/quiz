export default function FullscreenToggle() {
  const toggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <button className="fullscreen-btn" onClick={toggle}>
      ⛶ Fullscreen
    </button>
  );
}
