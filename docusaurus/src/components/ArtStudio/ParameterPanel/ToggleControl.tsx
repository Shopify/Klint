import React from "react";
import styles from "./ParameterPanel.module.css";

interface ToggleControlProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function ToggleControl({ label, value, onChange }: ToggleControlProps) {
  return (
    <div className={styles.control}>
      <div className={styles.toggleRow}>
        <label className={styles.label}>{label}</label>
        <button
          className={`${styles.toggle} ${value ? styles.toggleOn : ""}`}
          onClick={() => onChange(!value)}
        >
          <span className={styles.toggleKnob} />
        </button>
      </div>
    </div>
  );
}
