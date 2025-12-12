import React from "react";
import { Tabs } from "antd";

import SalesExecutivePayroll from "./SalesExecutivePayroll";
import PayrollHistory from "./SalesEPayment";

import WarehousePayroll from "./WarehousePayroll";
import WarehousePayrollHistory from "./WarehousePayment";

const PayrollTabs = () => {
  const salesTabs = [
    {
      label: "Generate Payroll",
      key: "sales-generate",
      children: <SalesExecutivePayroll />,
    },
    {
      label: "Payroll History",
      key: "sales-history",
      children: <PayrollHistory />,
    }
  ];

  const warehouseTabs = [
    {
      label: "Generate Payroll",
      key: "warehouse-generate",
      children: <WarehousePayroll />,
    },
    {
      label: "Payroll History",
      key: "warehouse-history",
      children: <WarehousePayrollHistory />,
    }
  ];

  const mainTabs = [
    {
      label: "Sales Executives",
      key: "sales",
      children: <Tabs items={salesTabs} />,
    },
    {
      label: "Warehouse Workers",
      key: "warehouse",
      children: <Tabs items={warehouseTabs} />,
    }
  ];

  return (
    <Tabs
      defaultActiveKey="sales"
      centered
      items={mainTabs}
    />
  );
};

export default PayrollTabs;
