import { QRCodeSVG } from 'qrcode.react';
import {useLocation} from "react-router-dom";


export default function QRCode() {
    const location = useLocation();

    const url = `https://127.0.0.1:4000/host?room=${location.state.roomId}&role=host`;

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
            <div
                className="ff-board relative border-4 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.35)] flex flex-col items-center justify-center p-8 sm:p-12"
                style={{
                    borderRadius: '2rem',
                    backgroundColor: '#050b24cc',
                    backgroundImage: `radial-gradient(
            circle, 
            #ffffff 0px, 
            #facc15 1.5px, 
            rgba(250, 204, 21, 0.4) 3.5px, 
            rgba(250, 204, 21, 0.1) 6px, 
            transparent 7px
          )`,
                }}
            >
                <QRCodeSVG
                    value={url}
                    size={200}
                    level={'M'}
                    bgColor={"#E0F7FA"}
                    fgColor={"black"}
                    includeMargin={false}
                    className="rounded-lg"
                />

                <p className="mt-4 text-base font-bold text-yellow-300 text-center max-w-xs drop-shadow">
                    Scan QR Code to start hosting the Game Session
                </p>
            </div>
        </div>
    );
}