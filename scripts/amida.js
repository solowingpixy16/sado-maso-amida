/**
 * Copyright 2026 pick-chan
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const amidaCanvas = document.getElementById("amida_area");
const amidaContext = amidaCanvas.getContext("2d");

const REFRESH_RATE_FRAMES_PER_MILLIS = 0.06;

const HEIGHT_ABOVE_AMIDA = 200;
const HEIGHT_INSIDE_AMIDA = 500;
const HEIGHT_BELOW_AMIDA = 100;
const OVERALL_WIDTH = 500;
const OVERALL_HEIGHT = HEIGHT_ABOVE_AMIDA + HEIGHT_INSIDE_AMIDA + HEIGHT_BELOW_AMIDA;
const LEFT_RIGHT_MARGIN = 50;
const WIDTH_INSIDE_AMIDA = OVERALL_WIDTH - 2 * LEFT_RIGHT_MARGIN;
const EXTRA_VERTICAL_MOTION_HEIGHT = 50;
const TEXT_VERTICAL_OFFSET = 25;
const TEXT_HORIZONTAL_OFFSET = -4;

const VERTICAL_LINES_COUNT = 8;
const DISTANCE_BETWEEN_VERTICAL_LINES = WIDTH_INSIDE_AMIDA / (VERTICAL_LINES_COUNT - 1);

amidaCanvas.height = OVERALL_HEIGHT;
amidaCanvas.width = OVERALL_WIDTH;

const PLAYER_ABATOR_RADIUS = 10;

const AMIDA_MODIFIABLE_PERIOD_MILLIS = 10_000;
const TEASING_PERIOD_MILLIS = 5_000;
const VERTICAL_MOTION_PIXEL_PER_MILLIS = 0.0005;
const HORIZONTAL_MOTION_DURATION_MILLIS = 2_000;

const STATE_STANDBY                      = 0;
const STATE_USER_ADDING_HORIZONTAL_LINES = 1;
const STATE_PLAYER_TRACING_AMIDA         = 2;
const STATE_PLAYER_MOVING_TOWARDS_RESULT = 3;
const STATE_SHOWING_RESULT               = 4;
let currentState = STATE_STANDBY;
let frameCounterWithinState = 0;
let frameCounterWithinHorizontalMotion = 0;

let userPressing = false;
let pressedDownX = 0;
let pressedDownY = 0;
let currentPressedX = 0;
let currentPressedY = 0;

// {{(vertical_line_no, y), (vertical_line_no, y), isActive}, {(vertical_line_no, y), (vertical_line_no, y), isActive}, ...}
let horizontalLines = new Array();
let horizontallyMoving = false;
let nextCrossingFound = false;
let nextCrossingArrayIndex = 0;
let whichEndIsDeparture = 0;

let amidaTriggered = false;

// 完全に内輪ネタです。。。
let matchers = [
    /.*[Mm][^A-Za-z]*[Aa][^A-Za-z]*[Ii].*/,
    /.*[Kk][^A-Za-z]*[Aa][^A-Za-z]*[Nn][^A-Za-z]*[Aa].*/,
    /.*[Mm][^A-Za-z]*[Oo][^A-Za-z]*[Mm][^A-Za-z]*[Oo].*/,
    /.*[Uu][^A-Za-z]*[Dd][^A-Za-z]*[Oo][^A-Za-z]*[Nn].*/,

    /.*舞.*衣.*/,
    // N/A
    /.*桃.*/,
    // N/A

    /.*まい.*/,
    /.*かな.*/,
    /.*もも.*/,
    /.*うどん.*/,

    /.*マイ.*/,
    /.*カナ.*/,
    /.*モモ.*/,
    /.*ウドン*/,
];


/**
 * @summary The line on which player character is placed.
 * @description
 *     The range of the value is [0, VERTICAL_LINES_COUNT)
 */
let currentPlayerLine = 0;
let currentPlayerX = 0;

/**
 * @summary Player character's current y-axis position in amida.
 * @description
 *     This value indicates current y-axis position of the player character.
 *     The position is relative to the top edge of amida.
 *     The range of the value is [0, HEIGHT_INSIDE_AMIDA)
 */
