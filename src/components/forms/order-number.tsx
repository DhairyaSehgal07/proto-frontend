import React from 'react';

// Define the props interface
interface OrderNumberProps {
  name: string;
  type: string;
}

const OrderNumber: React.FC<OrderNumberProps> = ({ name, type }) => {
  return (
    <div>
      <h1 className="text-lg font-bold">
        {type} {name} 5
      </h1>
    </div>
  );
};

export default OrderNumber;
