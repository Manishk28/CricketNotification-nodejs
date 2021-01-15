const axios = require('axios');
const cheerio = require('cheerio');
const notifier = require('node-notifier');
const path = require('path');
const match_lnks = [];
const getDataFromRemote = async() => {
    const URL = 'https://www.cricbuzz.com/cricket-match/live-scores';
    const response = await axios.get(URL);
    const { data } = response;
    return data;
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

const getScores = async() => {
    const html = await getDataFromRemote();
    const scores = [];
    //const match_lnks = [];
    const $ = cheerio.load(html);
    $('a.cb-lv-scrs-well-live').each(function(_, element) {
        const scoreContainer = $(element).children().children();
        const score = $(scoreContainer).text();
        const rel_lnk = $(element).attr('href');
        const match_lnk = "https://www.cricbuzz.com" + rel_lnk;
        scores.push(score);
        match_lnks.push(match_lnk);
    })
    return scores;
}

const notify = async() => {
    const scores = await getScores();
    if (scores.length == 0) {
        notifier.notify({
            title: 'Cricket Score (India)!',
            icon: path.join(__dirname, 'cric.jpg'),
            message: 'No live matches. :( Time to do some work!'
        });
        return;
    }
    for (let i = 0; i < scores.length; i++) {
        /*if (scores.some(function(score) {
                console.log(score.includes("IND"));
                return (score.includes("IND"));
            })) {*/
        notifier.notify({
            title: 'Cricket Score (India)!',
            icon: path.join(__dirname, 'cric.jpg'),
            sound: true,
            open: match_lnks[i],
            message: scores[i]
        });
        sleep(6000);
    }
    /*else {
               notifier.notify({
                   title: 'Cricket Score (India)!',
                   icon: path.join(__dirname, 'cric.jpg'),
                   message: 'India is not playing any live match. :( Get back to work!'
               });
               return;
           }*/
}


setInterval(() => {
    notify();
}, 20000);