let currentPlayerY = 0;


function updateContents() {
    performStateTransition();
    handleTouchActions();
    calculateMotion();
    draw();
}

function performStateTransition() {
    ++frameCounterWithinState;
    switch (currentState) {
        case STATE_STANDBY:
            if (amidaTriggered) {
                amidaTriggered = false;
                console.log(`State transition occurred. From: ${currentState}`);
                ++currentState;
                frameCounterWithinState = 0;
                document.getElementById("user_name").disabled = true;
                console.log(`State transition occurred. To: ${currentState}`);
            }
            break;
        case STATE_USER_ADDING_HORIZONTAL_LINES:
            amidaTriggered = false;
            if (currentPlayerY >= HEIGHT_ABOVE_AMIDA) {
                console.log(`State transition occurred. From: ${currentState}`);
                ++currentState;
                frameCounterWithinState = 0;
                console.log(`State transition occurred. To: ${currentState}`);
            }
            break;
        case STATE_PLAYER_TRACING_AMIDA:
            amidaTriggered = false;
            if (currentPlayerY >= HEIGHT_ABOVE_AMIDA + HEIGHT_INSIDE_AMIDA) {
                console.log(`State transition occurred. From: ${currentState}`);
                ++currentState;
                frameCounterWithinState = 0;
                console.log(`State transition occurred. To: ${currentState}`);
            }
            break;
        case STATE_PLAYER_MOVING_TOWARDS_RESULT:
            amidaTriggered = false;
            if (currentPlayerY >= HEIGHT_ABOVE_AMIDA + HEIGHT_INSIDE_AMIDA + EXTRA_VERTICAL_MOTION_HEIGHT) {
                console.log(`State transition occurred. From: ${currentState}`);
                ++currentState;
                frameCounterWithinState = 0;
                console.log(`State transition occurred. To: ${currentState}`);
                document.getElementById("user_name").disabled = false;
            }
            break;
        case STATE_SHOWING_RESULT:
            if (amidaTriggered) {
                amidaTriggered = false;
                console.log(`State transition occurred. From: ${currentState}`);
                currentState = STATE_USER_ADDING_HORIZONTAL_LINES;
                frameCounterWithinState = 0;
                horizontalLines.length = 0;
                document.getElementById("user_name").disabled = true;
                console.log(`State transition occurred. To: ${currentState}`);
            }
            break;
        default:
            console.log(
                `performStateTransition():`
                + ` Oops! The 'currentState' value is out of range.`
                + ` currentState=${currentState}`
            );
            break;
    }
}

function handleTouchActions() {
}

function calculateMotion() {
    switch (currentState) {
        case STATE_USER_ADDING_HORIZONTAL_LINES:
            currentPlayerX = LEFT_RIGHT_MARGIN + currentPlayerLine * DISTANCE_BETWEEN_VERTICAL_LINES;

            // elapsed_time = frames / refresh_rate
            // progress = elapsed_time / period
            // Therefore:
            // progress = (frames / refresh_rate) / period = frames / (refresh_rate * period)
            currentPlayerY =
                HEIGHT_ABOVE_AMIDA
                * (frameCounterWithinState / (REFRESH_RATE_FRAMES_PER_MILLIS * AMIDA_MODIFIABLE_PERIOD_MILLIS));
            break;
        case STATE_PLAYER_TRACING_AMIDA:
            traceAmida();
            break;
        case STATE_PLAYER_MOVING_TOWARDS_RESULT:
            currentPlayerX = LEFT_RIGHT_MARGIN + currentPlayerLine * DISTANCE_BETWEEN_VERTICAL_LINES;

            currentPlayerY
                = HEIGHT_ABOVE_AMIDA
                + HEIGHT_INSIDE_AMIDA
                + EXTRA_VERTICAL_MOTION_HEIGHT * (frameCounterWithinState / (REFRESH_RATE_FRAMES_PER_MILLIS * TEASING_PERIOD_MILLIS));
            break;
        case STATE_STANDBY:
        case STATE_SHOWING_RESULT:
            // No motion generated here.
            break;
        default:
            console.log(
                `calculateMotion():`
                + ` Oops! The 'currentState' value is out of range.`
                + ` currentState=${currentState}`
            );
            break;
    }
}

