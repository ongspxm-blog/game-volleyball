// === utils funcs
function $(id) {
    return document.getElementById(id);
}

function $$(id) {
    const divs = document.getElementsByClassName(id);

    return { forEach(f) {
        for (let i=0; i<divs.length; i++) {
            f(divs[i], i);
        }
    }};
}

// === utils
function leng(x, y) {
    return Math.sqrt(x**2 + y**2);
}

function dist(x1, y1, x2, y2) {
    return leng((y1-y2), (x1-x2));
}

// === update loop
const fps = 50;
let update;
let paused; // 0: running, 1: paused, 2:resumed
function updateFunc() {
    const startTime = (new Date());
    gdata.ai = $('ai').checked;

    if (gdata.ball.y > gdata.H - gdata.r) {
        // === ball died
        if (paused == 0) {
            if (gdata.ball.x < gdata.W/2) {
                gdata.players[1].s += 1;
            } else {
                gdata.players[0].s += 1;
            }

            paused = 1;
            gdata.text = "<SPACE> to resume";
        }

        // === game resumed
        if (paused == 2) {
            if (gdata.ball.x < gdata.W/2) {
                gdata.ball.x = gdata.W * 0.25;
            } else {
                gdata.ball.x = gdata.W * 0.75;
            }

            gdata.ball.dx = 0;
            gdata.ball.dy = 0;
            gdata.ball.y = gdata.r;

            paused = 0;
            gdata.text = "";
        }
    } else {
        // === ai movement
        if (gdata.ai) {
            if (gdata.aiCnt == 1) {
                gdata.players[1].dir = gdata.ball.x < gdata.players[1].x
                    ? -1 : 1;
            }

            gdata.aiCnt = (gdata.aiCnt + 1) % gdata.aiCntMax;
        }

        // === ball update
        gdata.ball.dy += gdata.gravity/fps;
        gdata.ball.y += gdata.ball.dy/fps;
        gdata.ball.x += gdata.ball.dx/fps;

        // === rebounding off the walls
        if (gdata.ball.y < gdata.r) {
            gdata.ball.dy *= -1.2;
            gdata.ball.y = gdata.r;
        }
        if (gdata.ball.x < gdata.r) {
            gdata.ball.dx *= -1.2;
            gdata.ball.x = gdata.r;
        }
        if (gdata.ball.x > gdata.W - gdata.r) {
            gdata.ball.dx *= -1.2;
            gdata.ball.x = gdata.W - gdata.r;
        }

        // === keeping it within velocity bounds
        gdata.ball.dx = Math.min(gdata.ball.dx, gdata.ball.D);
        gdata.ball.dx = Math.max(gdata.ball.dx, -1*gdata.ball.D);
        gdata.ball.dy = Math.min(gdata.ball.dy, gdata.ball.D);
        gdata.ball.dy = Math.max(gdata.ball.dy, -1*gdata.ball.D);
        $('ball').draw();

        // === player update
        gdata.players.forEach(player => {
            player.x += player.dir * player.v/fps;
            if (player.x < player.x1) {
                player.x = player.x1;
            }
            if (player.x > player.x2) {
                player.x = player.x2;
            }

            // === bounce against the player
            const limit = gdata.R + gdata.r;

            if (dist(gdata.ball.x, gdata.ball.y,
                player.x, player.y) < limit) {
                const dx = player.x - gdata.ball.x;
                const dy = player.y - gdata.ball.y;

                const v2 = -1*leng(dx, dy)*10;
                const ag = Math.atan(dy/dx);
                gdata.ball.dx = Math.sin(ag)*v2;
                gdata.ball.dy = Math.cos(ag)*v2;
            }
        });
    }

    $('ball').draw();
    $('player0').draw();
    $('player1').draw();

    $('text').innerText = gdata.text;
    $('score0').innerText = gdata.players[0].s;
    $('score1').innerText = gdata.players[1].s;

    update = setTimeout(updateFunc,
        1000/fps - ((new Date()) - startTime));
}

// === setup
const gdata = {
    text: '',
    ai: false,
    aiCnt: 0,           // ai counter used for lagging
    aiCntMax: 5,        // ai max counter
    W: 800, H: 400,     // stage size
    R: 40, r:15,        // player radius & ball radius
    gravity: 300,       // ball gravity
    ball: {
        x: 150, y: 0,   // ball position
        dx: 0, dy: 0,   // ball speed
        D: 1000,        // max abs value of dx & dy
    },
    players: [{
        x1: 0, x2: 800, // limit of movement
        x: 0, dir: 0,   // dir is player's direction
        v: 600,         // speed of player
        s: 0,           // score
    },{
        x1: 0, x2: 800, // limit of movement
        x: 0, dir: 0,   // dir is player's direction
        v: 600,         // speed of player
        s: 0,           // score
    }]
};

function setup() {
    $('game').style.width = gdata.W;
    $('game').style.height = gdata.H;

    // === init player
    gdata.players[0].x2 = gdata.W/2 - gdata.R;

    gdata.players[1].x = gdata.W;
    gdata.players[1].x1 = gdata.W/2 + gdata.R;
    gdata.players[1].x2 = gdata.W;

    $$('player').forEach(div => {
        div.style.height = gdata.R*2;
        div.style.width = gdata.R*2;
        div.style.bottom = -1 * gdata.R;
        div.r = gdata.R;

        div.draw = () => {
            const i = parseInt(div.id[div.id.length - 1]);
            gdata.players[i].y = gdata.H;
            div.style.left = gdata.players[i].x - gdata.R;
        };
    });

    // === init ball
    $('ball').style.width = gdata.r*2;
    $('ball').style.height = gdata.r*2;
    $('ball').r = gdata.r;

    $('ball').draw = () => {
        $('ball').style.left = gdata.ball.x - gdata.r;
        $('ball').style.top = gdata.ball.y - gdata.r;
    };

    paused = 0;
    updateFunc();
}

window.onkeydown = evt => {
    switch (evt.keyCode) {
        case 65: gdata.players[0].dir = -1; break;
        case 68: gdata.players[0].dir = 1; break;
        case 37:
            if (!gdata.ai) {
                gdata.players[1].dir = -1;
            }
            break;
        case 39:
            if (!gdata.ai) {
                gdata.players[1].dir = 1;
            }
            break;
        case 32: paused = 2; break;
    }
};

window.onload = setup;
