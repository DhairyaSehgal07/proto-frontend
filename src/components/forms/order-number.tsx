import React from 'react';

// Define the props interface
interface OrderNumberProps {
  name: string;
  type: string;
  gatePassNumber: number | undefined;
}

const OrderNumber: React.FC<OrderNumberProps> = ({ name, type, gatePassNumber }) => {
  const message = 'Please select a commodity to generate a gate pass number.';

  return (
    <div>
      <h1 className="text-lg font-bold">
        {gatePassNumber === undefined ? message : `${type} ${name} ${gatePassNumber}`}
      </h1>
    </div>
  );
};

export default OrderNumber;
