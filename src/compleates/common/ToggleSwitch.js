import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

function ToggleSwitch({ options, selected, onChange }) {
  return (
    <div className="col-sm-6 col-md-3 col-lg-3 btn-group btn-group-toggle col-12" data-bs-toggle="buttons" role="group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`btn ${selected === opt.value ? opt.colorClass : 'btn-outline-secondary'}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default ToggleSwitch;
