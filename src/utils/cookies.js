function setCookie(name, value, maxAgeSeconds) {
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
}

function getCookie(name) {
    const target = `${encodeURIComponent(name)}=`;
    const match = document.cookie.split('; ').find((row) => row.startsWith(target));
    return match ? decodeURIComponent(match.slice(target.length)) : null;
}

export {setCookie, getCookie};
