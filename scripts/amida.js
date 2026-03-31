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

const REFRESH_RATE_MILLIS = 10;

const HEIGHT_ABOVE_AMIDA = 500;
const HEIGHT_INSIDE_AMIDA = 500;
const HEIGHT_BELOW_AMIDA = 500;
const OVERALL_WIDTH = 500;
const OVERALL_HEIGHT = HEIGHT_ABOVE_AMIDA + HEIGHT_INSIDE_AMIDA + HEIGHT_BELOW_AMIDA;
const LEFT_RIGHT_MARGIN = 50;
const WIDTH_INSIDE_AMIDA = OVERALL_WIDTH - 2 * LEFT_RIGHT_MARGIN;

const VERTICAL_LINES_COUNT = 8;

amidaCanvas.height = OVERALL_HEIGHT;
amidaCanvas.width = OVERALL_WIDTH;

const AMIDA_MODIFIABLE_PERIOD_MILLIS = 10_000;
const TEASING_PERIOD_MILLIS = 5_000;
const VERTICAL_MOTION_PIXEL_PER_MILLIS = 0.05;
const HORIZONTAL_MOTION_DURATION_MILLIS = 2_000;

const STATE_STANDBY                      = 0;
const STATE_USER_ADDING_HORIZONTAL_LINES = 1;
const STATE_PLAYER_TRACING_AMIDA         = 2;
const STATE_PLAYER_MOVING_TOWARDS_RESULT = 3;
const STATE_SHOWING_RESULT               = 4;
let currentState = STATE_STANDBY;

let amidaTriggered = false;

/**
 * @summary The line on which player character is placed.
 * @description
 *     The range of the value is [0, VERTICAL_LINES_COUNT)
 */
let currentLine = 0;
let departureLineOfHorizontalMotion = 0;
let destinationLineOfHorizontalMotion = 1;

/**
 * @summary Player character's current y-axis position in amida.
 * @description
 *     This value indicates current y-axis position of the player character.
 *     The position is relative to the top edge of amida.
 *     The range of the value is [0, HEIGHT_INSIDE_AMIDA)
 */
let currentPlayerY = 0;
let departureYOfHorizontalMotion = 0;
let destinationYOfHorizontalMotion = 0;


function updateContents() {
    performStateTransition();
    handleTouchActions();
    calculateMotion();
    draw();
}

function performStateTransition() {
    switch (currentState) {
        case STATE_STANDBY:
            if (amidaTriggered) {
                amidaTriggered = false;
                setTimeout(
                    () => {
                        console.log(`State transition occurred. From: ${currentState}`);
                        ++currentState;
                        console.log(`State transition occurred. To: ${currentState}`);
                    },
                    AMIDA_MODIFIABLE_PERIOD_MILLIS
                );
                console.log(`State transition occurred. From: ${currentState}`);
                ++currentState;
                console.log(`State transition occurred. To: ${currentState}`);
            }
            break;
        case STATE_USER_ADDING_HORIZONTAL_LINES:
            // The transition is configured in "case STATE_STANDBY" or "case STATE_SHOWING_RESULT" block.
            break;
        case STATE_PLAYER_TRACING_AMIDA:
            if (currentPlayerY >= HEIGHT_INSIDE_AMIDA) {
                setTimeout(
                    () => {
                        console.log(`State transition occurred. From: ${currentState}`);
                        ++currentState;
                        console.log(`State transition occurred. To: ${currentState}`);
                    },
                    TEASING_PERIOD_MILLIS
                );
                console.log(`State transition occurred. From: ${currentState}`);
                ++currentState;
                console.log(`State transition occurred. To: ${currentState}`);
            }
            break;
        case STATE_PLAYER_MOVING_TOWARDS_RESULT:
            // The transition is configured in "case STATE_PLAYER_TRACING_AMIDA" block.
            break;
        case STATE_SHOWING_RESULT:
            if (amidaTriggered) {
                amidaTriggered = false;
                setTimeout(
                    () => {
                        console.log(`State transition occurred. From: ${currentState}`);
                        ++currentState;
                        console.log(`State transition occurred. To: ${currentState}`);
                    },
                    AMIDA_MODIFIABLE_PERIOD_MILLIS
                );
                console.log(`State transition occurred. From: ${currentState}`);
                currentState = STATE_USER_ADDING_HORIZONTAL_LINES;
                console.log(`State transition occurred. To: ${currentState}`);
            }
            break;
        default:
            console.log(`Oops! The 'currentState' value is out of range. currentState=${currentState}`);
            break;
    }
}

function handleTouchActions() {
}

function calculateMotion() {
}

function draw() {
    amidaContext.clearRect(0, 0, OVERALL_WIDTH, OVERALL_HEIGHT);
    for (let i = 0; i < VERTICAL_LINES_COUNT; ++i) {
        let x = LEFT_RIGHT_MARGIN + i * WIDTH_INSIDE_AMIDA / (VERTICAL_LINES_COUNT - 1);
        amidaContext.beginPath();
        amidaContext.moveTo(x, HEIGHT_ABOVE_AMIDA);
        amidaContext.lineTo(x, HEIGHT_ABOVE_AMIDA + HEIGHT_INSIDE_AMIDA);
        amidaContext.stroke();
        amidaContext.closePath();
    }
}

setInterval(updateContents, REFRESH_RATE_MILLIS);

document.getElementById(
    "amida_triggering_button"
).addEventListener(
    "click",
    (event) => { onAmidaTriggered(event); }
);

function onAmidaTriggered(event) {
    console.log(`>>> onAmidaTriggered(${event})`);
    amidaTriggered = true;
    console.log(`<<< onAmidaTriggered(${event})`);
}
