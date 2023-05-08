export const orderQuoteResponse = {
  Status: 3,
  StatusReason: 96,
  OrderId: 0,
  Orders: [
    {
      OrderId: 0,
      StatusReason: 59,
      Status: 8,
      OrderTypeId: 1,
      Price: 0.67878,
      Quantity: 10000,
      TriggerPrice: 0,
      CommissionCharge: 0,
      IfDone: [] as any[],
      GuaranteedPremium: 0,
      OCO: null as any,
      AssociatedOrders: {
        Stop: null as any,
        Limit: null as any,
      },
      Associated: false,
    },
  ],
  Quote: {
    QuoteId: 404040391,
    Status: 2,
    StatusReason: 7,
  },
  Actions: [] as any[],
  ErrorMessage: null as any,
};
