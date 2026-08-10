import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCode({ roomId }) {
    const url = `${import.meta.env.VITE_FRONTEND_URL}/host?room=${roomId}`;

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