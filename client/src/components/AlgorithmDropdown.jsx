import React, { useState } from "react";
import styles from "./AlgorithmDropdown.module.scss";

function AlgorithmDropdown({ setAlgorithm }) {
  const options = ["random", "dfs", "prim", "kruskal", "growing-tree"];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setAlgorithm(option);
    setIsOpen(false);
  };

  // const handleChange = (event) => {
  //   setAlgorithm(event.target.value);
  // };

  return (
    <div className={styles.select_wrapper}>
      <div
        className={styles.select_element}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {selectedOption}
      </div>
      {isOpen && (
        <ul className={styles.select_options}>
          {options.map((option, index) => (
            <li key={index} onClick={() => handleOptionClick(option)}>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>

    // <div className={styles.algorithm}>
    //   <label className={styles.algorithm_label} htmlFor="algorithm">
    //     Choose Algorithm:{" "}
    //   </label>
    //   <select
    //     className={styles.algorithm_dropdown}
    //     id="algorithm"
    //     onChange={handleChange}
    //   >
    //     <option value="random">Random</option>
    //     <option value="dfs">Depth-First Search</option>
    //     <option value="prim">Prim's Algorithm</option>
    //     <option value="kruskal">Kruskal's Algorithm</option>
    //     <option value="growing-tree">Growing Tree</option>
    //   </select>
    // </div>
  );
}

export default AlgorithmDropdown;
