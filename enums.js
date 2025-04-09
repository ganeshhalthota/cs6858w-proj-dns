const TransactionType = Object.freeze({
  TX_TYPE_REGISTERED: 0,
  TX_TYPE_RENEWED: 1,
  TX_TYPE_TRANSFER_INIT: 2,
  TX_TYPE_TRANSFERRED: 3,
});

module.exports = { TransactionType };