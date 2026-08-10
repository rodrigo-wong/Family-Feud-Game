function generateRoomId(length = 5) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    return Array.from(array, byte => characters[byte % characters.length]).join('');
}

export {generateRoomId};