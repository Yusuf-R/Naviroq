"use client";
import Nav from "@/components/Home/Nav/Nav";

function EntryLayout({ children }) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
}

export default EntryLayout;
