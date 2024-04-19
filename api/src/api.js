require("dotenv-flow").config();
const { buildErrorResponse } = require("./utils");
const express = require("express");
const timeout = require("express-timeout-handler");
const app = express();
const fs = require("fs");
const path = require('path');

const {
    getPlayerElo, getPlayerFullInfo, getPlayerHistory, getPlayerPersonalData, getPlayerRank,
} = require("./main");

/**
 * Server configurations
 */
const DEFAULT_PORT = 3000;
const DEFAULT_REQUEST_TIMEOUT = 10000;
const API_INFO_URL = "https://github.com/xRuiAlves/fide-ratings-scraper/blob/master/README.md#api";
const port = process.env.PORT || DEFAULT_PORT;
const request_timeout = parseInt(process.env.RESPONSE_TIMEOUT_MS, 10) || DEFAULT_REQUEST_TIMEOUT;

/**
 * Request timeout setup
 */
app.use(timeout.handler({
    timeout: request_timeout,
    onTimeout: (_req, res) => res.status(408).send(),
}));

/**
 * Server response headers middleware
 */
app.use((_req, res, next) => {
    res.set("Content-Type", "application/json");
    res.set("Access-Control-Allow-Origin", "*");

    next();
});

/**
 * Root endpoint
 */
app.get("/", (_req, res) => {
    res.json(`Greetings! Please refer to  ${API_INFO_URL}  for info about the available endpoints.`);
});

/**
 * Player fide number parameter validator middleware
 */
app.get("/player/:fide_num/*", (req, res, next) => {
    const { fide_num } = req.params;

    if (isNaN(fide_num)) {
        return res.status(400).json(
            buildErrorResponse("The player's fide number must be a positive integer number",
            ));
    } else {
        next();
    }
});

/**
 * GET player information endpoint
 */
app.get("/player/:fide_num/info", (req, res) => {
    const { fide_num } = req.params;
    const { include_history } = req.query;

    getPlayerFullInfo(fide_num, include_history)
        .then((data) => res.json(data))
        .catch((err) => playerEndpointsErrorHandler(err, res));
});

/**
 * GET player personal data endpoint
 */
app.get("/player/:fide_num/personal-data", (req, res) => {
    const { fide_num } = req.params;

    getPlayerPersonalData(fide_num)
        .then((data) => res.json(data))
        .catch((err) => playerEndpointsErrorHandler(err, res));
});

/**
 * GET player ranking endpoint
 */
app.get("/player/:fide_num/rank", (req, res) => {
    const { fide_num } = req.params;

    getPlayerRank(fide_num)
        .then((data) => res.json(data))
        .catch((err) => playerEndpointsErrorHandler(err, res));
});

/**
 * GET player elo rating endpoint
 */
app.get("/player/:fide_num/elo", (req, res) => {
    const { fide_num } = req.params;

    getPlayerElo(fide_num)
        .then((data) => res.json(data))
        .catch((err) => playerEndpointsErrorHandler(err, res));
});

/**
 * GET player history endpoint
 */
app.get("/player/:fide_num/history/", (req, res) => {
    const { fide_num } = req.params;

    getPlayerHistory(fide_num)
        .then((data) => res.json(data))
        .catch((err) => playerEndpointsErrorHandler(err, res));
});

/**
 * Page not found fallback
 */
app.get("*", (_req, res) => res.status(404).send(""));

/**
 * Handles requests error responses
 * @param {String} err
 * @param {Object} res
 */
const playerEndpointsErrorHandler = (err, res) => {
    if (err === "Not found") {
        return res.status(404).json(buildErrorResponse(
            "Requested player does not exist",
        ));
    }
    return res.status(500).json(buildErrorResponse(
        "Failed to fetch player information",
    ));
};


/**
 * Function to fetch Elo data for each FIDE ID and save it to a JSON file
 */
