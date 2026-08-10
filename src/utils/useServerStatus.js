import { useContext } from 'react';
import { ServerStatusContext } from './ServerStatusContext.jsx';

function useServerStatus() {
    return useContext(ServerStatusContext);
}

export default useServerStatus;
