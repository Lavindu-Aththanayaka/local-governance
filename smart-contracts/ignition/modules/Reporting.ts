import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ReportingAndMultiSig", (m) => {
  const reporting = m.contract("Reporting");

  const initialSuperAdmins = [
    m.getAccount(0),
    m.getAccount(1),
    m.getAccount(2),
    m.getAccount(3),
    m.getAccount(4),
  ];

  const authorityMultiSig = m.contract("AuthorityMultiSig", [initialSuperAdmins, reporting]);

  // Transfer ownership of Reporting to AuthorityMultiSig
  m.call(reporting, "transferOwnership", [authorityMultiSig]);

  return { reporting, authorityMultiSig };
});