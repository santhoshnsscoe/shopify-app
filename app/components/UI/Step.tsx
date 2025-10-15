import { useState } from "react";

export default function StepUI({
  title,
  description,
  show,
  children,
  checked,
  updateStep,
  step=0,
}: {
  title: string;
  description: string;
  show: boolean;
  children?: React.ReactNode;
  checked: boolean;
  updateStep: (step: number) => void;
  step?: number;
}) {
  const [showStep, setShowStep] = useState(show || false);

  return (
    <s-box>
      <s-grid gridTemplateColumns="1fr auto" gap="base" padding="small">
        <s-checkbox
          label={title}
          checked={checked}
          disabled={!show}
          onChange={() => updateStep(checked ? step : step + 1)}
        ></s-checkbox>
        <s-button
          accessibilityLabel={`Toggle ${title}`}
          variant="tertiary"
          icon={showStep ? "chevron-up" : "chevron-down"}
          onClick={() => {
            setShowStep(!showStep);
          }}
        ></s-button>
      </s-grid>
      <s-box
        padding="small"
        paddingBlockStart="none"
        display={showStep ? "auto" : "none"}
      >
        <s-box padding="base" background="subdued" borderRadius="base">
          <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
            <s-grid gap="small-200">
              <s-paragraph>{description}</s-paragraph>
              {children}
            </s-grid>
          </s-grid>
        </s-box>
      </s-box>
    </s-box>
  );
}