function traceAmida() {
    ++frameCounterWithinHorizontalMotion;
    if (frameCounterWithinState == 0) {
        frameCounterWithinHorizontalMotion = 0;
        currentPlayerY = HEIGHT_ABOVE_AMIDA;
        userPressing = false;
        nextCrossingFound = false;
        nextCrossingArrayIndex = 0;
        whichEndIsDeparture = 0;
        searchNextCrossing();
    }

    if (!horizontallyMoving) {
        currentPlayerX = LEFT_RIGHT_MARGIN + currentPlayerLine * DISTANCE_BETWEEN_VERTICAL_LINES;
        // elapsed_time = frames / refresh_rate
        currentPlayerY += VERTICAL_MOTION_PIXEL_PER_MILLIS * (frameCounterWithinHorizontalMotion / REFRESH_RATE_FRAMES_PER_MILLIS);

        if (nextCrossingFound && currentPlayerY >= horizontalLines[nextCrossingArrayIndex][whichEndIsDeparture][1]) {
            horizontallyMoving = true;
            frameCounterWithinHorizontalMotion = 0;
        }
    } else {
        let departureEnd = whichEndIsDeparture;
        let destinationEnd;
        if (departureEnd == 0) {
            destinationEnd = 1;
        } else {
            destinationEnd = 0;
        }
        let departureLine = horizontalLines[nextCrossingArrayIndex][departureEnd][0];
        let departureY = horizontalLines[nextCrossingArrayIndex][departureEnd][1];
        let destinationLine = horizontalLines[nextCrossingArrayIndex][destinationEnd][0];
        let destinationY = horizontalLines[nextCrossingArrayIndex][destinationEnd][1];
        let progress = frameCounterWithinHorizontalMotion / (REFRESH_RATE_FRAMES_PER_MILLIS * HORIZONTAL_MOTION_DURATION_MILLIS);
        currentPlayerX
            = LEFT_RIGHT_MARGIN
            + departureLine * DISTANCE_BETWEEN_VERTICAL_LINES
            + (destinationLine - departureLine)
                * DISTANCE_BETWEEN_VERTICAL_LINES
                * progress;
        currentPlayerY
            = departureY + (destinationY - departureY) * progress;
        if (departureLine < destinationLine) {
            if (currentPlayerX >= LEFT_RIGHT_MARGIN + destinationLine * DISTANCE_BETWEEN_VERTICAL_LINES) {
                currentPlayerLine = destinationLine;
                horizontalLines[nextCrossingArrayIndex][2] = false;
                horizontallyMoving = false;
                nextCrossingFound = false;
                nextCrossingArrayIndex = 0;
                whichEndIsDeparture = 0;
                searchNextCrossing();
            }
        } else {
            if (currentPlayerX <= LEFT_RIGHT_MARGIN + destinationLine * DISTANCE_BETWEEN_VERTICAL_LINES) {
                currentPlayerLine = destinationLine;
                horizontalLines[nextCrossingArrayIndex][2] = false;
                horizontallyMoving = false;
                nextCrossingFound = false;
                nextCrossingArrayIndex = 0;
                whichEndIsDeparture = 0;
                searchNextCrossing();
            }
        }
    }
}

