export default function Loader() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md bg-black/10">

            <div className="relative w-28 h-28 flex items-center justify-center">

                {/* SOFT GLOW */}
                <div className="absolute w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full"></div>

                {/* CLOCK TICKS */}
                {[...Array(12)].map((_, i) => (
                    <span
                        key={i}
                        className="tick"
                        style={{
                            transform: `rotate(${i * 30}deg) translateY(-40px)`
                        }}
                    />
                ))}

                {/* HAND */}
                <div className="hand"></div>

                {/* CENTER DOT */}
                <div className="center-dot"></div>

            </div>
        </div>
    );
}