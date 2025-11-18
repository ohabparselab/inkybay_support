const userSockets = new Map();
export function setUserSocket(userId, socket) {
    userSockets.set(userId, socket);
    console.log("======>>", userSockets)

}

export function getUserSocket(userId) {
    return userSockets.get(userId);
}

export function removeUserSocket(userId) {
    userSockets.delete(userId);
}
