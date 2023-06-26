const { startServer, waitForSocketState } = require("./webSocketTestUtils");
const WebSocket = require("ws");
const app = require("./app");

const port = 3001;

describe("WebSocket Server", () => {
    let server;
    //let client;

    beforeAll(async () => {
        server = await startServer(port);
        //server = app.listen(port);

    })

    afterAll(() => {
        //console.log("SERVER: ", server);
        server.close()
        // Says .close is not a method, yet server is a returned
        // express app.listen.  WHY?
    });

    // beforeEach(async () => {
    //     client = new WebSocket(`ws://localhost:${port}/games/aaaaa`);
    //     await waitForSocketState(client, client.OPEN);
    // })

    test("can open WS connection", async () => {
        // Create test client
        const client = new WebSocket(`ws://localhost:${port}/games/aaaaa`);
        await waitForSocketState(client, client.OPEN);

        const testMessage = "hello";
        let responseMessage;

        client.on("message", (data) => {
            responseMessage = data;
            console.log("RESPONSE MESSAGE: ", responseMessage);
            // responseMessage comes in as Hexadecimal.  WHY?

            //Close the client after it receives the response
            client.close();
            // I think this is not working because see below...
        });

        // Send client message
        client.send(testMessage)

        // Perform Assertions on the response
        await waitForSocketState(client, client.CLOSED);
        // I think this isn't resolving becase the console.log below never prints
        console.log("responseMessage: ", responseMessage);
    });
});