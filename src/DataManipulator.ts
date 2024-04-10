import { ServerRespond } from './DataStreamer';

export interface Row {
  //ensure generateRow function returns object corresponding to schema of table in Graph component
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}


export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]): Row {
    //compute prices properly
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;
    //compute ratio using both prices
    const ratio = priceABC / priceDEF;
    /* set lower and upper bounds (±10% of 12-month historical average ratio)
     * as a smaller range between bounds, the ±5% value promotes more conservative alerting behaviour
     * (the alert is triggered more frequently)
     */
    const upperBound = 1 + 0.10;
    const lowerBound = 1 - 0.10;
    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
      serverRespond[0].timestamp : serverRespond[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      //determine trigger alert
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
    };
  }
}
