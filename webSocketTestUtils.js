const app = require("./app");

function startServer(port) {
    return new Promise((resolve) => {
        app.listen(port, () => resolve(app));
    })
}

function waitForSocketState(socket, state) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            if (socket.readyState === state) {
                resolve();
            } else {
                waitForSocketState(socket, state).then(resolve);
            }
        }, 5);
    });
}

module.exports = { startServer, waitForSocketState };