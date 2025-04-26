import * as uuid from "uuid";

export const getUUIDStringFromText = (text: string) => {
  const nsUUID = uuid.v5(
    "https://text.api.titorelli.ru/text",
    "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  );

  return uuid.v5(text, nsUUID);
};
