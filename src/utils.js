function format_tx_id(input) {
  // Replace '@' with '-'
  let formatted = input.replace("@", "-");

  // Replace the last '.' with '-'
  formatted = formatted.replace(/\.(?=[^\.]*$)/, "-");

  return formatted;
}

function is_future_time(epochStr) {
  const inputTime = parseInt(epochStr, 10);
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

  if (isNaN(inputTime))
    return false;

  return inputTime > currentTime;
}


module.exports = { format_tx_id , is_future_time};