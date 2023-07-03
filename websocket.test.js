/** This test is imcomplete and not working correctly.
 * This is a work in progress.
 */

const { startServer, waitForSocketState } = require("./webSocketTestUtils");
const WebSocket = require("ws");
const app = require("./app");

const port = 3001;

describe("WebSocket Server", () => {
    let server;

    beforeAll(async () => {
        server = await startServer(port);

    })

    afterAll(() => {
        server.close()
    });

    test("can open WS connection", async () => {
        // Create test client
        const client = new WebSocket(`ws://localhost:${port}/games/aaaaa`);
        await waitForSocketState(client, client.OPEN);

        const testMessage = "hello";
        let responseMessage;

        client.on("message", (data) => {
            responseMessage = data;
            console.log("RESPONSE MESSAGE: ", responseMessage);

            //Close the client after it receives the response
            client.close();
        });

        // Send client message
        client.send(testMessage)

        // Perform Assertions on the response
        await waitForSocketState(client, client.CLOSED);
        console.log("responseMessage: ", responseMessage);
    });
});