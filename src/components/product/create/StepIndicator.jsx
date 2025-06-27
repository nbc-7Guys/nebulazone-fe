import React from 'react';

const StepIndicator = ({ currentStep }) => {
    const steps = [
        { key: 'category', label: '카테고리', number: 1 },
        { key: 'product', label: '제품 선택', number: 2 },
        { key: 'form', label: '정보 입력', number: 3 }
    ];

    const getStepIndex = (step) => steps.findIndex(s => s.key === step);
    const currentIndex = getStepIndex(currentStep);

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "40px"
        }}>
            {steps.map((step, index) => (
                <div key={step.key} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: currentIndex >= index ? "#38d39f" : "#e2e8f0",
                        color: currentIndex >= index ? "#fff" : "#9ca3af",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "600"
                    }}>
                        {step.number}
                    </div>
                    {index < steps.length - 1 && (
                        <div style={{
                            width: "60px",
                            height: "2px",
                            backgroundColor: currentIndex > index ? "#38d39f" : "#e2e8f0",
                            margin: "0 16px"
                        }} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default StepIndicator;