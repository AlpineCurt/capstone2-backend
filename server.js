const app = require("./app.js");
const { PORT } = require("./config.js");

app.listen(PORT, () => {
    console.log(`Started on http://localhost:${PORT}`)
})