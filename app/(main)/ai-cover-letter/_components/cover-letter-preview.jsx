"use client";

import MDEditor from "@uiw/react-md-editor";

const CoverLetterPreview = ({ content }) => {
  const safeContent = typeof content === "string" ? content : "";

  return (
    <div className="py-4">
      <MDEditor value={safeContent} preview="preview" height={700} />
    </div>
  );
};

export default CoverLetterPreview;
