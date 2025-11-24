"use client";

import React, { createContext, useContext } from "react";

type Messages = Record<string, string>;

type I18nContextValue = {
  locale: string;
  messages: Messages;
};

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  messages: {},
});

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function Trans({
  id,
  message,
  children,
}: {
  id?: string;
  message?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { messages } = useContext(I18nContext);
  const resolved =
    (id && messages[id]) ||
    (typeof message === "string" ? message : undefined) ||
    (typeof children === "string" ? children : undefined) ||
    id ||
    null;
  return <>{resolved}</>;
}

export function useLingui() {
  const ctx = useContext(I18nContext);
  return {
    i18n: {
      _: (m: string) => ctx.messages[m] || m,
      locale: ctx.locale,
    },
  };
}
