import React, { useState } from "react";

const tabs = ["CLUBS", "Football Jerseys", "Adicolor"];

const TabButtons: React.FC = () => {
  const [selected, setSelected] = useState<string>("CLUBS");

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {tabs.map((tab) => {
        const isSelected = tab === selected;
        return (
          <button
            key={tab}
            onClick={() => setSelected(tab)}
            style={{
              backgroundColor: isSelected ? "#000" : "#fff",
              color: isSelected ? "#fff" : "#000",
              border: "1px solid #000",
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: isSelected ? "600" : "400",
              transition: "background-color 0.3s, color 0.3s",
            }}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <TabButtons />
    </div>
  );
};

export default App;
