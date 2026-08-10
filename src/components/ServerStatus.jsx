import useServerStatus from '../utils/useServerStatus.js';

function ServerStatus() {
    const isOnline = useServerStatus();

    const label = isOnline === null ? 'Checking...' : isOnline ? 'Online' : 'Offline';
    const dotColor = isOnline === null ? 'bg-gray-400' : isOnline ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-gray-900 border-2 border-white px-4 py-2 text-white text-sm">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotColor}`}/>
            <span>{label}</span>
        </div>
    );
}

export default ServerStatus;
