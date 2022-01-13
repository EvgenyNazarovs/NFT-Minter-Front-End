import React from "react";
import { animated, useSpring } from "react-spring";

const Loading = () => {
  const styles = useSpring({
    loop: true,
    to: [
      { opacity: 1, color: "#ffaaee" },
      { opacity: 0, color: "rgb(14,26,19)" },
    ],
    from: { opacity: 0, color: "red" },
  });
  return (
    <button className="cta-button mint-button" disabled>
      <animated.div style={styles}>MINTING</animated.div>
    </button>
  );
};

export default Loading;
