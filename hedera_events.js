const { TransactionType } = require("./enums");

const event_abi = {
  [TransactionType.TX_TYPE_REGISTERED]:    ["event DomainRegistered(address indexed owner, string domain, string ipv4, uint256 expiration)"],
  [TransactionType.TX_TYPE_RENEWED]:       ["event DomainRenewed(address indexed owner, string domain, string ipv4, uint256 expiration)"],
  [TransactionType.TX_TYPE_TRANSFER_INIT]: ["event DomainTransferInit(string domain, address indexed from, address indexed to)"],
  [TransactionType.TX_TYPE_TRANSFERRED]:   ["event DomainTransferred(address indexed owner, string domain, string ipv4, uint256 expiration)"]
};

module.exports = { event_abi };