import React from "react";
import styles from "./ParameterPanel.module.css";

interface SelectControlProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export default function SelectControl({ label, value, options, onChange }: SelectControlProps) {
  return (
    <div className={styles.control}>
      <label className={styles.label}>{label}</label>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
