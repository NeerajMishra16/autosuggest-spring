console.log("hello from JS!")

var users = [
    {
        "name" : "John Doe",
        "gender" : "Male",
        "img" : "john.png"
    },
    {
        "name" : "Jane Doe",
        "gender" : "Female",
        "img" : "jane.png"
    }
]

var id = 0;
var spinning = false;

var els = {};
function cacheEls(){
    els.card = document.getElementById("card");
    els.info = document.getElementById("info");
    els.actions = document.getElementById("actions");
    els.img = document.getElementById("user-image");
    els.name = document.getElementById("user-name");
    els.gender = document.getElementById("user-gender");
}
document.addEventListener("DOMContentLoaded", cacheEls);

function toggleUser(){
    if (spinning) return;

    id = (id + 1) % 2;

    els.card.classList.remove("final");
    els.actions.classList.remove("hidden");
    els.info.classList.remove("hidden");

    els.img.src = users[id].img;
    els.name.textContent = users[id].name;
    els.gender.textContent = users[id].gender;
}

async function randomUser(){
    if (spinning) return;
    spinning = true;

    // hide text + buttons, drop the "landed" layout, start with a slight blur
    els.actions.classList.add("hidden");
    els.info.classList.add("hidden");
    els.card.classList.remove("final");
    els.img.classList.add("spin-fast");

    var reelPhotos, finalUser;

    try {
        var res = await fetch("https://randomuser.me/api/?results=20&inc=name,gender,picture&noinfo");
        var data = await res.json();
        finalUser = data.results.pop();               // the one we land on
        reelPhotos = data.results.map(function(u){ return u.picture.large; });
    } catch (e) {
        // offline / API unreachable - fall back to spinning between the two local users
        console.warn("randomuser.me unreachable, spinning locally instead.", e);
        reelPhotos = [users[0].img, users[1].img, users[0].img, users[1].img];
        finalUser = null;
    }

    spin(reelPhotos, 0, 55, function(){ landFinal(finalUser); });
}

// walks through `photos`, swapping the image faster than a person can read it,
// then geometrically slows down each step until it crosses ~420ms - that
// deceleration is what reads as "landing" rather than just stopping abruptly
function spin(photos, i, delay, done){
    els.img.src = photos[i % photos.length];

    var next = delay * 1.18;
    if (next < 420) {
        if (next > 180) els.img.classList.remove("spin-fast");
        setTimeout(function(){ spin(photos, i + 1, next, done); }, delay);
    } else {
        setTimeout(done, delay);
    }
}

function landFinal(user){
    els.img.classList.remove("spin-fast");

    if (user) {
        els.img.src = user.picture.large;
        els.name.textContent = user.name.first + " " + user.name.last;
        els.gender.textContent = user.gender.charAt(0).toUpperCase() + user.gender.slice(1);
    } else {
        id = Math.round(Math.random());
        els.img.src = users[id].img;
        els.name.textContent = users[id].name;
        els.gender.textContent = users[id].gender;
    }

    // switch to the horizontal "landed" layout (photo moves left), then
    // fade the info back in, then the buttons - each a beat after the last
    requestAnimationFrame(function(){
        els.card.classList.add("final");

        setTimeout(function(){
            els.info.classList.remove("hidden");
        }, 250);

        setTimeout(function(){
            els.actions.classList.remove("hidden");
            spinning = false;
        }, 550);
    });
}
