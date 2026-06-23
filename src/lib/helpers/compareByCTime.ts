// export interface DateObject {
//   date: () => number;
//   month: () => number;
//   year: () => number;
// }

// export const dateFormaterFunc = (date: DateObject): string =>
//   `${date.date()}-${date.month() + 1}-${date.year()}`;

export const compareByCTime = ({
  preTime,
  todayHidden,
}: {
  preTime?: string;
  todayHidden?: boolean;
}) => {
  // Handle undefined, null, or empty string
  if (!preTime || typeof preTime !== "string") return "Just Now";
  
  const createdAtDate = new Date(preTime);
  if (Number.isNaN(createdAtDate.getTime())) return "Just Now";
  const currentTime = new Date();

  // Calculate the difference in milliseconds
  const differenceInMs = currentTime.getTime() - createdAtDate.getTime();
  const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));

  // Check if the date is today
  const isToday = createdAtDate.toDateString() === currentTime.toDateString();
  if (differenceInMinutes < 1) {
    return "Just Now";
  } else if (isToday) {
    if (todayHidden) {
      return createdAtDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return (
        "Today" +
        " " +
        createdAtDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  } else if (differenceInMinutes < 60) {
    return `${differenceInMinutes} min ago`;
  } else if (differenceInMinutes < 1440) {
    return `${Math.floor(differenceInMinutes / 60)} hour ago`;
  } else if (differenceInMinutes < 10080) {
    // For messages within the last week, show day and time
    const dayName = createdAtDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const time = createdAtDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dayName}, ${time}`;
  } else if (differenceInMinutes < 43800) {
    return `${Math.floor(differenceInMinutes / 10080)} week ago`;
  } else if (differenceInMinutes < 525600) {
    return `${Math.floor(differenceInMinutes / 43800)} month ago`;
  } else {
    return `${Math.floor(differenceInMinutes / 525600)} year ago`;
  }
};
