const axios = require("axios");

const BASE_URL = "https://opentdb.com/api.php?";

class TriviaApi {

    static async getToken() {
        const res = await axios.get("https://opentdb.com/api_token.php?command=request");
        return res.data.token;
    }

    static async getQuestions(num, token) {
        const res = await axios.get(`https://opentdb.com/api.php?amount=${num}&type=multiple&token=${token}`)
        return res.data.results;
    }
}

module.exports = { TriviaApi };