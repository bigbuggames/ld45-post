import { css } from "linaria";
import { beat } from "../beat/beat";

const scoreStyles = css`
  font-size: 40px;
`;

export enum Note {
  High = "H",
  Mid = "M",
  Low = "L"
}

function gameOver() {
  console.log("game over!");
}

interface Bar {
  id: string;
  notes: string[];
}

// TODO: Move to common file
export function convertToStreamOfNotes(sheet: Bar[]): string[] {
  return sheet
    .map(bar => bar.notes)
    .reduce((acc, bar) => {
      acc = [...acc, ...bar];
      return acc;
    }, []);
}

function isCorrectKey(notes: string[], key: string, currentBeat: number) {
  const currentNote = {
    q: Note.High,
    w: Note.Mid,
    e: Note.High
  }[key];

  return notes[currentBeat] === currentNote;
}

export default function BeatManager(sheet, sheetRenderer) {
  const element = document.createElement("div");
  const bpm = 60; // TODO: External variable
  const bps = 60 / bpm;
  const fps = 60; // TODO: Some kind of deltaTime magic here?
  const velocity = beat.width / (fps * bps);
  const barNumber = sheet.length;
  const beatNumber = barNumber * 4;

  let x = 0;
  let currentBeat = 0;
  let score = 0;

  const notes = convertToStreamOfNotes(sheet);

  const dynamicTransform = positionX => `
    position: absolute;
    bottom: 0;
    left: 0;
    transform: translate3d(${positionX}px, 0, 0);
  `;

  let counter = 0;
  function update(deltaTime: number, activeKey: string) {
    // counter needs to be using delta time to adjust for frame drops
    counter = counter + deltaTime;

    // moving the sheet render
    x = x - velocity;
    sheetRenderer.setAttribute("style", dynamicTransform(x));

    // clears interval in case the song ends
    // we can use it to trigger end sequence
    if (currentBeat > beatNumber) {
      gameOver();
    } else {
      // incrementing the beat if no end condition reached
      currentBeat = Math.round(counter);

      // calculate if input is correct for the current note
      if (isCorrectKey(notes, activeKey, currentBeat)) {
        score = score + velocity;
      }
    }

    element.innerHTML = `
      <div class=${scoreStyles}>Current score: ${score}</div>
      <div class=${scoreStyles}>Current beat: ${Math.round(currentBeat)}</div>
    `;
  }

  document.body.appendChild(element);
  return {
    element,
    update
  };
}
