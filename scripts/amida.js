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

function updateContents() {
    performStateTransition();
    handleTouchActions();
    calculateMotion();
    draw();
}

function performStateTransition() {
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
