import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { officerContracts } from "../data/officerContracts";
import { AddContractPaymentView } from "./AddContractPaymentView";

describe("AddContractPaymentView", () => {
  it("renders only the payment transaction fields from the mapping specification", () => {
    const markup = renderToStaticMarkup(
      <AddContractPaymentView
        contract={officerContracts[0]}
        onSave={vi.fn()}
      />,
    );

    expect(markup).toContain("Inherited Contract Context");
    expect(markup).toContain("Payment Type");
    expect(markup).toContain("1st / Interim");
    expect(markup).toContain("Retention Withholding");
    expect(markup).toContain("Payment Date");
    expect(markup).toContain("Payment Reference / Voucher No.");
    expect(markup).toContain("Calculated Contract Balance");
    expect(markup).toContain("Updated Total Paid");
    expect(markup).toContain("Remaining Balance");
    expect(markup).not.toContain("Project Name</label>");
    expect(markup).not.toContain("Supplier / Contractor</label>");
  });
});
