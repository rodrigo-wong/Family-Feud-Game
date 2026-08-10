import { useLayoutEffect, useRef, useState } from 'react';

// Shared offscreen canvas for text measurement — cheaper than creating one per instance,
// and avoids mutating the SVG text node's own attributes to measure it (which raced with
// React's controlled fontSize prop and could leave stale, overflowing sizes on screen).
let measureCtx;
function getMeasureContext() {
    if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
    return measureCtx;
}

// Renders text inside an SVG sized to the container's exact pixel box (tracked via
// ResizeObserver) so there's no viewBox/aspect-ratio letterboxing. The font-size is derived
// from the box's own height, then reduced if needed so the text's measured width still fits —
// short answers grow to fill the row instead of sitting small in the middle, long ones shrink
// instead of overflowing. Overflow is clipped as a backstop for any residual mismatch.
function FitText({ text, className = '', maxFontSizeRatio = 0.6, padding = 4 }) {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [box, setBox] = useState({ width: 0, height: 0 });
    const [fontSize, setFontSize] = useState(0);

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const update = () => setBox({ width: el.clientWidth, height: el.clientHeight });
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useLayoutEffect(() => {
        const node = textRef.current;
        if (!node || !box.width || !box.height) return;

        const probeSize = box.height * maxFontSizeRatio;
        const computed = window.getComputedStyle(node);
        const ctx = getMeasureContext();
        ctx.font = `${computed.fontWeight} ${probeSize}px ${computed.fontFamily}`;
        const naturalWidth = ctx.measureText(text).width;

        const availableWidth = (box.width - padding * 2) * 0.96;
        const widthScale = naturalWidth > 0 ? Math.min(1, availableWidth / naturalWidth) : 1;

        setFontSize(probeSize * widthScale);
    }, [text, box, maxFontSizeRatio, padding]);

    return (
        <div ref={containerRef} className="w-full h-full overflow-hidden">
            <svg width={box.width} height={box.height} className="block overflow-hidden">
                <text
                    ref={textRef}
                    x="50%"
                    y="55%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={fontSize}
                    className={`fill-current ${className}`}
                >
                    {text}
                </text>
            </svg>
        </div>
    );
}

export default FitText;
