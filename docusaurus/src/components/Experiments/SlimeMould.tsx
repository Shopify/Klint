import React from "react";
import { Klint, useKlint, type KlintContext } from "@shopify/klint";

class Mold {
  x: number;
  y: number;
  r: number;
  heading: number;
  vx: number;
  vy: number;
  rotAngle: number;
  stop: boolean;
  sensorDist: number;
  rSensorPos: { x: number; y: number };
  lSensorPos: { x: number; y: number };
  fSensorPos: { x: number; y: number };
  sensorAngle: number;

  constructor(K: KlintContext) {
    // Mold variables
    this.x = K.width / 2 + (Math.random() * K.width - K.width / 2);
    this.y = K.height / 2 + (Math.random() * 200 - 100);
    this.r = 10;

    this.heading = (Math.PI / 180) * Math.floor(Math.random() * 360);
    this.vx = Math.cos(this.heading);
    this.vy = Math.sin(this.heading);
    this.rotAngle = (Math.PI / 180) * 60;

    // Sensor variables
    this.rSensorPos = K.createVector(0, 0);
    this.lSensorPos = K.createVector(0, 0);
    this.fSensorPos = K.createVector(0, 0);
    this.sensorAngle = (Math.PI / 180) * 45;
    this.sensorDist = this.r * 3;
  }

  update(K: KlintContext, pixels: Uint8ClampedArray) {
    this.vx = Math.cos(this.heading);
    this.vy = Math.sin(this.heading);

    // Using % Modulo expression to wrap around the canvas
    this.x = (this.x + this.vx * this.r + K.width) % K.width;
    this.y = (this.y + this.vy * this.r + K.height) % K.height;

    // Get 3 sensor positions based on current position and heading
    this.getSensorPos(K, this.rSensorPos, this.heading + this.sensorAngle);
    this.getSensorPos(K, this.lSensorPos, this.heading - this.sensorAngle);
    this.getSensorPos(K, this.fSensorPos, this.heading);

    // Get indices of the 3 sensor positions and get the color values from those indices
    let index: number, l: number, r: number, f: number;
    index =
      4 * Math.floor(this.rSensorPos.y) * K.width +
      4 * Math.floor(this.rSensorPos.x);
    r = pixels[index];

    index =
      4 * Math.floor(this.lSensorPos.y) * K.width +
      4 * Math.floor(this.lSensorPos.x);
    l = pixels[index];

    index =
      4 * Math.floor(this.fSensorPos.y) * K.width +
      4 * Math.floor(this.fSensorPos.x);
    f = pixels[index];

    // Compare values of f, l, and r to determine movement
    if (f > l && f > r) {
      this.heading += 0;
    } else if (f < l && f < r) {
      if (Math.random() < 0.9) {
        this.heading += this.rotAngle;
      } else {
        this.heading -= this.rotAngle;
      }
    } else if (l > r) {
      this.heading += -this.rotAngle;
    } else if (r > l) {
      this.heading += this.rotAngle;
    }
  }

  display(K: KlintContext) {
    K.noStroke();
    K.fillColor(K.Color.oklch(0.5, 0.5, (K.frame + 200) % 255));
    K.circle(this.x, this.y, this.r * 2, this.r * 2);
  }

  getSensorPos(
    K: KlintContext,
    sensor: { x: number; y: number },
    angle: number
  ) {
    sensor.x = (this.x + this.sensorDist * Math.cos(angle) + K.width) % K.width;
    sensor.y =
      (this.y + this.sensorDist * Math.sin(angle) + K.height) % K.height;
  }
}

export default function SlimeMould() {
  const { context, useDev } = useKlint();
  useDev();
  const moulds = [];
  const numMolds = 10000;

  const setup = (K: KlintContext) => {
    K.noStroke();
    K.background("black");

    for (let i = 0; i < numMolds; i++) {
      moulds[i] = new Mold(K);
    }
  };

  const draw = (K: KlintContext) => {
    K.background("#00000022");
    const imageData = K.getImageData(0, 0, K.width, K.height).data;

    for (let i = 0; i < numMolds; i++) {
      moulds[i].update(K, imageData);
      moulds[i].display(K);
    }
  };

  return (
    <Klint context={context} setup={setup} draw={draw} options={{ fps: 120 }} />
  );
}
