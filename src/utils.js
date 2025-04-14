function format_tx_id(input) {
  // Replace '@' with '-'
  let formatted = input.replace("@", "-");

  // Replace the last '.' with '-'
  formatted = formatted.replace(/\.(?=[^\.]*$)/, "-");

  return formatted;
}

module.exports = { format_tx_id };