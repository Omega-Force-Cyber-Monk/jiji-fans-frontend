type FormatTwoDigitsParams = {
  num: number | string | undefined;
  allowZero?: boolean;
  allowNA?: boolean;
};

export const formatTwoDigits = ({
  num,
  allowZero = true,
  allowNA = true,
}: FormatTwoDigitsParams): string | undefined => {
    // console.log(num)
  if (typeof num === "number" || !isNaN(Number(num))) {
    const formattedNum = Number(num);
    return formattedNum.toString().padStart(2, "0");
  } else {
    return allowZero ? "00" : allowNA ? "N/A" : undefined;
  }
};
 