import { QRCodeSVG } from 'qrcode.react';
import {useLocation, useNavigate} from "react-router-dom";
import {io} from "socket.io-client";
import {useEffect} from "react";

const socket = io(import.meta.env.VITE_BACKEND_URL);
export default function QRCode() {
    const location = useLocation();
    const navigate = useNavigate();
    const roomId = location.state?.roomId;
    const url = `${import.meta.env.VITE_FRONTEND_URL}/host?roomId=${roomId}`;
    useEffect(() => {
        if (!roomId) return;

        const handleUserJoined = (data) => {
            console.log('User joined payload:', data);
            console.log(roomId)
            if (data?.role === 'host') {
                let questions;
                try {
                    const stored = localStorage.getItem('familyFeudQuestions');
                    questions = stored ? JSON.parse(stored) : [];
                } catch {
                    questions = [];
                }
                socket.emit('send_action', {
                    channel: roomId,
                    action: { type: 'GAME_DATA_SYNC', payload: { questions } },
                });

                navigate(`/play?roomId=${roomId}`);
            }
        };

        socket.on('user_joined', handleUserJoined);
        socket.emit('join_channel', {roomId: roomId});

        return () => {
            socket.off('user_joined', handleUserJoined);
        };
    }, [roomId, navigate]);
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