function searchNextCrossing () {
    let found = false;
    let candidateDepartureY = OVERALL_HEIGHT;
    let candidateIndex = 0;
    let whichEnd;
    for (let i = 0; i < horizontalLines.length; ++i) {
        if (horizontalLines[i][2] == true) {
            if (horizontalLines[i][0][0] == currentPlayerLine && horizontalLines[i][0][1] > currentPlayerY) {
                found = true;
                if (horizontalLines[i][0][1] < candidateDepartureY) {
                    candidateDepartureY = horizontalLines[i][0][1];
                    candidateIndex = i;
                    whichEnd = 0;
                }
            } else if (horizontalLines[i][1][0] == currentPlayerLine && horizontalLines[i][1][1] > currentPlayerY) {
                found = true;
                if (horizontalLines[i][1][1] < candidateDepartureY) {
                    candidateDepartureY = horizontalLines[i][1][1];
                    candidateIndex = i;
                    whichEnd = 1;
                }
            }
        }
    }
    nextCrossingFound = found;
    nextCrossingArrayIndex = candidateIndex;
    whichEndIsDeparture = whichEnd;
    if (found) {
        console.log(
            "found:"
            + ` nextCrossingFound=${nextCrossingFound}`
            + ` nextCrossingArrayIndex=${nextCrossingArrayIndex}`
            + ` whichEndIsDeparture=${whichEndIsDeparture}`
            + ` horizontalLines[nextCrossingArrayIndex]={{(${horizontalLines[nextCrossingArrayIndex][0][0]},${horizontalLines[nextCrossingArrayIndex][0][1]})}, {(${horizontalLines[nextCrossingArrayIndex][1][0]},${horizontalLines[nextCrossingArrayIndex][1][1]})},${horizontalLines[nextCrossingArrayIndex][2]}}`
            
        );
    }
}

function draw() {
    amidaContext.clearRect(0, 0, OVERALL_WIDTH, OVERALL_HEIGHT);

    // Draw vertical lines of amida.
    for (let i = 0; i < VERTICAL_LINES_COUNT; ++i) {
        let x = LEFT_RIGHT_MARGIN + i * DISTANCE_BETWEEN_VERTICAL_LINES;
        amidaContext.beginPath();
        amidaContext.moveTo(x, HEIGHT_ABOVE_AMIDA);
        amidaContext.lineTo(x, HEIGHT_ABOVE_AMIDA + HEIGHT_INSIDE_AMIDA);
        amidaContext.stroke();
        amidaContext.closePath();
    }

    // Draw player abator.
    {
        amidaContext.beginPath();
        amidaContext.moveTo(currentPlayerX, currentPlayerY);
        amidaContext.arc(currentPlayerX, currentPlayerY, PLAYER_ABATOR_RADIUS, 0, 2.0 * Math.PI, false);
        amidaContext.fill();
        amidaContext.closePath();
    }

    if (currentState == STATE_USER_ADDING_HORIZONTAL_LINES) {
        if (userPressing == true) {
            amidaContext.beginPath();
            amidaContext.moveTo(pressedDownX, pressedDownY);
            amidaContext.lineTo(currentPressedX, currentPressedY);
            amidaContext.stroke();
            amidaContext.closePath();
        }
    }

    for(let i = 0; i < horizontalLines.length; ++i) {
        let departureX = LEFT_RIGHT_MARGIN + DISTANCE_BETWEEN_VERTICAL_LINES * horizontalLines[i][0][0];
        let departureY = horizontalLines[i][0][1];
        let destinationX = LEFT_RIGHT_MARGIN + DISTANCE_BETWEEN_VERTICAL_LINES * horizontalLines[i][1][0];
        let destinationY = horizontalLines[i][1][1];
        amidaContext.beginPath();
        amidaContext.moveTo(departureX, departureY);
        amidaContext.lineTo(destinationX, destinationY);
        amidaContext.stroke();
        amidaContext.closePath();
    }

    // Draw "sado" or "maso" text on canvas.
    for (let i = 0; i < VERTICAL_LINES_COUNT; ++i) {
        let x = LEFT_RIGHT_MARGIN + i * DISTANCE_BETWEEN_VERTICAL_LINES + TEXT_HORIZONTAL_OFFSET;
        let y = HEIGHT_ABOVE_AMIDA + HEIGHT_INSIDE_AMIDA + EXTRA_VERTICAL_MOTION_HEIGHT + TEXT_VERTICAL_OFFSET;
        let text;
        if (i == currentPlayerLine) {
            text = "M";
            if (currentState == STATE_SHOWING_RESULT || currentState == STATE_PLAYER_MOVING_TOWARDS_RESULT ) {
                for (let i = 0; i < matchers.length; ++i) {
                    let userName = document.getElementById("user_name").value;
                    // if (userName.match(matchers[i])) {
                    if (matchers[i].test(userName)) {
                        text = "超ドM";
                    }
                }
            }
        } else {
            text = "S";
        }
        amidaContext.font = "20px Arial";
        amidaContext.fillText(text, x, y);
    }

    switch (currentState) {
        case STATE_USER_ADDING_HORIZONTAL_LINES:
        case STATE_PLAYER_TRACING_AMIDA:
            amidaContext.fillRect(0, HEIGHT_ABOVE_AMIDA + HEIGHT_INSIDE_AMIDA, OVERALL_WIDTH, HEIGHT_BELOW_AMIDA);
            break;
        case STATE_STANDBY:
        case STATE_PLAYER_MOVING_TOWARDS_RESULT:
        case STATE_SHOWING_RESULT:
        default:
            break;
    }
}

