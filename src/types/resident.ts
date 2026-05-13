export type ResidentReportStatus = "OVERDUE" | "PENDING" | "UP_TO_DATE";

export type ResidentReportItem = {
  id: string;
  user: {
    name: string;
    email: string;
  };
  apartment: {
    number: string;
    condominium: {
      id: string;
      name: string;
    };
  };
  totalDebt: number;
  totalPaid: number;
  overdue: number;
  hasDebt: boolean;
  status: ResidentReportStatus;
};
