import { setUserSocket, removeUserSocket } from "./userSockets.js";

export default function wsConfig(io) {
    io.on("connection", (socket) => {
        console.log("🔥 Socket connected---------->>:", socket.id);

        socket.on("identify", (userId) => {
            console.log("User identified:=====>", userId);
            setUserSocket(userId, socket);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected========>>:", socket.id);
            removeUserSocket();
        });
    });
}