setInterval(updateContents, 1 / REFRESH_RATE_FRAMES_PER_MILLIS);


document.getElementById(
    "amida_triggering_button"
).addEventListener(
    "click",
    (event) => { onAmidaTriggered(event); }
);

amidaCanvas.addEventListener(
    "pointerdown",
    (event) => { onDown(event); }
);

amidaCanvas.addEventListener(
    "pointerup",
    (event) => { onUp(event); }
);

amidaCanvas.addEventListener(
    "pointermove",
    (event) => { onMove(event); }
);

function onDown(event) {
    console.log("onDown(): " + String(event));
    userPressing = true;
    pressedDownX = event.offsetX;
    pressedDownY = event.offsetY;
}

function onUp(event) {
    console.log("onUp(): " + String(event));
    userPressing = false;
    if (currentState == STATE_USER_ADDING_HORIZONTAL_LINES) {
        let valid
            = pressedDownX > 0
            && pressedDownX < OVERALL_WIDTH
            && pressedDownY > HEIGHT_ABOVE_AMIDA
            && pressedDownY < HEIGHT_ABOVE_AMIDA + HEIGHT_INSIDE_AMIDA
            && event.offsetX > 0
            && event.offsetX < OVERALL_WIDTH
            && event.offsetY > HEIGHT_ABOVE_AMIDA
            && event.offsetY < HEIGHT_ABOVE_AMIDA + HEIGHT_INSIDE_AMIDA;
        let departureLine;
        let destinationLine;
        if (valid) {
            departureLine = Math.floor((pressedDownX - LEFT_RIGHT_MARGIN) / (DISTANCE_BETWEEN_VERTICAL_LINES) + 0.5);
            destinationLine = Math.floor((event.offsetX - LEFT_RIGHT_MARGIN) / (DISTANCE_BETWEEN_VERTICAL_LINES) + 0.5);
            if (departureLine < 0) {
                departureLine = 0
            } else if (departureLine > VERTICAL_LINES_COUNT - 1) {
                departureLine = VERTICAL_LINES_COUNT - 1;
            }
            if (destinationLine < 0) {
                destinationLine = 0;
            } else if (destinationLine > VERTICAL_LINES_COUNT - 1) {
                destinationLine = VERTICAL_LINES_COUNT - 1;
            }
            if (departureLine == destinationLine) {
                valid = false;
            }
        }
        if (valid) {
            horizontalLines.push(new Array([departureLine, pressedDownY], [destinationLine, event.offsetY], true));
        }
    }
}

function onMove(event) {
    if (userPressing) {
        console.log("onMove(): " + String(event));
        currentPressedX = event.offsetX;
        currentPressedY = event.offsetY;
    }
}

{

    document.getElementById(
        "amida_triggering_button"
    ).addEventListener(
        "pointerdown",
        (event) => { onAmidaTriggered(event); }
    );
}

function onAmidaTriggered(event) {
    console.log(`>>> onAmidaTriggered(${event})`);
    amidaTriggered = true;
    console.log(`<<< onAmidaTriggered(${event})`);
}
