export default function returnOrderStatusReason(statusCode: number): string {
  switch (statusCode) {
    case 1:
      return "OK.";
    case 2:
      return "This Market does not currently allow guaranteed orders.";
    case 3:
      return "This Market is currently not available on the Trading Platform.";
    case 4:
      return "Limit Down.";
    case 5:
      return "Limit Up.";
    case 6:
      return "Oversize.";
    case 7:
      return "Oversize.";
    case 8:
      return "Below the minimum quantity.";
    case 9:
      return "This Market has expired.";
    case 10:
      return "Market Closed.";
    case 11:
      return "Market is Phone Only.";
    case 12:
      return "The Quantity, when divided by the market lot size, should be a whole number.";
    case 13:
      return "Market Suspended.";
    case 14:
      return "Trades on this market can not have linked Stop and/or Limit orders.";
    case 15:
      return "Market does not allow Stop orders.";
    case 16:
      return "Market does not allow orders to trigger against Our Price.";
    case 17:
      return "Market type must be Binary or Spread Bet.";
    case 18:
      return "Market is currently set to not trade on the web.";
    case 19:
      return "Market GTD Order Exposure Exceeded.";
    case 20:
      return "The Quantity decimal places exceed the maximum allowed for the market.";
    case 21:
      return "The expiry date/time should not be set with Good Till Cancelled orders.";
    case 22:
      return "A Guaranteed Stop Loss order must always be set to Good Till Cancelled.";
    case 23:
      return "A Guaranteed order cannot be a Limit order.";
    case 24:
      return "Stop Loss order must be guaranteed.";
    case 25:
      return "Trigger price is not correct given the order direction and type.";
    case 26:
      return "Order must be set to trigger against Our Price.";
    case 27:
      return "Oversize trade for Binary market.";
    case 28:
      return "When the order Quantity is within our size, the target type must be set to Our Price.";
    case 29:
      return "This Market is set to not allow clients to place trades.";
    case 30:
      return "Cannot open a new short position as the market is currently set to Long Only.";
    case 31:
      return "This account is not allowed to trade in the supplied currency.";
    case 32:
      return "This account is currently suspended.";
    case 33:
      return "This account is not open.";
    case 34:
      return "Cannot place guaranteed stop order.";
    case 35:
      return "The Quantity is below the minimum allowed for the Trading Academy account.";
    case 36:
      return "Cannot accept order that is not on yellow card.";
    case 37:
      return "Cannot amend trade or order that is not active.";
    case 38:
      return "Cannot trigger this order as it is not active.";
    case 39:
      return "Cannot reset order that has not triggered.";
    case 40:
      return "An Order in an If Done relationship must be of type trade.";
    case 41:
      return "An Order in an If Done relationship must be of type stop or limit.";
    case 42:
      return "Orders in an OCO relationship must be of type stop or limit.";
    case 43:
      return "The order currency must match the currency of the underlying.";
    case 44:
      return "The Market does not allow limited risk guaranteed orders to be placed.";
    case 45:
      return "A Guaranteed Order cannot be set to trigger against external price.";
    case 46:
      return "Orders in a closing stop/limit relationship must have opposing directions.";
    case 47:
      return "Cannot trade against market that has a bet per of zero.";
    case 48:
      return "A Linked order in an If Done relationship must have an amount less than or equal to the original order.";
    case 49:
      return "Trigger level does not conform to minimum distance requirements specified for the market.";
    case 50:
      return "Cannot close trade with triggered order.";
    case 51:
      return "Cannot fill this order as it is not active.";
    case 52:
      return "Cannot amend order that is not active.";
    case 53:
      return "Unable to calculate equity CFD commission due to missing or incorrect settings.";
    case 54:
      return "Order cannot be linked to other orders for the same link type.";
    case 55:
      return "Unable to calculate the guaranteed order premium due to missing or incorrect settings.";
    case 56:
      return "The Market must be of type: Binary.";
    case 57:
      return "All orders must be associated with the same trading account.";
    case 58:
      return "Trade to close is no longer open.";
    case 59:
      return "Speed Bump.";
    case 60:
      return "The Market must be of type: Cash.";
    case 61:
      return "The bid/offer price entered does not overlap the current bid/offer price.";
    case 62:
      return "The bid/offer price entered is not valid within the last three seconds.";
    case 63:
      return "Insufficient Funds.";
    case 64:
      return "The Market underlying currency is not supported by the trading account.";
    case 65:
      return "The Market must be of type: CFD.";
    case 66:
      return "Unable to add guaranteed stop loss order as the market does not have the necessary settings.";
    case 67:
      return "Supplied price is in an indicative state.";
    case 68:
      return "Supplied price is in an unavailable state.";
    case 69:
      return "The Clients account is currently suspended.";
    case 70:
      return "This Market does not allow orders to be linked in an OCO relationship.";
    case 71:
      return "This Market does not allow limit orders.";
    case 72:
      return "This Market does not allow orders to trigger against external price.";
    case 73:
      return "The total quantity of linked stop orders must not exceed opening order quantity.";
    case 74:
      return "The total quantity of linked limit orders must not exceed opening order quantity.";
    case 75:
      return "The total quantity of guaranteed stop orders must be equal to trade order quantity.";
    case 76:
      return "New position cannot be opened as the market is set to Close only.";
    case 77:
      return "Cannot create new position when closing specific order serial number(s).";
    case 78:
      return "The Total Margin Requirement limit has been exceeded.";
    case 79:
      return "The quantity will cause the account to exceed the market maximum limited risk order exposure.";
    case 80:
      return "The order target is set to trigger off the external price but the market prices out of hours.";
    case 81:
      return "Position below Web Min Size.";
    case 82:
      return "The trigger price is not valid for the market pricing rules.";
    case 83:
      return "The bid price is not valid for the market pricing rules.";
    case 84:
      return "Insufficient Funds.";
    case 85:
      return "Insufficient Funds.";
    case 86:
      return "Insufficient Funds.";
    case 87:
      return "Insufficient Funds.";
    case 88:
      return "Order has passed expired date/time.";
    case 89:
      return "Insufficient Funds.";
    case 90:
      return "Closing Price Used For Margin.";
    case 91:
      return "Closing Price Used For Margin.";
    case 92:
      return "ALERT! OBMS has triggered order as it was being loaded.";
    case 93:
      return "Closing Price Used For Margin.";
    case 94:
      return "Closing Price Used For Margin.";
    case 95:
      return "The offer price is not valid for the market pricing rules.";
    case 96:
      return "The expiry date/time should be provided with Good Till Date orders.";
    case 97:
      return "Closing Price Used For Margin.";
    case 98:
      return "Closing Price Used For Margin.";
    case 99:
      return "Closing Price Used For Margin.";
    case 100:
      return "Another order has closed trade.";
    case 101:
      return "Cancelled by client.";
    case 102:
      return "Order has been rejected.";
    case 103:
      return "Other OCO order has filled.";
    case 104:
      return "The trade was placed against the wrong trading account.";
    case 105:
      return "The trade was placed at an incorrect price.";
    case 106:
      return "The trade was placed against the wrong market.";
    case 107:
      return "The trade was placed twice.";
    case 108:
      return "The trade was placed with an incorrect quantity.";
    case 109:
      return "The expiry date/time should not be provided with Good For Day orders.";
    case 110:
      return "The Guaranteed order must always be set to trigger out of hours.";
    case 111:
      return "The Guaranteed order quantity cannot be increased.";
    case 112:
      return "The expiry date/time cannot be changed if order is Good For Day.";
    case 113:
      return "Cannot cancel a guaranteed stop loss order on a Limited Risk trade.";
    case 114:
      return "The order status must be set to one of the following: Triggered; Yellow Card.";
    case 115:
      return "Unable to calculate non-equity CFD commission due to missing or incorrect settings.";
    case 116:
      return "Dealer has triggered order.";
    case 117:
      return "Unable to determine a price when performing margin simulation for this instruction.";
    case 118:
      return "Unable to determine a price when performing margin simulation for this instruction.";
    case 119:
      return "Unable to determine a price when performing margin simulation for this instruction.";
    case 120:
      return "Unable to determine a price when performing margin simulation for this instruction.";
    case 121:
      return "Unable to determine a price when performing margin simulation for this instruction.";
    case 122:
      return "Unable to determine a price when performing margin simulation for this instruction.";
    case 123:
      return "Unable to determine a price when performing margin simulation for this instruction.";
    case 124:
      return "DMA Error.";
    case 125:
      return "Total Margin Requirement Limit has been exceeded.";
    case 126:
      return "Total Margin Requirement Limit has been exceeded.";
    case 127:
      return "Total Margin Requirement Limit has been exceeded.";
    case 128:
      return "Total Margin Requirement Limit has been exceeded.";
    case 129:
      return "Total Margin Requirement Limit has been exceeded.";
    case 130:
      return "A broker is not allowed to trade against this market via the client trade ticket.";
    case 131:
      return "This account is not allowed to trade against this market via the hedge ticket.";
    case 132:
      return "Referral Spread.";
    case 133:
      return "This Market does not support the trading client type.";
    case 134:
      return "OCO link can only be between the following order pairs: Buy Limit/Stop; Buy/Sell Limit; Sell Limit/Stop; Buy/Sell Stop.";
    case 135:
      return "Account academy status cannot be set to New Account.";
    case 136:
      return "Market rollover date has passed.";
    case 137:
      return "Market last trading date has passed.";
    case 138:
      return "Quantity exceeds the maximum allowed for the market.";
    case 139:
      return "Market expiry has passed.";
    case 140:
      return "Watch List Client.";
    case 141:
      return "Watch List Client.";
    case 142:
      return "Client is currently not allowed to accept new business.";
    case 143:
      return "Client is currently not allowed online access.";
    case 144:
      return "Client is currently not allowed to trade online.";
    case 145:
      return "Account is currently not allowed to accept new business.";
    case 146:
      return "Account is currently not allowed online access.";
    case 147:
      return "Account is currently not allowed to trade online.";
    case 148:
      return "Gap Tolerance Exceeded.";
    case 149:
      return "Cannot close existing positions on different books.";
    case 150:
      return "Trigger prices of orders in If Done link must be valid.";
    case 151:
      return "Market Quote Order.";
    case 152:
      return "Order(s) for same account/market must be approved in the order they triggered.";
    case 153:
      return "ALERT! OBMS has triggered order at different level to current.";
    case 154:
      return "Other OCO order has been rejected.";
    case 155:
      return "ALERT! OBMS has triggered order due to problem filling it.";
    case 156:
      return "Cannot reject order that has not triggered.";
    case 157:
      return "Auto Closeout.";
    case 158:
      return "Price tolerance exceeded.";
    case 159:
      return "We are unable to process this request due to a failed Customer Knowledge Assessment, please contact Customer Services.";
    case 160:
      return "Market unavailable due to local regulations or account restrictions.";
    case 161:
      return "Order structure is not supported for MetaTrader enabled accounts.";
    case 162:
      return "Order quantity is not a valid increment size.";
    case 163:
      return "Unable to calculate FX commission due to missing or incorrect settings.";
    case 164:
      return "Unable to calculate CFD commission due to missing or incorrect settings.";
    case 165:
      return "No managed accounts in allocation profile.";
    case 166:
      return "Bad market increment size setting.";
    case 167:
      return "An existing managed trade allocation is required.";
    case 168:
      return "All managed trades resulted in red cards.";
    case 169:
      return "Watch List Client.";
    case 170:
      return "Watch List Client.";
    case 171:
      return "Unable to calculate US Dollar Notional commission due to missing or incorrect arguments.";
    case 172:
      return "Cannot place associated order with no net position.";
    case 173:
      return "Cannot modify position with triggered associated order.";
    case 174:
      return "Max Position Exceeded.";
    case 175:
      return "US Standard Lot settings are missing.";
    case 176:
      return "Underlying step margin settings could not be resolved.";
    case 177:
      return "Market is DMA.";
  }
}
