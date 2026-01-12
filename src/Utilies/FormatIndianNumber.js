function FormatIndianNumber(value) {
   if (value >= 10000000) {
    // Crore
    return (value / 10000000).toFixed(2) + "C";
  } else if (value >= 100000) {
    // Lakh
    return (value / 100000).toFixed(2) + "L";
  } else if (value >= 1000) {
    // Thousand
    return (value / 1000).toFixed(2) + "K";
  } else {
    return value.toString();
  }
}

export default FormatIndianNumber