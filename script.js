let currentSong = new Audio();
let playButton = document.getElementById("playButton")
let songs;
let currFolder;

function secondsToMinutesAndSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Round down to the nearest integer to remove decimal part
    seconds = Math.floor(seconds);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Ensure minutes and seconds are formatted with leading zeros if needed
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //Plat the first song

    //show All the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
            <img src="./images/svg/music.svg" alt="music" class="invert">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Perry</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="./images/svg/play.svg" alt="play" class="invert">
            </div>
     </li>`;
    }

    //Attach an eventlistener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    });
    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        playButton.src = "./images/svg/songButtons/pause.svg"
    }
    document.querySelector(".songinfo").innerText = decodeURI(track)
    document.querySelector(".songtime").innerText = "00:00/00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let cardContainer = document.querySelector(".cardContainer")
    let anchors = Array.from(div.getElementsByTagName("a"))
    for (let index = 0; index < anchors.length; index++) {
        const e = anchors[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            //Get the metadata of the folder
            if(folder != "songs"){
                let a = await fetch(`/songs/${folder}/info.json`)
                let response = await a.json()
    
                cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="60%" height="60%"
                        fill="#FEC7B4">
                        <path
                            d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                    </svg>
                </div>
                <img src="./songs/${folder}/cover.jpg" alt="cover">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
            }
            }
    }

    //Load the playlist when card is CLicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async () => {
            songs = await getSongs(`songs/${e.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {
    //Get the list of songs
    await getSongs(`songs/ncs`)

    //Display all the albums on the page
    displayAlbums()
    playMusic(songs[0], true)


    //Attach an event listener to play, next & prev
    document.getElementById("playButton").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            playButton.src = "./images/svg/songButtons/pause.svg"
        }
        else {
            currentSong.pause()
            playButton.src = "./images/svg/songButtons/play.svg"
        }
    })

    //Listen for timeUpdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesAndSeconds(currentSong.currentTime)}&nbsp;/&nbsp;${secondsToMinutesAndSeconds(currentSong.duration)}`
        document.querySelector("#seekbar").value = (currentSong.currentTime / currentSong.duration) * 100

        //Autoplay next song when one song ends
        if(currentSong.currentTime === currentSong.duration){
            currentSong.pause()
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1])
            }
        }
    })

    //Add event listener to seekbar
    document.getElementById('seekbar').addEventListener("input", () => {
        currentSong.pause();
        currentSong.currentTime = (document.getElementById('seekbar').value / 100) * currentSong.duration
        currentSong.play();
    })


    //Add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%"
    })

    //Add event listener to previous & next
    previousButton.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    nextButton.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
}

main()