const fetchEloData = async (fideIds) => {
    const eloData = {};
    for (const fideId of fideIds) {
        try {
            const [playerElo, personalData, history] = await Promise.all([
                getPlayerElo(fideId),
                getPlayerPersonalData(fideId),
                getPlayerHistory(fideId),
            ]);

            // Parse history data
            const parsedHistory = history.map((entry) => ({
                date: entry.date,
                numeric_date: entry.numeric_date,
                standard: parseInt(entry.standard) === "Notrated" ? "Not rated" : parseInt(entry.standard),
                rapid: parseInt(entry.rapid) === "Notrated" ? "Not rated" : parseInt(entry.rapid),
                blitz: parseInt(entry.blitz) === "Notrated" ? "Not rated" : parseInt(entry.blitz),
            }));

            // Calculate differences between the first two dates
            let standardDiff = "";
            let rapidDiff = "";
            let blitzDiff = "";

            if (parsedHistory.length >= 2) {
                standardDiff =
                    parsedHistory[0].standard - parsedHistory[1].standard;
                rapidDiff = parsedHistory[0].rapid - parsedHistory[1].rapid;
                blitzDiff = parsedHistory[0].blitz - parsedHistory[1].blitz;

                // Convert 0 to empty string for diffs
                if (standardDiff === 0 || standardDiff === null) standardDiff = "";
                if (rapidDiff === 0 || rapidDiff === null) rapidDiff = "";
                if (blitzDiff === 0 || blitzDiff === null) blitzDiff = "";
            } else {
                standardDiff = isNaN(parsedHistory[0].standard) ? "" : "new";
                rapidDiff = isNaN(parsedHistory[0].rapid) ? "" : "new";
                blitzDiff = isNaN(parsedHistory[0].blitz) ? "" : "new";

            }

            eloData[fideId] = {
                elo: playerElo,
                name: personalData.name,
                standardDiff,
                rapidDiff,
                blitzDiff,
            };

            console.log(`Elo data for FIDE ID ${fideId}:`, playerElo);
            console.log(`Name for FIDE ID ${fideId}:`, personalData.name);
            console.log(
                `Standard Elo Difference for FIDE ID ${fideId}:`,
                standardDiff
            );
            console.log(
                `Rapid Elo Difference for FIDE ID ${fideId}:`,
                rapidDiff
            );
            console.log(
                `Blitz Elo Difference for FIDE ID ${fideId}:`,
                blitzDiff
            );
        } catch (error) {
            console.error(`Error fetching data for FIDE ID ${fideId}:`, error);
        }
    }
    return eloData;
};

/**
 * Function to save Elo data to a JSON file
 */
const saveEloDataToFile = async () => {
    const fideIds = [
        1976508,
        14173328,
        24151327,
        1910116,
        1928660,
        1947745,
        1971891,
        1976494,
        1915312,
        1976656,
        1939823,
        34173153,
        1969323,
        1976613,
        1924893,
        1980378,
        1983148,
        1967495,
        1983377,
        1960210,
        1972332,
        1980521,
        1935216,
        1976648,
        1979833,
        34197885,
        1976672,
        1929801,
        1979280,
        1980661,
        1912704,
        1976699,
        34198261,
        1937839,
        1979248,
        1976680,
        1964585,
        1922629,
        1980645,
        1983733,
        1965263,
        34184740,
        34184767,
        34184759
    ];

    try {
        const eloData = await fetchEloData(fideIds);
        const dataDirectory = path.resolve(__dirname, '../../src/data');
        const filePath = path.join(dataDirectory, 'musas-data.json');
        fs.writeFileSync(filePath, JSON.stringify(eloData, null, 2));
        console.log('Elo data saved to musas-data.json');
    } catch (error) {
        console.error('Error fetching or saving Elo data:', error);
    }
};

/**
 * Start the server and save Elo data to a JSON file
 */
const startServer = async () => {
    await saveEloDataToFile();
    app.listen(port, () => console.info(`Started listening on ${port} . . .`));
};

startServer();
