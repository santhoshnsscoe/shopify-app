import { useState, useEffect } from "react";
import StepUI from "./UI/Step";
import { getLocalStorage, setLocalStorage } from "../utils/general";

export default function Setups() {
  const [setupData, setSetupData] = useState({
    showSetup: false,
    showSteps: true,
    currentStep: 0,
  });
  const totalSteps = 3;

  useEffect(() => {
    const setupData = getLocalStorage("setupData")
      ? JSON.parse(getLocalStorage("setupData") || "{}")
      : {
          showSetup: true,
          showSteps: true,
          currentStep: 0,
        };
    setSetupData(setupData);
  }, []);

  const updateShowSetup = (show: boolean) => {
    setSetupData((prev) => {
      const newSetupData = { ...prev, showSetup: show };
      setLocalStorage("setupData", JSON.stringify(newSetupData));
      return newSetupData;
    });
  };

  const updateShowSteps = (show: boolean) => {
    setSetupData((prev) => {
      const newSetupData = { ...prev, showSteps: show };
      setLocalStorage("setupData", JSON.stringify(newSetupData));
      return newSetupData;
    });
  };

  const updateCurrentStep = (step: number) => {
    setSetupData((prev) => {
      const newSetupData = { ...prev, currentStep: step };
      setLocalStorage("setupData", JSON.stringify(newSetupData));
      return newSetupData;
    });
  };

  if (!setupData.showSetup) {
    return "";
  }

  return (
    <s-section>
      <s-grid gap="base">
        <s-grid gap="small-200">
          <s-grid
            gridTemplateColumns="1fr auto auto"
            gap="small-300"
            alignItems="center"
          >
            <s-heading>Setup Guide</s-heading>
            <s-button
              accessibilityLabel="Dismiss Guide"
              variant="tertiary"
              tone="neutral"
              icon="x"
              onClick={() => updateShowSetup(false)}
            ></s-button>
            <s-button
              accessibilityLabel="Toggle setup guide"
              variant="tertiary"
              tone="neutral"
              icon={setupData.showSteps ? "chevron-up" : "chevron-down"}
              onClick={() => updateShowSteps(!setupData.showSteps)}
            ></s-button>
          </s-grid>
          <s-grid display={setupData.showSteps ? "auto" : "none"}>
            <s-paragraph>
              Use this personalized guide to get your store ready for the custom
              app features.
            </s-paragraph>
            <s-paragraph tone="neutral">
              {setupData.currentStep} out of {totalSteps} steps completed
            </s-paragraph>
          </s-grid>
        </s-grid>
        <s-box
          borderRadius="base"
          border="base"
          background="base"
          display={setupData.showSteps ? "auto" : "none"}
        >
          <StepUI
            title="Step 1: Setup your store"
            description="Setup your store"
            show={setupData.currentStep === 0 ? true : false}
            checked={setupData.currentStep > 0 ? true : false}
            step={0}
            updateStep={(step) => updateCurrentStep(step)}
          />
          <s-divider></s-divider>
          <StepUI
            title="Step 2: Setup your store"
            description="Setup your store"
            show={setupData.currentStep === 1 ? true : false}
            checked={setupData.currentStep > 1 ? true : false}
            step={1}
            updateStep={(step) => updateCurrentStep(step)}
          />
          <s-divider></s-divider>
          <StepUI
            title="Step 3: Setup your store"
            description="Setup your store"
            show={setupData.currentStep === 2 ? true : false}
            checked={setupData.currentStep > 2 ? true : false}
            step={2}
            updateStep={(step) => updateCurrentStep(step)}
          />
        </s-box>
      </s-grid>
    </s-section>
  );
}
