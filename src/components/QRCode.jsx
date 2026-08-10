import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCode({ roomId }) {
    const url = `https://127.0.0.1:5173/host?room=${roomId}`;

    return (
        <div className="inline-flex flex-col items-center">
            <QRCodeSVG
                value={url}
                size={200}
                level={'M'}
                bgColor={"#E0F7FA"}
                fgColor={"#006064"}
                includeMargin={false}
            />
            <p className="mt-3 text-base font-bold text-gray-800 text-center">
                Scan QR Code to start hosting the Game Session
            </p>
        </div>
    );
}