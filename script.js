// ==UserScript==
// @name         Plemiona skrypt 2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *.plemiona.pl/game.php?*
// @grant        none
// ==/UserScript==
(function() {
    let playerId = "t=" + game_data.player.id + "&";
    let counter = 0;
    if (window.location.href.indexOf(game_data.player.id) == -1) {
        playerId = "";
    }

    class Raport {
        constructor(nick, coords, data, piki, miecze, topory, lucznicy, zwiad, lk, lnk, ck, tarany, katy, rycerz, szlachcic) {
            this.nick = nick;
            this.coords = coords;
            this.data = data;
            this.piki = piki;
            this.miecze = miecze;
            this.topory = topory;
            this.lucznicy = lucznicy;
            this.zwiad = zwiad;
            this.lk = lk;
            this.lnk = lnk;
            this.ck = ck;
            this.tarany = tarany;
            this.katy = katy;
            this.rycerz = rycerz;
            this.szlachcic = szlachcic;
        }

        print() {
            console.log(this);
        }
    }


    'use strict';
    let names = [];
    let raportsArray = [];
    //let allyName = "W.W";
    const id = "scriptTable";
    const worldName = "pl138";

    function httpGet(theUrl) {
        async: true;
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false);
        xmlHttp.send(null);
        return xmlHttp.responseText;
    }

    function saveMembers(member) {
        names.push(member.querySelector("a").innerText);
    }

    function printMembers() {
        console.log(names);
    }

    function printRaports() {
        if (raportsArray.length < 1) {
            console.log("Brak raportow.");
            return;
        }

        raportsArray.forEach(e => e.print());
    }

    function createGUI() {
        let spot = document.querySelector(".menu-side");
        let div = document.createElement('div');
        div.id = id;
        div.style.width = "300px";
        div.style.height = "50px";
        div.style.backgroundColor = "red";
        let input = document.createElement('input');
        input.style.width = "50px";
        let button = document.createElement('button');
        button.style.width = "40px";
        button.style.height = "20px";
        button.innerText = "add";
        div.appendChild(input);
        div.appendChild(button);
        button.addEventListener("click", function(e) {
            addNames(input.value);
        });
        let buttonStart = document.createElement('button');
        buttonStart.style.width = "80px";
        buttonStart.style.height = "20px";
        buttonStart.innerText = "start";
        div.appendChild(input);
        div.appendChild(button);
        div.appendChild(buttonStart);
        buttonStart.addEventListener("click", function(e) {
            start();
        });

        spot.appendChild(div);
    }

    function getPlayersName(allyName) {
        let rankUrl = "https://" + worldName + ".plemiona.pl/game.php?" + playerId + "&screen=ranking&mode=ally&name=" + encodeURIComponent(allyName);
        let rankHTML = document.createElement('html');
        rankHTML.innerHTML = httpGet(rankUrl);

        let memberUrl;
        try {
            memberUrl = rankHTML.querySelector("td.lit-item.nowrap > a").getAttribute("href").replace("ally", "member");

            rankHTML.innerHTML = httpGet(memberUrl);

            let memberA = rankHTML.querySelectorAll("tr.row_a");
            let memberB = rankHTML.querySelectorAll("tr.row_b");

            memberA.forEach(saveMembers);
            memberB.forEach(saveMembers);
        } catch (Exception) {
            console.log(Exception+"\nPodana nazwa plemienia nie istnieje");
        }
    }

    function addNames(e) {
        getPlayersName(e);
        printMembers();
    }

    function start() {
        let raportsUrl = "https://" + worldName + ".plemiona.pl/game.php?" + playerId + "&screen=report&mode=attack&group_id=-1";
        if (names.length > 0) {
            getRaports(raportsUrl);
            printRaports();
        }
    }

    function findNeededRaports(raports) {
        Array.prototype.forEach.call(raports, function(e) {
            let text = e.innerText;
            if (text.includes("Wioska barbarzyńska") || text.includes("Osada koczowników")) {


            } else {
                let url = e.querySelector("a").getAttribute("href");
                let html = document.createElement('html');

                html.innerHTML = httpGet(url);
                let opponentInfo = html.querySelector("#attack_info_def");
                let nick = opponentInfo.querySelector("tr > th").nextElementSibling.innerText;
                if (names.includes(nick)) {
                    let village = //opponentInfo.querySelector("span.village_anchor.contexted").innerText;
                        html.querySelector('#attack_info_def > tbody > tr:nth-child(2) > td:nth-child(2) > span > a:nth-child(1)').innerText;
                    let army = opponentInfo.querySelector("#attack_info_def_units");
                    if (army) {
                        army = army.querySelectorAll(".unit-item");
                        raportsArray.push(
                            new Raport(nick, village, "data",
                                parseInt(army[0].innerText) - parseInt(army[13].innerText),
                                parseInt(army[1].innerText) - parseInt(army[14].innerText),
                                parseInt(army[2].innerText) - parseInt(army[15].innerText),
                                parseInt(army[3].innerText) - parseInt(army[16].innerText),
                                parseInt(army[4].innerText) - parseInt(army[17].innerText),
                                parseInt(army[5].innerText) - parseInt(army[18].innerText),
                                parseInt(army[6].innerText) - parseInt(army[19].innerText),
                                parseInt(army[7].innerText) - parseInt(army[20].innerText),
                                parseInt(army[8].innerText) - parseInt(army[21].innerText),
                                parseInt(army[9].innerText) - parseInt(army[22].innerText),
                                parseInt(army[10].innerText) - parseInt(army[23].innerText),
                                parseInt(army[11].innerText) - parseInt(army[24].innerText),
                            )
                        );
                    }
                }
            }
        });
    }

    function getRaports(raportsUrl) {
        counter++;
        let html = document.createElement('html');
        html.innerHTML = httpGet(raportsUrl);
        findNeededRaports(html.getElementsByClassName("quickedit-content"));
        let nextPage = html.querySelector('tr > td[colspan][align] > strong');

        if (nextPage == null)
            return;

        nextPage = nextPage.nextElementSibling;

        if (nextPage != null) {
            console.log(counter);
            nextPage = nextPage.href;
            if (nextPage == undefined) {
                return;
            }
            getRaports(nextPage);
        } else {
            return;
        }

    }
    console.log("start");
    createGUI();
    console.log("end");
})();
