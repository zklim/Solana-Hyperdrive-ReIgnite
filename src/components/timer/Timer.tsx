import React, { useEffect, useState } from "react";

interface Props {
  endDate: number;
}

interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

const Timer = ({ endDate }: Props) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  function calculateTimeLeft() {
    const difference = +new Date(endDate * 1000) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  const timerComponents: JSX.Element[] = [];
  Object.keys(timeLeft).forEach((interval) => {
    const key = interval as keyof TimeLeft;

    if (!(timeLeft as any)[key]) {
      return;
    }

    timerComponents.push(
      <span key={interval}>
        {(timeLeft as any)[key]} {interval}{" "}
      </span>
    );
  });

  return (
    <div>
      {timerComponents.length ? timerComponents : <span>Time is up!</span>}
    </div>
  );
};

export default Timer;
