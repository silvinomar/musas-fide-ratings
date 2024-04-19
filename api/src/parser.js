/* eslint-disable array-callback-return */
const cheerio = require("cheerio");
const { parseDate } = require("./utils");

/**
 * Parse player ranking from FIDE player page
 * @param {Object} data
 * @throws {String}
 * @returns {JSON} Player ranking
 */
const parseRankFromProfilePage = (data) => {
    const $ = cheerio.load(data);
    if ($(".profile-bottom").length === 0) {
        throw "Not found";
    }

    const world_rank_all_players = parseInt($("table.profile-table:first-child tbody tr:nth-child(1) td")[2].children[0].data, 10);
    const world_rank_active_players = parseInt($("table.profile-table:first-child tbody tr:nth-child(2) td")[1].children[0].data, 10);
    const national_rank_all_players = parseInt($("table.profile-table:first-child tbody tr:nth-child(1) td")[4].children[0].data, 10);
    const national_rank_active_players = parseInt($("table.profile-table:first-child tbody tr:nth-child(2) td")[3].children[0].data, 10);
    const continental_rank_all_players = parseInt($("table.profile-table:first-child tbody tr:nth-child(1) td")[6].children[0].data, 10);
    const continental_rank_active_players = parseInt($("table.profile-table:first-child tbody tr:nth-child(2) td")[5].children[0].data, 10);

    return {
        world_rank_all_players,
        world_rank_active_players,
        national_rank_all_players,
        national_rank_active_players,
        continental_rank_all_players,
        continental_rank_active_players,
    };
};

/**
 * Parse player personal data from FIDE player page
 * @param {Object} data
 * @throws {String}
 * @returns {JSON} Player personal data
 */
const parsePersonalDataFromProfilePage = (data) => {
    const $ = cheerio.load(data);
    if ($(".profile-bottom").length === 0) {
        throw "Not found";
    }

    const name = $(".profile-top-title")[0].children[0].data;
    const federation = $(".profile-top-info__block__row__data")[1].children[0].data;
    const birth_year = parseInt($(".profile-top-info__block__row__data")[3].children[0].data, 10);
    const sex = $(".profile-top-info__block__row__data")[4].children[0].data;
    const title = $(".profile-top-info__block__row__data")[5].children[0].data;

    return {
        name,
        federation,
        birth_year,
        sex,
        title,
    };
};

/**
 * Parse player ELO from FIDE player page
 * @param {Object} data
 * @throws {String}
 * @returns {JSON} Player ELO
 */
const parseEloFromProfilePage = (data) => {
    const $ = cheerio.load(data);
    if ($(".profile-bottom").length === 0) {
        throw "Not found";
    }

    const standard_elo = $(".profile-top-rating-data")[0].children[2].data.replace(/\s/g, "");
    const rapid_elo = $(".profile-top-rating-data")[1].children[2].data.replace(/\s/g, "");
    const blitz_elo = $(".profile-top-rating-data")[2].children[2].data.replace(/\s/g, "");

    return {
        standard_elo,
        rapid_elo,
        blitz_elo,
    };
};

/**
 * Parse player history from FIDE player history page
 * @param {Object} data
 * @throws {String}
 * @returns {JSON} Player history
 */
const parseHistoryFromHistoryPage = (data) => {
    const $ = cheerio.load(data);
    const table_entries = $("table.profile-table.profile-table_chart-table tbody tr");

    if (table_entries.length === 0) {
        throw "Not found";
    }

    const history = [];
    table_entries.map((i) => {
        const row = cheerio.load(table_entries[i])("td");
        history.push({
            date: row[0].children[0].data.replace(/\s/g, ""),
            numeric_date: parseDate(row[0].children[0].data.replace(/\s/g, "")),
            standard: row[1].children[0].data.replace(/\s/g, ""),
            num_standard_games: row[2].children[0].data.replace(/\s/g, ""),
            rapid: row[3].children[0].data.replace(/\s/g, ""),
            num_rapid_games: row[4].children[0].data.replace(/\s/g, ""),
            blitz: row[5].children[0].data.replace(/\s/g, ""),
            num_blitz_games: row[6].children[0].data.replace(/\s/g, ""),
        });
    });

    return history;
};

module.exports = {
    parseRankFromProfilePage,
    parsePersonalDataFromProfilePage,
    parseEloFromProfilePage,
    parseHistoryFromHistoryPage,
};
