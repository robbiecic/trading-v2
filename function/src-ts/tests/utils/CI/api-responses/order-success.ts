export const orderCloseSuccessResponse = {
  Status: 1,
  StatusReason: 1,
  OrderId: 882672565,
  Orders: [
    {
      OrderId: 882672565,
      StatusReason: 1,
      Status: 9,
      OrderTypeId: 1,
      Price: 0.67873,
      Quantity: 10000,
      TriggerPrice: 0,
      CommissionCharge: 22.58,
      IfDone: [] as any[],
      GuaranteedPremium: 22.58,
      OCO: null as any,
      AssociatedOrders: {
        Stop: null as any,
        Limit: null as any,
      },
      Associated: false,
    },
  ],
  Quote: null as any,
  Actions: [
    {
      ActionedOrderId: 882599603,
      ActioningOrderId: 882672565,
      Quantity: 10000,
      ProfitAndLoss: 22.58,
      ProfitAndLossCurrency: "AUD",
      OrderActionTypeId: 2,
    },
  ],
  ErrorMessage: null as any,
};
