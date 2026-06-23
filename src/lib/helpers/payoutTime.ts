type PayoutStatus = {
  isOpen: boolean;
  nextOpenDate: Date;
  nextCloseDate: Date;
  hoursRemaining: number;
  minutesRemaining: number;
};

export function getPayoutStatus(): PayoutStatus {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const createWindow = (y: number, m: number, day: number) => {
    const open = new Date(y, m, day, 0, 0, 0);
    const close = new Date(open.getTime() + 48 * 60 * 60 * 1000); // 48h
    return { open, close };
  };

  const windows = [
    createWindow(year, month, 13),
    createWindow(year, month, 27),
    createWindow(
      month === 11 ? year + 1 : year,
      month === 11 ? 0 : month + 1,
      13
    ),
  ];

  let isOpen = false;
  let nextOpenDate = windows[0].open;
  let nextCloseDate = windows[0].close;

  for (const window of windows) {
    if (now >= window.open && now <= window.close) {
      isOpen = true;
      nextOpenDate = window.open;
      nextCloseDate = window.close;
      break;
    }

    if (now < window.open) {
      nextOpenDate = window.open;
      nextCloseDate = window.close;
      break;
    }
  }

  const targetTime = isOpen ? nextCloseDate : nextOpenDate;

  const diff = Math.max(targetTime.getTime() - now.getTime(), 0);

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const hoursRemaining = Math.floor(totalMinutes / 60);
  const minutesRemaining = totalMinutes % 60;

  return {
    isOpen,
    nextOpenDate,
    nextCloseDate,
    hoursRemaining,
    minutesRemaining,
  };
}