import React from "react";

const CardContainer = ({ children }: any) => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto w-full max-w-3xl md:max-w-5xl lg:max-w-6xl space-y-4">
        {children}
      </div>
    </div>
  );
};

export default CardContainer;
