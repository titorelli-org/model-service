export type ModelType = "logistic-regression";

export type ReasonTypes = "classifier";

export type Labels = "spam" | "ham";

export type LabeledExample = {
  label: Labels;
  text: string;
};

export type UnlabeledExample = {
  text: string;
};

export type StemmerLanguage =
  | "es"
  | "fa"
  | "fr"
  | "it"
  | "nl"
  | "no"
  | "pt"
  | "ru"
  | "sv";

export type Prediction = {
  label: Labels;
  confidence?: number;
  reason?: ReasonTypes;
};
