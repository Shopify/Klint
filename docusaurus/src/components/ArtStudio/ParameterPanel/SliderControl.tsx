import React from "react";
import styles from "./ParameterPanel.module.css";

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export default function SliderControl({ label, value, min, max, step, onChange }: SliderControlProps) {
  return (
    <div className={styles.control}>
      <div className={styles.controlHeader}>
        <label className={styles.label}>{label}</label>
        <span className={styles.value}>{typeof value === "number" ? (Number.isInteger(step) ? value : value.toFixed(2)) : value}</span>
      </div>
      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}
